import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Heartbeat animation
        const heartbeat = Animated.loop(
            Animated.sequence([
                // Beat
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1.0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                // Second beat
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1.0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                // Pause
                Animated.delay(800),
            ])
        );

        heartbeat.start();

        return () => heartbeat.stop();
    }, [scaleAnim]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#ffffffff', '#ffffffff']}
                style={styles.background}
            />
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
        width: '100%',
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
    },
});
