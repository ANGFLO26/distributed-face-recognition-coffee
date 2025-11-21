/**
 * Coffeehouse Design System
 * Premium Dark Mode Theme
 */

export const COLORS = {
    // Backgrounds
    background: '#121212',
    surface: '#1E1E1E',
    surfaceLight: '#2C2C2C',

    // Brand Colors
    primary: '#D4AF37', // Metallic Gold
    primaryDark: '#AA8C2C',
    secondary: '#E5E5E5', // Silver/Platinum

    // Status
    success: '#4CAF50',
    error: '#FF5252',
    warning: '#FFC107',
    info: '#2196F3',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#6E6E6E',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    glass: 'rgba(30, 30, 30, 0.8)',
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    // In a real app, we would load custom fonts like 'Inter' or 'Playfair Display'
};

export const SIZES = {
    icon: 24,
    iconLarge: 32,
    borderRadius: 16,
    buttonHeight: 56,
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dark: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
};
