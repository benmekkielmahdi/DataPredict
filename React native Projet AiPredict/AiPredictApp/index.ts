import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// Setup background notification handler (only for native platforms)
if (Platform.OS !== 'web') {
    try {
        const messaging = require('@react-native-firebase/messaging').default;
        const { NotificationStorage } = require('./src/services/NotificationStorageService');

        messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
            console.log('Message handled in the background!', remoteMessage);

            const title = remoteMessage.notification?.title || 'New Notification';
            const body = remoteMessage.notification?.body || '';
            const data = remoteMessage.data || {};
            const type = data.type || 'info';

            // Save notification to storage
            await NotificationStorage.saveNotification({
                title,
                body,
                type,
                data,
            });
        });
    } catch (error) {
        console.warn('Firebase messaging not available:', error);
    }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
