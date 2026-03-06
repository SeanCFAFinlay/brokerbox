import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

import { COLORS } from '../constants';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    outline?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', outline }) => {
    const getBgColor = () => {
        if (outline) return 'transparent';
        if (variant === 'secondary') return COLORS.surface;
        if (variant === 'danger') return COLORS.error;
        return COLORS.primary;
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: getBgColor() },
                outline && { borderWidth: 1, borderColor: variant === 'danger' ? COLORS.error : COLORS.primary }
            ]}
            onPress={onPress}
        >
            <Text style={[styles.text, outline && { color: variant === 'danger' ? COLORS.error : COLORS.primary }]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
