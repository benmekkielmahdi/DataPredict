import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        const stored = localStorage.getItem('dataprdict_dark_mode');
        return stored === 'true';
    });

    useEffect(() => {
        localStorage.setItem('dataprdict_dark_mode', isDarkMode.toString());
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
