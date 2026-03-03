import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from '../index';

interface StatusPillProps {
    status: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
    const getStatusStyle = (s: string) => {
        const normalized = s.toUpperCase();
        switch (normalized) {
            case 'FUNDED':
            case 'CLOSED':
                return { bg: 'rgba(16, 185, 129, 0.15)', text: COLORS.success, border: 'rgba(16, 185, 129, 0.3)' };
            case 'UNDERWRITING':
            case 'IN_REVIEW':
                return { bg: 'rgba(6, 182, 212, 0.15)', text: COLORS.primary, border: 'rgba(6, 182, 212, 0.3)' };
            case 'COMMITTED':
                return { bg: 'rgba(139, 92, 246, 0.15)', text: COLORS.secondary, border: 'rgba(139, 92, 246, 0.3)' };
            case 'LOST':
                return { bg: 'rgba(239, 68, 68, 0.15)', text: COLORS.error, border: 'rgba(239, 68, 68, 0.3)' };
            default:
                return { bg: 'rgba(156, 163, 175, 0.15)', text: COLORS.muted, border: 'rgba(156, 163, 175, 0.3)' };
        }
    };

    const styles_pill = getStatusStyle(status);

    return (
        <View style={[styles.pill, { backgroundColor: styles_pill.bg, borderColor: styles_pill.border }]}>
            <Text style={[styles.text, { color: styles_pill.text }]}>{status.replace('_', ' ')}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
