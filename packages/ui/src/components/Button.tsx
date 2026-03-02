import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../index';

export interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
}

export function Button({ label, onPress, variant = 'primary', isLoading }: ButtonProps) {
    const isSecondary = variant === 'secondary';
    const isDanger = variant === 'danger';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isSecondary && styles.secondary,
                isDanger && styles.danger,
            ]}
            onPress={onPress}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color={isSecondary ? COLORS.primary : '#FFF'} />
            ) : (
                <Text
                    style={[
                        styles.text,
                        isSecondary && styles.secondaryText,
                    ]}
                >
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    danger: {
        backgroundColor: COLORS.error,
    },
    text: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryText: {
        color: COLORS.primary,
    }
});
