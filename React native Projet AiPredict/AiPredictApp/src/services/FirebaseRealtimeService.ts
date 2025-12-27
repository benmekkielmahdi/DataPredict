import { Platform } from 'react-native';

// Safe wrapper for Firebase Realtime Database
let database: any;
try {
    require('@react-native-firebase/app');
    database = require('@react-native-firebase/database').default;
} catch (e) {
    console.warn("Firebase Database Native Module not found. Use a Development Build.");
}

const isFirebaseAvailable = !!database && Platform.OS !== 'web';

export interface FirebaseNotification {
    title: string;
    body: string;
    timestamp: number;
    read: boolean;
    idUser: number | string;
    data?: {
        type?: string;
        datasetId?: string;
        mode?: string;
        selectedCount?: string;
        totalCount?: string;
        accuracy?: string;
        dataset?: string;
        modelName?: string;
        [key: string]: any;
    };
}

export interface FirebaseNotificationWithId extends FirebaseNotification {
    id: string;
}

/**
 * Subscribe to real-time notifications for a specific user (initial load only)
 * @param userId - The user ID to listen for notifications
 * @param onNotificationsUpdate - Callback when notifications change
 * @param limit - Number of notifications to load
 * @returns Unsubscribe function
 */
export function subscribeToUserNotifications(
    userId: number | string,
    onNotificationsUpdate: (notifications: FirebaseNotificationWithId[]) => void,
    limit: number = 20
): () => void {
    if (!isFirebaseAvailable) {
        console.warn('[FirebaseRealtimeService] Database not available');
        return () => { };
    }

    try {
        const notificationsRef = database()
            .ref(`notifications/user_${userId}`)
            .orderByChild('timestamp')
            .limitToLast(limit);

        const listener = notificationsRef.on('value', (snapshot: any) => {
            const data = snapshot.val();

            if (!data) {
                onNotificationsUpdate([]);
                return;
            }

            // Convert Firebase object to array
            const notificationsArray: FirebaseNotificationWithId[] = Object.entries(data).map(
                ([id, notification]: [string, any]) => ({
                    id,
                    ...notification,
                })
            );

            // Sort by timestamp (newest first)
            notificationsArray.sort((a, b) => b.timestamp - a.timestamp);

            console.log(`[FirebaseRealtimeService] Loaded ${notificationsArray.length} notifications for user_${userId}`);
            onNotificationsUpdate(notificationsArray);
        });

        // Return unsubscribe function
        return () => {
            notificationsRef.off('value', listener);
            console.log(`[FirebaseRealtimeService] Unsubscribed from user_${userId} notifications`);
        };
    } catch (error) {
        console.error('[FirebaseRealtimeService] Failed to subscribe to notifications', error);
        return () => { };
    }
}

/**
 * Load more notifications (pagination)
 * @param userId - The user ID
 * @param beforeTimestamp - Load notifications before this timestamp
 * @param limit - Number of notifications to load
 * @returns Array of notifications
 */
export async function loadMoreNotifications(
    userId: number | string,
    beforeTimestamp: number,
    limit: number = 20
): Promise<FirebaseNotificationWithId[]> {
    if (!isFirebaseAvailable) {
        console.warn('[FirebaseRealtimeService] Database not available');
        return [];
    }

    try {
        const snapshot = await database()
            .ref(`notifications/user_${userId}`)
            .orderByChild('timestamp')
            .endBefore(beforeTimestamp)
            .limitToLast(limit)
            .once('value');

        const data = snapshot.val();

        if (!data) {
            return [];
        }

        // Convert Firebase object to array
        const notificationsArray: FirebaseNotificationWithId[] = Object.entries(data).map(
            ([id, notification]: [string, any]) => ({
                id,
                ...notification,
            })
        );

        // Sort by timestamp (newest first)
        notificationsArray.sort((a, b) => b.timestamp - a.timestamp);

        console.log(`[FirebaseRealtimeService] Loaded ${notificationsArray.length} more notifications`);
        return notificationsArray;
    } catch (error) {
        console.error('[FirebaseRealtimeService] Failed to load more notifications', error);
        return [];
    }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
    userId: number | string,
    notificationId: string
): Promise<void> {
    if (!isFirebaseAvailable) return;

    try {
        await database()
            .ref(`notifications/user_${userId}/${notificationId}/read`)
            .set(true);
        console.log(`[FirebaseRealtimeService] Marked notification ${notificationId} as read`);
    } catch (error) {
        console.error('[FirebaseRealtimeService] Failed to mark as read', error);
    }
}

/**
 * Delete a single notification
 */
export async function deleteNotification(
    userId: number | string,
    notificationId: string
): Promise<void> {
    if (!isFirebaseAvailable) return;

    try {
        await database()
            .ref(`notifications/user_${userId}/${notificationId}`)
            .remove();
        console.log(`[FirebaseRealtimeService] Deleted notification ${notificationId}`);
    } catch (error) {
        console.error('[FirebaseRealtimeService] Failed to delete notification', error);
    }
}

/**
 * Delete all notifications for a user
 */
export async function deleteAllNotifications(userId: number | string): Promise<void> {
    if (!isFirebaseAvailable) return;

    try {
        await database()
            .ref(`notifications/user_${userId}`)
            .remove();
        console.log(`[FirebaseRealtimeService] Deleted all notifications for user_${userId}`);
    } catch (error) {
        console.error('[FirebaseRealtimeService] Failed to delete all notifications', error);
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: number | string): Promise<number> {
    if (!isFirebaseAvailable) return 0;

    try {
        const snapshot = await database()
            .ref(`notifications/user_${userId}`)
            .orderByChild('read')
            .equalTo(false)
            .once('value');

        const data = snapshot.val();
        return data ? Object.keys(data).length : 0;
    } catch (error) {
        console.error('[FirebaseRealtimeService] Failed to get unread count', error);
        return 0;
    }
}
