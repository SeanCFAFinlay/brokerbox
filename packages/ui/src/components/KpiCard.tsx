import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from '../index';

interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, trend }) => (
    <View style={styles.card}>
        <Text style={styles.label}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
        {subtitle && (
            <Text style={[
                styles.subValue,
                trend === 'up' ? styles.trendUp : trend === 'down' ? styles.trendDown : {}
            ]}>
                {subtitle}
            </Text>
        )}
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        minWidth: 160,
        marginBottom: 16,
        // Elevation for premium shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    label: {
        color: COLORS.muted,
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    value: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: '800',
    },
    subValue: {
        fontSize: 13,
        marginTop: 6,
        color: COLORS.muted,
    },
    trendUp: { color: COLORS.success },
    trendDown: { color: COLORS.error },
});
