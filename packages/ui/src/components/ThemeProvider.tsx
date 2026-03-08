import React from 'react';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { useColorScheme } from '../hooks/useColorScheme';

const theme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#007AFF',
        secondary: '#5856D6',
        tertiary: '#FF2D55',
    },
};

const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#007AFF',
        secondary: '#5856D6',
        tertiary: '#FF2D55',
    },
};

export const BrokerBoxThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const colorScheme = useColorScheme();
    const currentTheme = colorScheme === 'dark' ? theme : lightTheme;

    return (
        <PaperProvider theme={currentTheme}>
            {children}
        </PaperProvider>
    );
};
