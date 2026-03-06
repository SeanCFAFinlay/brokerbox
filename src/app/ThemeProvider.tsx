import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextProps {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useTheme = (): ThemeContextProps => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

interface ProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ProviderProps) => {
    const [theme, setTheme] = useState<Theme>('dark');

    // Load saved theme or system preference on mount
    useEffect(() => {
        const saved = localStorage.getItem('brokerbox_theme') as Theme | null;
        if (saved) {
            setTheme(saved);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    // Apply theme class to <html>
    useEffect(() => {
        const html = document.documentElement;
        html.classList.remove('theme-light', 'theme-dark');
        html.classList.add(`theme-${theme}`);
        localStorage.setItem('brokerbox_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
