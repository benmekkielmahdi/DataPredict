import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { requestUserPermission, subscribeToUserTopic, unsubscribeFromUserTopic, setupForegroundListener } from '../services/NotificationService';

// Define the base URL for the API
const getApiUrl = () => {
    if (Platform.OS === 'web') {
        return '';
    }
    // Change this to your machine's IP address if needed
    return 'http://192.168.100.66:8888';
};

const API_URL = getApiUrl();

interface User {
    id?: number;
    username: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check auth on mount
    useEffect(() => {
        checkAuth();

        // Setup notification listener
        const unsubscribe = setupForegroundListener();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const checkAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');

            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            // Verify token with backend
            try {
                const response = await fetch(`${API_URL}/auth/verify?token=${storedToken}`);
                if (response.ok) {
                    const isValid = await response.text();
                    if (isValid === 'true' || isValid === 'Token is valid') {
                        setToken(storedToken);
                        if (storedUser) {
                            const parsedUser = JSON.parse(storedUser);
                            setUser(parsedUser);

                            // Initialize Notifications if permission granted
                            await requestUserPermission();

                            // Subscribe logic
                            if (parsedUser.id) {
                                await subscribeToUserTopic(parsedUser.id);
                            } else if (parsedUser.email) {
                                // Fallback to email if ID missing (though backend seems to use ID)
                                await subscribeToUserTopic(parsedUser.email);
                            }
                        }
                    } else {
                        await logout();
                    }
                } else {
                    await logout();
                }
            } catch (error) {
                console.error('Auth verification failed, maybe offline?', error);
                await logout();
            }

        } catch (e) {
            console.error('Error loading login state', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        const fullUrl = `${API_URL}/auth/login`;
        console.log(`[Auth] Attempting login to: ${fullUrl}`);

        try {
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const token = await response.text();
            console.log(`[Auth] Response Status: ${response.status}`);

            if (response.ok && token) {
                await AsyncStorage.setItem('token', token);
                setToken(token);

                // Fetch User Profile to get ID
                try {
                    const profileResponse = await fetch(`${API_URL}/auth/profile?token=${token}`);
                    if (profileResponse.ok) {
                        const userProfile = await profileResponse.json();
                        console.log('[Auth] User Profile:', userProfile);

                        const userInfo: User = {
                            id: userProfile.id,
                            username: userProfile.prenom || userProfile.nom || 'User',
                            email: userProfile.email || email,
                            role: 'Admin'
                        };

                        await AsyncStorage.setItem('user', JSON.stringify(userInfo));
                        setUser(userInfo);

                        // Setup Notifications with REAL ID
                        const permissionGranted = await requestUserPermission();
                        if (permissionGranted && userInfo.id) {
                            await subscribeToUserTopic(userInfo.id);
                        }
                    } else {
                        console.warn('[Auth] Failed to fetch profile');
                        // Fallback
                        const userInfo = { username: 'User', email, role: 'Admin' };
                        setUser(userInfo);
                        await AsyncStorage.setItem('user', JSON.stringify(userInfo));
                    }
                } catch (profileError) {
                    console.error('[Auth] Profile fetch error', profileError);
                }

                return true;
            } else {
                Alert.alert('Login Failed', `Server returned ${response.status}`);
            }
        } catch (error) {
            console.error('[Auth] Network Request Failed:', error);
            Alert.alert('Network Error', `Could not connect to ${fullUrl}`);
        }
        return false;
    };

    const logout = async () => {
        try {
            if (user?.id) {
                await unsubscribeFromUserTopic(user.id);
            } else if (user?.email) {
                await unsubscribeFromUserTopic(user.email);
            }

            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setToken(null);
            setUser(null);
        } catch (e) {
            console.error('Logout error', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
