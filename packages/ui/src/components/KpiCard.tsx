import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../index';

export interface KpiCardProps {
    title: string;
    value: string;
    subtitle?: string;
}

export function KpiCard({ title, value, subtitle }: KpiCardProps) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
        marginBottom: 16,
        width: '47%',
    },
    title: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    value: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.primary,
        marginTop: 4,
    }
});
