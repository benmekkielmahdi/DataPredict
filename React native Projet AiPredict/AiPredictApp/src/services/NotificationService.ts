import { Platform, Alert } from 'react-native';

// Safe wrapper to prevent crashing in Expo Go where Native Modules are missing
let messaging: any;
try {
    require('@react-native-firebase/app'); // Explicitly ensuring app module is loaded
    messaging = require('@react-native-firebase/messaging').default;
} catch (e) {
    console.warn("Firebase Messaging Native Module not found. Notifications will not work in Expo Go. Use a Development Build.");
}

const isFirebaseAvailable = !!messaging && Platform.OS !== 'web';

export async function requestUserPermission() {
    if (!isFirebaseAvailable) {
        console.log('[NotificationService] Skipping permission request (Web or Expo Go)');
        return false;
    }

    try {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
            return true;
        }
    } catch (error) {
        console.error('Permission request failed', error);
    }
    return false;
}

export async function subscribeToUserTopic(userId: string | number) {
    if (!isFirebaseAvailable) return;

    try {
        // Sanitize topic name (Firebase topics must match regex: [a-zA-Z0-9-_.~%]+)
        const topic = `user_${userId}`.replace(/[^a-zA-Z0-9-_.~%]/g, '_');
        await messaging().subscribeToTopic(topic);
        console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
        console.error('Subscription failed', error);
    }
}

export async function unsubscribeFromUserTopic(userId: string | number) {
    if (!isFirebaseAvailable) return;

    try {
        const topic = `user_${userId}`.replace(/[^a-zA-Z0-9-_.~%]/g, '_');
        await messaging().unsubscribeFromTopic(topic);
        console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
        console.error('Unsubscription failed', error);
    }
}

export function setupForegroundListener() {
    if (!isFirebaseAvailable) return () => { };

    try {
        return messaging().onMessage(async (remoteMessage: any) => {
            console.log('Notification received in foreground!', remoteMessage);

            const title = remoteMessage.notification?.title || 'New Notification';
            const body = remoteMessage.notification?.body || '';
            const data = remoteMessage.data || {};
            const type = data.type || 'info';

            // Save notification to storage
            const { NotificationStorage } = require('./NotificationStorageService');
            await NotificationStorage.saveNotification({
                title,
                body,
                type,
                data,
            });

            // Emit event to update NotificationScreen
            const { DeviceEventEmitter } = require('react-native');
            DeviceEventEmitter.emit('REFRESH_NOTIFICATIONS');

            // Show Alert to user
            Alert.alert(title, body);
        });
    } catch (error) {
        console.error('Failed to setup notification listener', error);
        return () => { };
    }
}
