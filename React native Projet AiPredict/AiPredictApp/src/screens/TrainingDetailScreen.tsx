import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';

type TrainingDetailRouteProp = RouteProp<RootStackParamList, 'TrainingDetail'>;

export default function TrainingDetailScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<TrainingDetailRouteProp>();
    const { colors, theme } = useTheme();
    const { training } = route.params;

    const isClassification = training.type === 'CLASSIFICATION';

    const renderMetricCard = (label: string, value: string | number | undefined, icon: string) => {
        if (value === undefined || value === null) return null;

        return (
            <View style={[styles.metricCard, { borderColor: colors.border }]}>
                <LinearGradient
                    colors={[
                        theme === 'light' ? '#ffffff' : 'rgba(255,255,255,0.05)',
                        theme === 'light' ? '#f8f9fa' : 'rgba(255,255,255,0.02)'
                    ]}
                    style={styles.metricGradient}
                >
                    <View style={[styles.metricIconContainer, { backgroundColor: colors.tint }]}>
                        <Ionicons name={icon as any} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.metricContent}>
                        <Text style={[styles.metricLabel, { color: colors.subtext }]}>{label}</Text>
                        <Text style={[styles.metricValue, { color: colors.text }]}>
                            {typeof value === 'number' ? value.toFixed(4) : value}
                        </Text>
                    </View>
                </LinearGradient>
            </View>
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
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Training Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Model Info Card */}
                    <View style={[styles.infoCard, { borderColor: colors.border }]}>
                        <LinearGradient
                            colors={[
                                theme === 'light' ? '#ffffff' : 'rgba(255,255,255,0.05)',
                                theme === 'light' ? '#f8f9fa' : 'rgba(255,255,255,0.02)'
                            ]}
                            style={styles.infoGradient}
                        >
                            <View style={[styles.typeBadge, {
                                backgroundColor: isClassification ? 'rgba(79, 172, 254, 0.1)' : 'rgba(0, 242, 254, 0.1)'
                            }]}>
                                <Text style={[styles.typeBadgeText, {
                                    color: isClassification ? colors.primary : colors.secondary
                                }]}>
                                    {training.type}
                                </Text>
                            </View>

                            <Text style={[styles.modelName, { color: colors.text }]}>{training.modelName}</Text>
                            <Text style={[styles.datasetName, { color: colors.subtext }]}>
                                Dataset: {training.datasetName}
                            </Text>
                            <Text style={[styles.date, { color: colors.subtext }]}>{training.date}</Text>

                            {training.description && (
                                <Text style={[styles.description, { color: colors.subtext }]}>
                                    {training.description}
                                </Text>
                            )}

                            <View style={styles.statusRow}>
                                <View style={[styles.statusDot, {
                                    backgroundColor: training.status === 'success' ? '#00b09b' : '#e74c3c'
                                }]} />
                                <Text style={[styles.statusText, { color: colors.subtext }]}>
                                    {training.status === 'success' ? 'Success' : 'Failed'}
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Metrics Section */}
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance Metrics</Text>

                    {isClassification ? (
                        <>
                            {renderMetricCard('Accuracy', training.accuracy, 'checkmark-circle')}
                            {renderMetricCard('Precision', training.precisionMetric, 'analytics')}
                            {renderMetricCard('Recall', training.recall, 'pulse')}
                            {renderMetricCard('F1 Score', training.f1Score, 'stats-chart')}
                        </>
                    ) : (
                        <>
                            {renderMetricCard('R² Score', training.r2, 'trending-up')}
                            {renderMetricCard('MAE', training.mae, 'calculator')}
                            {renderMetricCard('MSE', training.mse, 'square')}
                            {renderMetricCard('RMSE', training.rmse, 'trending-down')}
                        </>
                    )}

                    {training.trainingTime && renderMetricCard('Training Time', training.trainingTime, 'time')}
                </ScrollView>
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
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    infoCard: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        marginBottom: 30,
    },
    infoGradient: {
        padding: 20,
    },
    typeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 15,
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    modelName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    datasetName: {
        fontSize: 16,
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    metricCard: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        marginBottom: 12,
    },
    metricGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    metricIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    metricContent: {
        flex: 1,
    },
    metricLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '600',
    },
});
