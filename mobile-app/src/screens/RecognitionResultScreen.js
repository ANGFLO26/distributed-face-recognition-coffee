// Recognition Result Screen - Display recognition result
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import StorageService from '../services/StorageService';
import { COLORS } from '../utils/constants';
import { formatDate, getErrorMessage, isOrderFromDifferentBranch } from '../utils/helpers';

const RecognitionResultScreen = ({ route, navigation }) => {
  const { response } = route.params || {};
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
          onPress={() => navigation.goBack()}
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
          <Text style={styles.title}>Kết Quả Nhận Diện</Text>
        </View>

        <ErrorMessage icon="⚠️" message={errorMessage} />

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

  // Success - Recognized
  if (response.recognized) {
    const orderFromDifferentBranch = isOrderFromDifferentBranch(
      response.latest_order?.branch_id,
      branchId
    );

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Button
            title="←"
            onPress={() => navigation.goBack()}
            variant="tertiary"
            style={styles.backButton}
          />
          <Text style={styles.title}>Kết Quả Nhận Diện</Text>
        </View>

        <View style={styles.customerCard}>
          <Text style={styles.avatar}>👤</Text>
          <Text style={styles.customerName}>{response.customer_name}</Text>
          <Text style={styles.customerId}>ID: #{response.customer_id}</Text>
          <Text style={styles.branchLabel}>Chi Nhánh: {branchId}</Text>
        </View>

        {response.latest_order && (
          <View style={styles.orderCard}>
            <Text style={styles.orderTitle}>📋 Đơn Hàng Gần Nhất</Text>
            <Text style={styles.orderDetails}>{response.latest_order.order_details}</Text>
            <Text style={styles.orderDate}>
              {formatDate(response.latest_order.order_date)}
            </Text>
            {orderFromDifferentBranch && (
              <View style={styles.differentBranch}>
                <Text style={styles.differentBranchText}>
                  Tại: {response.latest_order.branch_id} (Chi nhánh khác)
                </Text>
              </View>
            )}
            {!orderFromDifferentBranch && (
              <Text style={styles.orderBranch}>
                Tại: {response.latest_order.branch_id}
              </Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Nhận Diện Lại"
            onPress={() => navigation.goBack()}
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
  }

  // Success - Not Recognized
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Button
          title="←"
          onPress={() => navigation.goBack()}
          variant="tertiary"
          style={styles.backButton}
        />
        <Text style={styles.title}>Kết Quả Nhận Diện</Text>
      </View>

      <View style={styles.notFoundCard}>
        <Text style={styles.notFoundIcon}>❓</Text>
        <Text style={styles.notFoundTitle}>Không Tìm Thấy</Text>
        <Text style={styles.notFoundMessage}>
          Khách hàng chưa có trong hệ thống
        </Text>
        <Text style={styles.notFoundSuggestion}>
          Đăng ký khách hàng mới ngay?
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Đăng Ký Ngay"
          onPress={() => navigation.navigate('Registration')}
          variant="primary"
          style={styles.button}
        />
        <Button
          title="Thử Lại"
          onPress={() => navigation.goBack()}
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
  customerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    fontSize: 64,
    marginBottom: 16,
  },
  customerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  customerId: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  branchLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  orderDetails: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  orderDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  orderBranch: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  differentBranch: {
    backgroundColor: COLORS.warning + '20',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  differentBranchText: {
    fontSize: 14,
    color: COLORS.warning,
    fontWeight: '600',
  },
  notFoundCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  notFoundIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  notFoundMessage: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  notFoundSuggestion: {
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

export default RecognitionResultScreen;

