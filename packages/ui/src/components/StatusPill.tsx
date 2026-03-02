import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../index';

export interface StatusPillProps {
    status: 'NEW' | 'MATCHED' | 'IN_REVIEW' | 'COMMITTED' | 'FUNDED' | 'LOST' | string;
}

export function StatusPill({ status }: StatusPillProps) {
    let bgColor = COLORS.surface;
    let textColor = COLORS.text;

    switch (status) {
        case 'NEW':
            bgColor = '#DBEAFE'; textColor = '#3B82F6'; break;
        case 'MATCHED':
            bgColor = '#EDE9FE'; textColor = '#8B5CF6'; break;
        case 'IN_REVIEW':
            bgColor = '#FEF3C7'; textColor = '#F59E0B'; break;
        case 'COMMITTED':
            bgColor = '#E0F2FE'; textColor = '#0EA5E9'; break;
        case 'FUNDED':
            bgColor = '#D1FAE5'; textColor = '#10B981'; break;
        case 'LOST':
            bgColor = '#FEE2E2'; textColor = '#EF4444'; break;
    }

    return (
        <View style={[styles.pill, { backgroundColor: bgColor }]}>
            <Text style={[styles.text, { color: textColor }]}>
                {status.replace('_', ' ')}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    }
});
