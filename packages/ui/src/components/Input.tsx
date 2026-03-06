import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';

import { COLORS } from '../constants';

interface InputProps {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, value, onChangeText, placeholder, secureTextEntry }) => (
    <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.muted}
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        color: COLORS.muted,
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.card,
        color: COLORS.text,
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
});
