import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@notifications';

export interface StoredNotification {
    id: string;
    title: string;
    body: string;
    timestamp: number;
    read: boolean;
    type: string;
    data?: { [key: string]: string };
}

export const NotificationStorage = {
    // Save a new notification
    async saveNotification(notification: Omit<StoredNotification, 'id' | 'timestamp' | 'read'>): Promise<void> {
        try {
            const existingNotifications = await this.getAllNotifications();

            const newNotification: StoredNotification = {
                ...notification,
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                read: false,
            };

            const updatedNotifications = [newNotification, ...existingNotifications];

            // Keep only last 100 notifications
            const limitedNotifications = updatedNotifications.slice(0, 100);

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limitedNotifications));
            console.log('[NotificationStorage] Saved notification:', newNotification.title);
        } catch (error) {
            console.error('[NotificationStorage] Error saving notification:', error);
        }
    },

    // Get all notifications
    async getAllNotifications(): Promise<StoredNotification[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
            return [];
        } catch (error) {
            console.error('[NotificationStorage] Error getting notifications:', error);
            return [];
        }
    },

    // Delete a specific notification
    async deleteNotification(id: string): Promise<void> {
        try {
            const notifications = await this.getAllNotifications();
            const filtered = notifications.filter(n => n.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            console.log('[NotificationStorage] Deleted notification:', id);
        } catch (error) {
            console.error('[NotificationStorage] Error deleting notification:', error);
        }
    },

    // Delete all notifications
    async deleteAllNotifications(): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
            console.log('[NotificationStorage] Cleared all notifications');
        } catch (error) {
            console.error('[NotificationStorage] Error clearing notifications:', error);
        }
    },

    // Mark notification as read
    async markAsRead(id: string): Promise<void> {
        try {
            const notifications = await this.getAllNotifications();
            const updated = notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            );
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('[NotificationStorage] Error marking as read:', error);
        }
    },

    // Get unread count
    async getUnreadCount(): Promise<number> {
        try {
            const notifications = await this.getAllNotifications();
            return notifications.filter(n => !n.read).length;
        } catch (error) {
            console.error('[NotificationStorage] Error getting unread count:', error);
            return 0;
        }
    }
};
