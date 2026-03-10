'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';
const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => { } });
export const useTheme = () => useContext(Ctx);

export default function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('brokerbox_theme') as Theme | null;
        if (saved) setTheme(saved);
        else if (window.matchMedia('(prefers-color-scheme: light)').matches) setTheme('light');
        setMounted(true);
        // Intentional: hydrate theme from storage on mount (single run)
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial sync from localStorage
    }, []);

    useEffect(() => {
        if (!mounted) return;
        document.documentElement.className = `theme-${theme}`;
        localStorage.setItem('brokerbox_theme', theme);
    }, [theme, mounted]);

    const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}
