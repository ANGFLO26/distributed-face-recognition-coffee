// Home Screen - Main entry point
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../components/common/Button';
import StorageService from '../services/StorageService';
import NetworkService from '../services/NetworkService';
import { COLORS } from '../utils/constants';

const HomeScreen = ({ navigation }) => {
  const [branchId, setBranchId] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadBranchId();
    checkNetwork();
    
    // Subscribe to network changes
    const unsubscribe = NetworkService.subscribe((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadBranchId = async () => {
    const id = await StorageService.getBranchId();
    setBranchId(id);
  };

  const checkNetwork = async () => {
    const connected = await NetworkService.isConnected();
    setIsConnected(connected);
  };

  const getConnectionStatus = () => {
    if (isConnected) {
      return { text: '🟢 Connected', color: COLORS.success };
    }
    return { text: '🔴 Disconnected', color: COLORS.error };
  };

  const status = getConnectionStatus();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>☕ Coffeehouse</Text>
        <Button
          title="⚙️"
          onPress={() => navigation.navigate('Settings')}
          variant="tertiary"
          style={styles.settingsButton}
        />
      </View>
      
      <Text style={styles.branchLabel}>Chi Nhánh: {branchId}</Text>
      <Text style={[styles.statusLabel, { color: status.color }]}>
        Status: {status.text}
      </Text>

      <View style={styles.actions}>
        <Button
          title="📸 Nhận Diện Khách Hàng"
          onPress={() => navigation.navigate('Recognition')}
          variant="primary"
          style={styles.actionButton}
          disabled={!isConnected}
        />
        
        <Button
          title="➕ Đăng Ký Khách Hàng Mới"
          onPress={() => navigation.navigate('Registration')}
          variant="primary"
          style={styles.actionButton}
          disabled={!isConnected}
        />
      </View>

      {!isConnected && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠️ Cần kết nối mạng để sử dụng ứng dụng
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  branchLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    marginBottom: 32,
  },
  actions: {
    gap: 16,
  },
  actionButton: {
    marginBottom: 8,
  },
  warning: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.warning + '20',
    borderRadius: 8,
  },
  warningText: {
    color: COLORS.warning,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default HomeScreen;

