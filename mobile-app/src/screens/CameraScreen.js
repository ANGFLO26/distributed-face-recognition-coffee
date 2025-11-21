import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import { COLORS, SPACING, SIZES } from '../constants/theme';

const CameraScreen = ({ navigation, route }) => {
    const { mode } = route.params; // 'RECOGNIZE' or 'REGISTER'
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <ScreenWrapper style={styles.center}>
                <Text style={styles.text}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permButton}>
                    <Text style={styles.permButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </ScreenWrapper>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current && !isCapturing) {
            setIsCapturing(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.7,
                    base64: true,
                });

                // Navigate to next screen based on mode
                if (mode === 'RECOGNIZE') {
                    navigation.navigate('Result', { image: photo });
                } else {
                    navigation.navigate('Register', { image: photo });
                }

            } catch (error) {
                Alert.alert('Error', 'Failed to take picture: ' + error.message);
            } finally {
                setIsCapturing(false);
            }
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="front"
                ref={cameraRef}
            />
            <View style={[styles.overlay, { paddingTop: insets.top }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.title}>
                        {mode === 'RECOGNIZE' ? 'Scan Face' : 'Capture Photo'}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Face Frame */}
                <View style={styles.frameContainer}>
                    <View style={styles.frame} />
                    <Text style={styles.instruction}>
                        Position your face within the frame
                    </Text>
                </View>

                {/* Controls */}
                <View style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}>
                    <TouchableOpacity
                        onPress={takePicture}
                        disabled={isCapturing}
                        style={styles.captureButton}
                    >
                        <View style={styles.captureInner} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.l,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    frameContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    frame: {
        width: 280,
        height: 280,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    instruction: {
        color: 'white',
        marginTop: SPACING.m,
        fontSize: 16,
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.xs,
        borderRadius: SIZES.borderRadius,
        overflow: 'hidden',
    },
    controls: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    text: {
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.m,
    },
    permButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: SIZES.borderRadius,
    },
    permButtonText: {
        color: COLORS.background,
        fontWeight: 'bold',
    },
});

export default CameraScreen;
