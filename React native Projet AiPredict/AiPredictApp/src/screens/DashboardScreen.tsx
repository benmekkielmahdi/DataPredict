import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, Dimensions, Modal, Image, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Dataset, TrainingHistory } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Platform } from 'react-native';

const getApiUrl = () => {
    if (Platform.OS === 'web') {
        return '';
    }
    return 'http://192.168.100.66:8888';
};

const API_URL = getApiUrl();

const { width } = Dimensions.get('window');

// Helper function to clean dataset name
const cleanDatasetName = (name: string): string => {
    // Remove "processed_" prefix and timestamp
    // Example: "processed_1766748385898_Boston.csv" -> "Boston.csv"
    const match = name.match(/(?:processed_\d+_)?(.+)/);
    return match ? match[1] : name;
};

export default function DashboardScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { colors, theme, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const [profileVisible, setProfileVisible] = useState(false);
    const [trainingHistory, setTrainingHistory] = useState<TrainingHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 10;

    const fetchHistory = async (pageNum: number, append: boolean = false) => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const response = await fetch(
                `${API_URL}/api/training/history?page=${pageNum}&size=${PAGE_SIZE}`,
                {
                    headers: {
                        'X-User-Id': user.id.toString()
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                const formatted = data.map((h: any) => ({
                    id: h.id.toString(),
                    date: h.date.replace('T', ' ').substring(0, 16),
                    datasetName: cleanDatasetName(h.datasetName || h.dataset_name || 'Unknown'),
                    modelName: h.modelName || h.model_name || 'Unknown',
                    type: (h.type || 'CLASSIFICATION').toUpperCase() as 'CLASSIFICATION' | 'REGRESSION',
                    accuracy: h.accuracy,
                    precisionMetric: h.precisionMetric || h.precision_metric,
                    recall: h.recall,
                    f1Score: h.f1Score || h.f1score,
                    trainingTime: h.trainingTime || h.training_time,
                    status: h.status === 'success' ? 'success' as const : 'failed' as const,
                    description: h.description,
                    mae: h.mae,
                    mse: h.mse,
                    r2: h.r2,
                    rmse: h.rmse,
                    fullMetrics: h.fullMetrics || h.full_metrics
                }));

                if (append) {
                    setTrainingHistory(prev => [...prev, ...formatted]);
                } else {
                    setTrainingHistory(formatted);
                }

                // Check if there are more records
                setHasMore(formatted.length === PAGE_SIZE);
                console.log(`[Dashboard] Loaded ${formatted.length} training records (page ${pageNum})`);
            } else {
                console.error('[Dashboard] Failed to fetch training history:', response.status);
            }
        } catch (e) {
            console.error('[Dashboard] Failed to fetch history', e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchHistory(0, false);
    }, [user?.id]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchHistory(nextPage, true);
        }
    };

    const handleRefresh = () => {
        setPage(0);
        setHasMore(true);
        fetchHistory(0, false);
    };

    const renderDatasetItem = ({ item }: { item: TrainingHistory }) => {
        const isClassification = item.type === 'CLASSIFICATION';
        const iconName = isClassification ? 'file-tree' : 'chart-bell-curve';
        const iconColor = isClassification ? colors.primary : colors.secondary;

        return (
            <TouchableOpacity
                style={[styles.card, { borderColor: colors.border }]}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('TrainingDetail', { training: item })}
            >
                <LinearGradient
                    colors={[theme === 'light' ? '#ffffff' : 'rgba(255,255,255,0.05)', theme === 'light' ? '#f8f9fa' : 'rgba(255,255,255,0.02)']}
                    style={styles.cardGradient}
                >
                    <View style={[styles.cardIconContainer, { backgroundColor: theme === 'light' ? 'rgba(79, 172, 254, 0.1)' : 'rgba(255,255,255,0.05)' }]}>
                        <MaterialCommunityIcons name={iconName} size={30} color={iconColor} />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.datasetName}</Text>
                        <Text style={[styles.modelText, { color: colors.subtext }]}>{item.modelName}</Text>
                        <View style={styles.cardMetaRow}>
                            <View style={[styles.badge, { backgroundColor: isClassification ? 'rgba(79, 172, 254, 0.1)' : 'rgba(0, 242, 254, 0.1)' }]}>
                                <Text style={[styles.badgeText, { color: isClassification ? colors.primary : colors.secondary }]}>{item.type}</Text>
                            </View>
                            <Text style={[styles.cardDate, { color: colors.subtext }]}>{item.date}</Text>
                        </View>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, { backgroundColor: item.status === 'success' ? '#00b09b' : '#e74c3c' }]} />
                            <Text style={[styles.statusText, { color: colors.subtext }]}>{item.status === 'success' ? 'Success' : 'Failed'}</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.subtext} />
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
            <LinearGradient
                colors={theme === 'light' ? ['#fdfbfb', '#ebedee'] : ['#141E30', '#243B55']}
                style={styles.background}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>My Datasets</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>Manage your AI models</Text>
                    </View>
                    <TouchableOpacity onPress={() => setProfileVisible(true)}>
                        <View style={[styles.profileButton, { borderColor: colors.border }]}>
                            <Ionicons name="person" size={20} color={colors.text} />
                        </View>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={trainingHistory}
                    renderItem={renderDatasetItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={loading}
                    onRefresh={handleRefresh}
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

                {/* Profile Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={profileVisible}
                    onRequestClose={() => setProfileVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>Profile</Text>
                                <TouchableOpacity onPress={() => setProfileVisible(false)}>
                                    <Ionicons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.profileInfo}>
                                <View style={[styles.profileImageContainer, { backgroundColor: colors.tint }]}>
                                    <Ionicons name="person" size={40} color={colors.text} />
                                </View>
                                <Text style={[styles.profileName, { color: colors.text }]}>
                                    {user?.username || 'User'}
                                </Text>
                                <Text style={[styles.profileEmail, { color: colors.subtext }]}>
                                    {user?.email || 'email@example.com'}
                                </Text>
                            </View>

                            <View style={[styles.divider, { backgroundColor: colors.border }]} />

                            <View style={styles.themeRow}>
                                <Text style={[styles.themeText, { color: colors.text }]}>Dark Mode</Text>
                                <Switch
                                    value={theme === 'dark'}
                                    onValueChange={toggleTheme}
                                    trackColor={{ false: "#767577", true: colors.primary }}
                                    thumbColor={theme === 'dark' ? "#f4f3f4" : "#f4f3f4"}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={async () => {
                                    setProfileVisible(false);
                                    await logout();
                                }}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.secondary]}
                                    style={styles.logoutGradient}
                                >
                                    <Text style={styles.logoutText}>Logout</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 5,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.05)'
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
        marginBottom: 15,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
    cardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    cardIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    modelText: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    cardMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginRight: 10,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardDate: {
        fontSize: 12,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 25,
        borderWidth: 1,
        borderBottomWidth: 0,
        minHeight: 350,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    profileEmail: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: 20,
    },
    themeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    themeText: {
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    logoutGradient: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingMore: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
    },
});
