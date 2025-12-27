import React, { createContext, useState, useContext } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    colors: {
        background: string;
        text: string;
        card: string;
        primary: string; // Light Blue
        secondary: string;
        subtext: string;
        border: string;
        tint: string;
        gradientStart: string;
        gradientEnd: string;
    };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('light');

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const colors = theme === 'light' ? {
        background: '#ffffff',
        text: '#1a1a1a',
        card: '#f5f5f5',
        primary: '#4facfe',
        secondary: '#00f2fe',
        subtext: '#666666',
        border: '#e0e0e0',
        tint: 'rgba(0,0,0,0.05)',
        gradientStart: '#4facfe',
        gradientEnd: '#00f2fe',
    } : {
        background: '#141E30',
        text: '#ffffff',
        card: 'rgba(255,255,255,0.05)',
        primary: '#4facfe',
        secondary: '#00f2fe',
        subtext: 'rgba(255,255,255,0.6)',
        border: 'rgba(255,255,255,0.1)',
        tint: 'rgba(255,255,255,0.1)',
        gradientStart: '#0f0c29',
        gradientEnd: '#302b63', // Keeping nice dark gradients for backgrounds if needed, or re-use blue for buttons
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
