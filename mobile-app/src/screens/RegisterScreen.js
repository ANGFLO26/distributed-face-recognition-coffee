import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import GradientButton from '../components/GradientButton';
import { api } from '../services/api';
import { COLORS, SPACING, SIZES, FONTS } from '../constants/theme';

const RegisterScreen = ({ route, navigation }) => {
    const { image } = route.params;
    const [name, setName] = useState('');
    const [order, setOrder] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name.trim() || !order.trim()) {
            Alert.alert('Missing Information', 'Please enter both your name and favorite drink.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.register(image.base64, name, order);

            if (response.status === 'success') {
                Alert.alert(
                    'Success',
                    'You have been registered successfully!',
                    [{ text: 'OK', onPress: () => navigation.navigate('Welcome') }]
                );
            } else {
                Alert.alert('Registration Failed', response.error_message || 'Unknown error');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Join Coffeehouse</Text>
                        <Text style={styles.subtitle}>Create your profile to get started</Text>
                    </View>

                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: 'data:image/jpg;base64,' + image.base64 }}
                            style={styles.image}
                        />
                        <View style={styles.imageOverlay} />
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: John Doe"
                                placeholderTextColor={COLORS.textTertiary}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Favorite Drink</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Iced Americano"
                                placeholderTextColor={COLORS.textTertiary}
                                value={order}
                                onChangeText={setOrder}
                            />
                        </View>

                        <GradientButton
                            title="Complete Registration"
                            onPress={handleRegister}
                            isLoading={loading}
                            style={styles.button}
                        />

                        <GradientButton
                            title="Cancel"
                            onPress={() => navigation.goBack()}
                            disabled={loading}
                            style={[styles.button, styles.secondaryButton]}
                            textStyle={styles.secondaryButtonText}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        padding: SPACING.l,
        paddingTop: SPACING.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.xs,
        fontFamily: FONTS.bold,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: SPACING.m,
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    form: {
        padding: SPACING.l,
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: SIZES.borderRadius * 2,
        borderTopRightRadius: SIZES.borderRadius * 2,
        flex: 1,
        marginTop: SPACING.m,
    },
    inputGroup: {
        marginBottom: SPACING.l,
    },
    label: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
        fontSize: 14,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.borderRadius,
        padding: SPACING.m,
        color: COLORS.textPrimary,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    button: {
        marginTop: SPACING.s,
        marginBottom: SPACING.m,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
        marginTop: -SPACING.s,
    },
    secondaryButtonText: {
        color: COLORS.textSecondary,
    },
});

export default RegisterScreen;
