import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    SafeAreaView,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
    FirebaseNotificationWithId,
    subscribeToUserNotifications,
    loadMoreNotifications,
    deleteNotification,
    deleteAllNotifications,
} from '../services/FirebaseRealtimeService';

export default function NotificationScreen() {
    const { colors, theme } = useTheme();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<FirebaseNotificationWithId[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const NOTIFICATIONS_PER_PAGE = 20;

    // Subscribe to Firebase Realtime Database notifications (initial load)
    useEffect(() => {
        if (!user?.id) {
            console.warn('[NotificationScreen] No user ID available');
            return;
        }

        console.log(`[NotificationScreen] Subscribing to notifications for user ${user.id}`);

        const unsubscribe = subscribeToUserNotifications(
            user.id,
            (updatedNotifications) => {
                setNotifications(updatedNotifications);
                setHasMore(updatedNotifications.length >= NOTIFICATIONS_PER_PAGE);
                console.log(`[NotificationScreen] Received ${updatedNotifications.length} notifications`);
            },
            NOTIFICATIONS_PER_PAGE
        );

        return () => {
            unsubscribe();
        };
    }, [user?.id]);

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore || notifications.length === 0) return;

        const oldestNotification = notifications[notifications.length - 1];
        if (!oldestNotification) return;

        setLoadingMore(true);
        try {
            const moreNotifications = await loadMoreNotifications(
                user!.id!,
                oldestNotification.timestamp,
                NOTIFICATIONS_PER_PAGE
            );

            if (moreNotifications.length > 0) {
                setNotifications(prev => [...prev, ...moreNotifications]);
                setHasMore(moreNotifications.length >= NOTIFICATIONS_PER_PAGE);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('[NotificationScreen] Failed to load more', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // Firebase subscription will automatically update
        // Just add a small delay for UX
        setTimeout(() => setRefreshing(false), 500);
    }, []);

    const handleDeleteNotification = async (id: string) => {
        if (!user?.id) return;

        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteNotification(user.id!, id);
                    }
                }
            ]
        );
    };

    const handleClearAll = () => {
        if (!user?.id) return;

        Alert.alert(
            'Clear All Notifications',
            'Are you sure you want to delete all notifications?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteAllNotifications(user.id!);
                    }
                }
            ]
        );
    };

    const getIconForType = (type?: string) => {
        switch (type) {
            case 'IMPORT_COMPLETE':
            case 'IMPORT_SUCCESS':
            case 'success':
                return { name: 'checkmark-circle' as const, color: '#2ecc71' };
            case 'EXPORT_COMPLETE':
            case 'EXPORT_SUCCESS':
                return { name: 'cloud-upload' as const, color: '#3498db' };
            case 'FEATURE_SELECTION_COMPLETE':
                return { name: 'options' as const, color: '#9b59b6' };
            case 'TRAINING_COMPLETE':
                return { name: 'trophy' as const, color: '#f39c12' };
            case 'error':
                return { name: 'alert-circle' as const, color: '#e74c3c' };
            default:
                return { name: 'information-circle' as const, color: '#3498db' };
        }
    };

    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const renderItem = ({ item }: { item: FirebaseNotificationWithId }) => {
        const icon = getIconForType(item.data?.type);

        return (
            <View style={[styles.card, { borderColor: colors.border }]}>
                <LinearGradient
                    colors={[
                        theme === 'light' ? '#ffffff' : 'rgba(255,255,255,0.05)',
                        theme === 'light' ? '#f8f9fa' : 'rgba(255,255,255,0.02)'
                    ]}
                    style={styles.cardGradient}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name={icon.name} size={28} color={icon.color} />
                    </View>
                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                            <Text style={[styles.time, { color: colors.subtext }]}>
                                {formatTime(item.timestamp)}
                            </Text>
                        </View>
                        <Text style={[styles.message, { color: colors.subtext }]}>{item.body}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => handleDeleteNotification(item.id)}
                        style={styles.deleteButton}
                    >
                        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={80} color={colors.subtext} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No notifications yet</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={theme === 'light' ? ['#fdfbfb', '#ebedee'] : ['#141E30', '#243B55']}
                style={styles.background}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                    {notifications.length > 0 && (
                        <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
                            <Text style={styles.clearButtonText}>Clear All</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => {
                        if (loadingMore) {
                            return (
                                <View style={styles.loadingMore}>
                                    <Text style={[styles.loadingText, { color: colors.subtext }]}>
                                        Loading more...
                                    </Text>
                                </View>
                            );
                        }
                        return null;
                    }}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    clearButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
    },
    clearButtonText: {
        color: '#e74c3c',
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexGrow: 1,
    },
    card: {
        marginBottom: 15,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
    cardGradient: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 15,
        justifyContent: 'flex-start',
        paddingTop: 2,
    },
    content: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    time: {
        fontSize: 12,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
    loadingMore: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
    },
});
