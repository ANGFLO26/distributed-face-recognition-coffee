// Splash Screen - First launch setup
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import StorageService from '../services/StorageService';
import { validateBranchId } from '../utils/validators';
import { COLORS, APP_CONFIG } from '../utils/constants';

const SplashScreen = ({ navigation }) => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [branchId, setBranchId] = useState(APP_CONFIG.DEFAULT_BRANCH_ID);
  const [error, setError] = useState('');

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    const firstLaunch = await StorageService.isFirstLaunch();
    setIsFirstLaunch(firstLaunch);
    
    if (!firstLaunch) {
      // Navigate to Home after a short delay
      setTimeout(() => {
        navigation.replace('Home');
      }, 1000);
    } else {
      // Load default branch ID
      const savedBranchId = await StorageService.getBranchId();
      setBranchId(savedBranchId);
    }
  };

  const handleContinue = async () => {
    // Validate branch ID
    const validation = validateBranchId(branchId);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Save branch ID
    const saved = await StorageService.setBranchId(branchId);
    if (saved) {
      navigation.replace('Home');
    } else {
      Alert.alert('Lỗi', 'Không thể lưu Branch ID. Vui lòng thử lại.');
    }
  };

  if (!isFirstLaunch) {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>☕</Text>
        <Text style={styles.title}>Coffeehouse</Text>
        <Text style={styles.subtitle}>Face Recognition</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>☕</Text>
      <Text style={styles.title}>Coffeehouse</Text>
      <Text style={styles.subtitle}>Face Recognition</Text>
      
      <View style={styles.form}>
        <Input
          label="Branch ID"
          value={branchId}
          onChangeText={(text) => {
            setBranchId(text.toUpperCase());
            setError('');
          }}
          placeholder="BRANCH_001"
          error={error}
          autoCapitalize="characters"
        />
        
        <Button
          title="Lưu và Tiếp Tục"
          onPress={handleContinue}
          variant="primary"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 40,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
});

export default SplashScreen;

