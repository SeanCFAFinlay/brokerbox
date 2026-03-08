import React from 'react';
import { Button as PaperButton } from 'react-native-paper';

interface ButtonProps {
    mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
    onPress: () => void;
    children: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    icon?: string;
    style?: any;
}

export const Button = ({
    mode = 'contained',
    onPress,
    children,
    loading,
    disabled,
    icon,
    style,
}: ButtonProps) => {
    return (
        <PaperButton
            mode={mode}
            onPress={onPress}
            loading={loading}
            disabled={disabled}
            icon={icon}
            style={[{ borderRadius: 8 }, style]}
        >
            {children}
        </PaperButton>
    );
};
