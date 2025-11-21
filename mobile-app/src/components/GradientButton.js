import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS, FONTS } from '../constants/theme';

const GradientButton = ({
    title,
    onPress,
    isLoading = false,
    disabled = false,
    style,
    textStyle,
    icon
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
            style={[styles.container, style]}
        >
            <LinearGradient
                colors={disabled ? [COLORS.surfaceLight, COLORS.surfaceLight] : [COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {isLoading ? (
                    <ActivityIndicator color={COLORS.background} />
                ) : (
                    <>
                        {icon && icon}
                        <Text style={[
                            styles.text,
                            disabled && styles.disabledText,
                            textStyle
                        ]}>
                            {title}
                        </Text>
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: SIZES.buttonHeight,
        borderRadius: SIZES.borderRadius,
        overflow: 'hidden',
        ...SHADOWS.light,
    },
    gradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.l,
    },
    text: {
        color: COLORS.background, // Dark text on gold background looks premium
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    disabledText: {
        color: COLORS.textTertiary,
    },
});

export default GradientButton;
