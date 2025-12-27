import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'DatasetDetail'>;

export default function DatasetDetailScreen({ route, navigation }: Props) {
    const { title, type } = route.params;
    const { colors, theme } = useTheme();

    const renderMetricItem = (label: string, value: string, icon: any) => (
        <View style={[styles.metricCard, { backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)', borderColor: colors.border }]}>
            <View style={styles.metricHeader}>
                <Ionicons name={icon} size={20} color={colors.primary} />
                <Text style={[styles.metricLabel, { color: colors.subtext }]}>{label}</Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
        </View>
    );

    const renderEvolutionContent = () => {
        if (type === 'Classification') {
            return (
                <View style={[styles.metricsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.metricsGrid}>
                        {renderMetricItem("Accuracy", "92%", "checkmark-circle-outline")}
                        {renderMetricItem("Precision", "0.89", "analytics-outline")}
                        {renderMetricItem("Recall", "0.91", "refresh-circle-outline")}
                        {renderMetricItem("F1 Score", "0.90", "ribbon-outline")}
                    </View>
                </View>
            );
        } else {
            return (
                <View style={[styles.metricsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.metricsGrid}>
                        {renderMetricItem("MAE", "1250.5", "trending-down-outline")}
                        {renderMetricItem("MSE", "2.4e5", "stats-chart-outline")}
                        {renderMetricItem("RMSE", "490.2", "pulse-outline")}
                        {renderMetricItem("R² Score", "0.87", "speedometer-outline")}
                    </View>
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={theme === 'light' ? ['#fdfbfb', '#ebedee'] : ['#141E30', '#243B55']}
                style={styles.background}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={[styles.typeTag, { backgroundColor: colors.tint }]}>
                        <Text style={[styles.typeText, { color: colors.text }]}>{type}</Text>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Ionicons name="stats-chart" size={24} color={colors.text} style={{ marginRight: 10 }} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Model Metrics</Text>
                    </View>

                    <Text style={[styles.description, { color: colors.subtext }]}>
                        {type === 'Classification'
                            ? 'Performance metrics indicating how well classes are predicted.'
                            : 'Error metrics showing the deviation between predicted and actual values.'}
                    </Text>

                    {renderEvolutionContent()}

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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    typeTag: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 30,
    },
    typeText: {
        opacity: 0.8,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    description: {
        alignSelf: 'flex-start',
        marginBottom: 20,
        fontSize: 14,
        lineHeight: 20,
    },
    metricsContainer: {
        width: '100%',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    metricCard: {
        width: '48%',
        marginBottom: 15,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    metricLabel: {
        fontSize: 12,
        marginLeft: 5,
        fontWeight: '500',
    },
    metricValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
