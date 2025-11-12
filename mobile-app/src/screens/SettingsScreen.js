// Settings Screen - Configure app and branch
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import StorageService from '../services/StorageService';
import NetworkService from '../services/NetworkService';
import { validateBranchId, validateServerHost, validateServerPort } from '../utils/validators';
import { COLORS, APP_CONFIG } from '../utils/constants';

const SettingsScreen = ({ navigation }) => {
  const [branchId, setBranchId] = useState('');
  const [serverHost, setServerHost] = useState('');
  const [httpPort, setHttpPort] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSettings();
    checkNetwork();
    
    const unsubscribe = NetworkService.subscribe((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadSettings = async () => {
    const id = await StorageService.getBranchId();
    const host = await StorageService.getServerHost();
    const port = await StorageService.getHttpPort();
    
    setBranchId(id);
    setServerHost(host);
    setHttpPort(port.toString());
  };

  const checkNetwork = async () => {
    const connected = await NetworkService.isConnected();
    setIsConnected(connected);
  };

  const handleSaveBranchId = async () => {
    const validation = validateBranchId(branchId);
    if (!validation.valid) {
      setErrors({ ...errors, branchId: validation.error });
      return;
    }

    const saved = await StorageService.setBranchId(branchId);
    if (saved) {
      Alert.alert('Thành Công', 'Branch ID đã được lưu.');
      setErrors({ ...errors, branchId: '' });
    } else {
      Alert.alert('Lỗi', 'Không thể lưu Branch ID.');
    }
  };

  const handleSaveServer = async () => {
    const hostValidation = validateServerHost(serverHost);
    const portValidation = validateServerPort(httpPort);
    
    const newErrors = {};
    if (!hostValidation.valid) {
      newErrors.serverHost = hostValidation.error;
    }
    if (!portValidation.valid) {
      newErrors.httpPort = portValidation.error;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors({ ...errors, ...newErrors });
      return;
    }

    await StorageService.setServerHost(serverHost);
    await StorageService.setHttpPort(parseInt(httpPort, 10));
    
    Alert.alert('Thành Công', 'Cài đặt server đã được lưu.');
    setErrors({ ...errors, serverHost: '', httpPort: '' });
  };

  const handleTestConnection = async () => {
    const isNetworkConnected = await NetworkService.isConnected();
    if (!isNetworkConnected) {
      Alert.alert('Lỗi', 'Không có kết nối mạng.');
      return;
    }

    setTestingConnection(true);

    try {
      const host = serverHost || await StorageService.getServerHost();
      const port = parseInt(httpPort || await StorageService.getHttpPort(), 10);
      const url = `http://${host}:${port}/api/health`;
      
      // Test connection với health endpoint (with timeout)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        Alert.alert('Thành Công', `Kết nối đến server thành công!\nHost: ${host}\nPort: ${port}`);
      } else {
        Alert.alert('Lỗi', 'Server không phản hồi. Vui lòng kiểm tra lại.');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        Alert.alert('Lỗi', 'Kết nối timeout. Vui lòng kiểm tra lại server và network.');
      } else {
        Alert.alert('Lỗi', 'Không thể kết nối đến server. Vui lòng kiểm tra lại cài đặt và đảm bảo server đang chạy.');
      }
    } finally {
      setTestingConnection(false);
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Xác Nhận',
      'Bạn có chắc muốn reset tất cả cài đặt về mặc định?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await StorageService.setBranchId(APP_CONFIG.DEFAULT_BRANCH_ID);
            await StorageService.setServerHost(APP_CONFIG.DEFAULT_SERVER_HOST);
            await StorageService.setHttpPort(APP_CONFIG.DEFAULT_HTTP_PORT);
            loadSettings();
            Alert.alert('Thành Công', 'Đã reset về cài đặt mặc định.');
          },
        },
      ]
    );
  };

  const getConnectionStatus = () => {
    if (testingConnection) {
      return { text: '🟡 Testing...', color: COLORS.warning };
    }
    if (isConnected) {
      return { text: '🟢 Connected', color: COLORS.success };
    }
    return { text: '🔴 Disconnected', color: COLORS.error };
  };

  const status = getConnectionStatus();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Button
          title="←"
          onPress={() => navigation.goBack()}
          variant="tertiary"
          style={styles.backButton}
        />
        <Text style={styles.title}>Cài Đặt</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chi Nhánh</Text>
        <Input
          label="Branch ID"
          value={branchId}
          onChangeText={(text) => {
            setBranchId(text.toUpperCase());
            if (errors.branchId) {
              setErrors({ ...errors, branchId: '' });
            }
          }}
          placeholder="BRANCH_001"
          error={errors.branchId}
          autoCapitalize="characters"
        />
        <Button
          title="Lưu Branch ID"
          onPress={handleSaveBranchId}
          variant="primary"
          style={styles.saveButton}
        />
        <Text style={styles.warning}>
          ⚠️ Thay đổi Branch ID sẽ ảnh hưởng đến tất cả requests
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Server (HTTP API)</Text>
        <Input
          label="Server Host"
          value={serverHost}
          onChangeText={(text) => {
            setServerHost(text);
            if (errors.serverHost) {
              setErrors({ ...errors, serverHost: '' });
            }
          }}
          placeholder="localhost hoặc IP"
          error={errors.serverHost}
        />
        <Input
          label="HTTP Port"
          value={httpPort}
          onChangeText={(text) => {
            setHttpPort(text);
            if (errors.httpPort) {
              setErrors({ ...errors, httpPort: '' });
            }
          }}
          placeholder="8889"
          keyboardType="numeric"
          error={errors.httpPort}
        />
        <Button
          title="Lưu Server Config"
          onPress={handleSaveServer}
          variant="primary"
          style={styles.saveButton}
        />
        <Button
          title="Test Connection"
          onPress={handleTestConnection}
          variant="secondary"
          style={styles.testButton}
          loading={testingConnection}
        />
        <Text style={[styles.statusLabel, { color: status.color }]}>
          Status: {status.text}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Info</Text>
        <Text style={styles.infoText}>Version: 1.0.0</Text>
        <Text style={styles.infoText}>Build: 001</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug</Text>
        <Button
          title="🔍 View Logs & Errors"
          onPress={() => navigation.navigate('Debug')}
          variant="secondary"
          style={styles.debugButton}
        />
        <Text style={styles.debugHint}>
          Xem logs và errors để debug các vấn đề kết nối
        </Text>
      </View>

      <View style={styles.section}>
        <Button
          title="Reset Settings"
          onPress={handleResetSettings}
          variant="secondary"
          style={styles.resetButton}
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  testButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  warning: {
    fontSize: 12,
    color: COLORS.warning,
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  resetButton: {
    marginTop: 8,
  },
  debugButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  debugHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default SettingsScreen;

