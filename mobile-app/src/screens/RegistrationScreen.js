// Registration Screen - Register new customer
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { LoadingIndicator } from '../components/common/LoadingIndicator';
import ImageService from '../services/ImageService';
import HttpService from '../services/HttpService';
import StorageService from '../services/StorageService';
import NetworkService from '../services/NetworkService';
import LogService from '../services/LogService';
import { validateCustomerName, validateOrderDetails } from '../utils/validators';
import { COLORS } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';

const RegistrationScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [orderDetails, setOrderDetails] = useState('');
  const [branchId, setBranchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    loadBranchId();
  }, []);

  const loadBranchId = async () => {
    const id = await StorageService.getBranchId();
    setBranchId(id);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'App cần quyền truy cập ảnh.');
      return;
    }

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

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'App cần quyền camera để chụp ảnh.');
      return;
    }

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!imageUri) {
      newErrors.image = 'Vui lòng chụp hoặc chọn ảnh';
    }
    
    const nameValidation = validateCustomerName(customerName);
    if (!nameValidation.valid) {
      newErrors.customerName = nameValidation.error;
    }
    
    const detailsValidation = validateOrderDetails(orderDetails);
    if (!detailsValidation.valid) {
      newErrors.orderDetails = detailsValidation.error;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    // Check network
    const isConnected = await NetworkService.isConnected();
    if (!isConnected) {
      LogService.warn('NETWORK', 'No network connection for register');
      Alert.alert('Lỗi', 'Không có kết nối mạng. Vui lòng kiểm tra WiFi/Mobile Data.');
      return;
    }

    setLoading(true);

    try {
      LogService.info('REGISTRATION', 'Starting registration process', {
        customerName,
        branchId,
        imageUri,
      });
      
      // Process image
      const imageBase64 = await ImageService.processImage(imageUri);
      LogService.debug('REGISTRATION', 'Image processed', { 
        base64Length: imageBase64 ? imageBase64.length : 0 
      });
      
      // Send register request
      const response = await HttpService.registerCustomer(
        imageBase64,
        customerName.trim(),
        orderDetails.trim(),
        branchId
      );
      
      setLoading(false);
      
      LogService.info('REGISTRATION', 'Registration successful', {
        customerId: response.customer_id,
      });
      
      // Navigate to result screen
      navigation.navigate('RegistrationResult', { response, customerName });
    } catch (error) {
      setLoading(false);
      LogService.error('REGISTRATION', 'Registration failed', error);
      const errorMessage = getErrorMessage(error);
      Alert.alert('Lỗi', errorMessage);
    }
  };

  if (loading) {
    return <LoadingIndicator message="Đang đăng ký..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Button
          title="←"
          onPress={() => navigation.goBack()}
          variant="tertiary"
          style={styles.backButton}
        />
        <Text style={styles.title}>Đăng Ký Khách Hàng</Text>
      </View>

      <View style={styles.imageSection}>
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <View style={styles.imageActions}>
              <Button
                title="📷 Chụp Lại"
                onPress={handleTakePhoto}
                variant="secondary"
                style={styles.imageButton}
              />
              <Button
                title="🖼️ Chọn Lại"
                onPress={handlePickImage}
                variant="secondary"
                style={styles.imageButton}
              />
            </View>
          </>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Chưa có ảnh</Text>
            <View style={styles.imageButtons}>
              <Button
                title="📷 Chụp Ảnh"
                onPress={handleTakePhoto}
                variant="primary"
                style={styles.imageButton}
              />
              <Button
                title="🖼️ Chọn Ảnh"
                onPress={handlePickImage}
                variant="secondary"
                style={styles.imageButton}
              />
            </View>
          </View>
        )}
        {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
      </View>

      <Input
        label="Tên Khách Hàng *"
        value={customerName}
        onChangeText={(text) => {
          setCustomerName(text);
          if (errors.customerName) {
            setErrors({ ...errors, customerName: '' });
          }
        }}
        placeholder="Nhập tên khách hàng"
        error={errors.customerName}
      />

      <Input
        label="Chi Tiết Đơn Hàng *"
        value={orderDetails}
        onChangeText={(text) => {
          setOrderDetails(text);
          if (errors.orderDetails) {
            setErrors({ ...errors, orderDetails: '' });
          }
        }}
        placeholder="Ví dụ: Cappuccino, Medium, Extra shot"
        error={errors.orderDetails}
        multiline
      />

      <View style={styles.branchInfo}>
        <Text style={styles.branchLabel}>Chi Nhánh:</Text>
        <Text style={styles.branchValue}>{branchId}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="✓ Đăng Ký"
          onPress={handleRegister}
          variant="primary"
          style={styles.registerButton}
        />
        <Button
          title="✗ Hủy"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={styles.cancelButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  imageSection: {
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
  },
  imagePlaceholder: {
    height: 300,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  branchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  branchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  branchValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  actions: {
    gap: 12,
  },
  registerButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
});

export default RegistrationScreen;

