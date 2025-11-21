import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import GradientButton from '../components/GradientButton';
import { COLORS, SPACING, FONTS, SIZES } from '../constants/theme';

const WelcomeScreen = ({ navigation }) => {
    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {/* Header / Logo Area */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>☕</Text>
                    </View>
                    <Text style={styles.title}>COFFEEHOUSE</Text>
                    <Text style={styles.subtitle}>Premium Face Recognition</Text>
                </View>

                {/* Content / Actions */}
                <View style={styles.content}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Welcome Back</Text>
                        <Text style={styles.cardText}>
                            Experience the future of coffee ordering. Simply scan your face to get your favorite drink.
                        </Text>

                        <GradientButton
                            title="Scan Face"
                            onPress={() => navigation.navigate('Camera', { mode: 'RECOGNIZE' })}
                            style={styles.button}
                        />

                        <GradientButton
                            title="Register New Member"
                            onPress={() => navigation.navigate('Camera', { mode: 'REGISTER' })}
                            style={[styles.button, styles.secondaryButton]}
                            textStyle={styles.secondaryButtonText}
                            disabled={false} // Just to show the style
                        />
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: SPACING.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    iconText: {
        fontSize: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        letterSpacing: 2,
        fontFamily: FONTS.bold,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        letterSpacing: 1,
    },
    content: {
        padding: SPACING.l,
        paddingBottom: SPACING.xxl,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.borderRadius,
        padding: SPACING.l,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.s,
    },
    cardText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        lineHeight: 24,
        marginBottom: SPACING.xl,
    },
    button: {
        marginBottom: SPACING.m,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    secondaryButtonText: {
        color: COLORS.primary,
    },
});

export default WelcomeScreen;
