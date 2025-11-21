// Recognition Screen - Capture/select image and recognize
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../components/common/Button';
import { LoadingIndicator } from '../components/common/LoadingIndicator';
import ImageService from '../services/ImageService';
import HttpService from '../services/HttpService';
import StorageService from '../services/StorageService';
import NetworkService from '../services/NetworkService';
import LogService from '../services/LogService';
import { COLORS } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';

const RecognitionScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('camera'); // 'camera' or 'gallery'

  const requestPermissions = async () => {
    if (mode === 'camera') {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'App cần quyền camera để chụp ảnh.');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'App cần quyền truy cập ảnh.');
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
    }
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const handleRecognize = async () => {
    if (!imageUri) {
      Alert.alert('Lỗi', 'Vui lòng chụp hoặc chọn ảnh trước.');
      return;
    }

    // Check network
    const isConnected = await NetworkService.isConnected();
    if (!isConnected) {
      LogService.warn('NETWORK', 'No network connection for recognize');
      Alert.alert('Lỗi', 'Không có kết nối mạng. Vui lòng kiểm tra WiFi/Mobile Data.');
      return;
    }

    setLoading(true);

    try {
      LogService.info('RECOGNITION', 'Starting recognition process', { imageUri });
      
      // Process image
      const imageBase64 = await ImageService.processImage(imageUri);
      LogService.debug('RECOGNITION', 'Image processed', { 
        base64Length: imageBase64 ? imageBase64.length : 0 
      });
      
      // Get branch ID
      const branchId = await StorageService.getBranchId();
      
      // Send recognize request
      const response = await HttpService.recognizeFace(imageBase64, branchId);
      
      setLoading(false);
      
      LogService.info('RECOGNITION', 'Recognition successful', {
        recognized: response.recognized,
        customerId: response.customer_id,
      });
      
      // Navigate to result screen
      navigation.navigate('RecognitionResult', { response });
    } catch (error) {
      setLoading(false);
      LogService.error('RECOGNITION', 'Recognition failed', error);
      const errorMessage = getErrorMessage(error);
      Alert.alert('Lỗi', errorMessage);
    }
  };

  if (loading) {
    return <LoadingIndicator message="Đang nhận diện..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="←"
          onPress={() => navigation.goBack()}
          variant="tertiary"
          style={styles.backButton}
        />
        <Text style={styles.title}>Nhận Diện Khách Hàng</Text>
      </View>

      <View style={styles.modeSelector}>
        <Button
          title="📷 Chụp Ảnh"
          onPress={() => {
            setMode('camera');
            handleTakePhoto();
          }}
          variant={mode === 'camera' ? 'primary' : 'secondary'}
          style={styles.modeButton}
        />
        <Button
          title="🖼️ Chọn Ảnh"
          onPress={() => {
            setMode('gallery');
            handlePickImage();
          }}
          variant={mode === 'gallery' ? 'primary' : 'secondary'}
          style={styles.modeButton}
        />
      </View>

      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <View style={styles.actions}>
            <Button
              title="✓ Xác Nhận"
              onPress={handleRecognize}
              variant="primary"
              style={styles.confirmButton}
            />
            <Button
              title="📷 Chụp Lại"
              onPress={() => {
                setImageUri(null);
                handleTakePhoto();
              }}
              variant="secondary"
              style={styles.retakeButton}
            />
          </View>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Chụp hoặc chọn ảnh để nhận diện
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modeButton: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    marginBottom: 16,
  },
  actions: {
    gap: 12,
  },
  confirmButton: {
    marginBottom: 8,
  },
  retakeButton: {
    marginBottom: 8,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default RecognitionScreen;

