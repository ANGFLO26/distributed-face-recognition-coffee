import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import GradientButton from '../components/GradientButton';
import { api } from '../services/api';
import { COLORS, SPACING, SIZES, FONTS } from '../constants/theme';

const ResultScreen = ({ route, navigation }) => {
    const { image } = route.params;
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);

    useEffect(() => {
        processImage();
    }, []);

    const processImage = async () => {
        try {
            const response = await api.recognize(image.base64);
            setResult(response);
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to server. Please check your connection.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ScreenWrapper style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Analyzing Face...</Text>
            </ScreenWrapper>
        );
    }

    const isRecognized = result?.status === 'success' && result?.recognized;

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: 'data:image/jpg;base64,' + image.base64 }}
                        style={styles.image}
                    />
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: isRecognized ? COLORS.success : COLORS.warning }
                    ]}>
                        <Text style={styles.statusText}>
                            {isRecognized ? 'RECOGNIZED' : 'UNKNOWN'}
                        </Text>
                    </View>
                </View>

                <View style={styles.content}>
                    {isRecognized ? (
                        <View style={styles.card}>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.nameText}>{result.customer_name}</Text>

                            <View style={styles.divider} />

                            <Text style={styles.label}>Your Usual Order:</Text>
                            <Text style={styles.orderText}>
                                {result.latest_order?.order_details || 'No previous order'}
                            </Text>

                            <GradientButton
                                title="Confirm Order"
                                onPress={() => Alert.alert('Success', 'Order placed!')}
                                style={styles.button}
                            />
                        </View>
                    ) : (
                        <View style={styles.card}>
                            <Text style={styles.title}>New Customer?</Text>
                            <Text style={styles.description}>
                                We couldn't recognize you. Would you like to register as a new member?
                            </Text>

                            <GradientButton
                                title="Register Now"
                                onPress={() => navigation.replace('Register', { image })}
                                style={styles.button}
                            />

                            <GradientButton
                                title="Try Again"
                                onPress={() => navigation.goBack()}
                                style={[styles.button, styles.secondaryButton]}
                                textStyle={styles.secondaryButtonText}
                            />
                        </View>
                    )}
                </View>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.textSecondary,
        marginTop: SPACING.m,
        fontSize: 16,
    },
    imageContainer: {
        height: 300,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    statusBadge: {
        position: 'absolute',
        bottom: SPACING.m,
        right: SPACING.m,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.xs,
        borderRadius: SIZES.borderRadius,
    },
    statusText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    content: {
        flex: 1,
        padding: SPACING.l,
        marginTop: -SPACING.xl, // Overlap effect
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.borderRadius,
        padding: SPACING.l,
        ...COLORS.shadows?.dark,
        elevation: 5,
    },
    welcomeText: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    nameText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.l,
        fontFamily: FONTS.bold,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.surfaceLight,
        marginBottom: SPACING.l,
    },
    label: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    orderText: {
        fontSize: 20,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.s,
    },
    description: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xl,
        lineHeight: 24,
    },
    button: {
        marginBottom: SPACING.m,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.textSecondary,
    },
    secondaryButtonText: {
        color: COLORS.textSecondary,
    },
});

export default ResultScreen;
