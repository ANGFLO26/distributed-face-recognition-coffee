// Registration Result Screen - Display registration result
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import StorageService from '../services/StorageService';
import { COLORS } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';

const RegistrationResultScreen = ({ route, navigation }) => {
  const { response, customerName } = route.params || {};
  const [branchId, setBranchId] = React.useState('');

  React.useEffect(() => {
    loadBranchId();
  }, []);

  const loadBranchId = async () => {
    const id = await StorageService.getBranchId();
    setBranchId(id);
  };

  if (!response) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="Không có dữ liệu phản hồi" />
        <Button
          title="Quay Lại"
          onPress={() => navigation.navigate('Home')}
          variant="primary"
          style={styles.button}
        />
      </View>
    );
  }

  // Error case
  if (response.status === 'error') {
    const errorMessage = getErrorMessage(response);
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Button
            title="←"
            onPress={() => navigation.goBack()}
            variant="tertiary"
            style={styles.backButton}
          />
          <Text style={styles.title}>Kết Quả Đăng Ký</Text>
        </View>

        <ErrorMessage icon="❌" message={errorMessage} />

        <View style={styles.actions}>
          <Button
            title="Thử Lại"
            onPress={() => navigation.goBack()}
            variant="primary"
            style={styles.button}
          />
          <Button
            title="Quay Lại"
            onPress={() => navigation.navigate('Home')}
            variant="secondary"
            style={styles.button}
          />
        </View>
      </ScrollView>
    );
  }

  // Success case
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Button
          title="←"
          onPress={() => navigation.navigate('Home')}
          variant="tertiary"
          style={styles.backButton}
        />
        <Text style={styles.title}>Kết Quả Đăng Ký</Text>
      </View>

      <View style={styles.successCard}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Đăng Ký Thành Công!</Text>
        
        {customerName && (
          <Text style={styles.customerName}>{customerName}</Text>
        )}
        
        <Text style={styles.customerId}>Customer ID: #{response.customer_id}</Text>
        <Text style={styles.branchLabel}>Chi Nhánh: {branchId}</Text>
        
        <Text style={styles.message}>
          Khách hàng đã được thêm vào hệ thống
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Nhận Diện Ngay"
          onPress={() => navigation.navigate('Recognition')}
          variant="primary"
          style={styles.button}
        />
        <Button
          title="Đăng Ký Tiếp"
          onPress={() => navigation.navigate('Registration')}
          variant="secondary"
          style={styles.button}
        />
        <Button
          title="Quay Lại"
          onPress={() => navigation.navigate('Home')}
          variant="tertiary"
          style={styles.button}
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
  successCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 16,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  customerId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  branchLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
});

export default RegistrationResultScreen;

