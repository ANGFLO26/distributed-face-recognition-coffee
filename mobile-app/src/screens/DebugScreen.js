// Debug Screen - View logs and errors
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { Button } from '../components/common/Button';
import LogService from '../services/LogService';
import { COLORS } from '../utils/constants';

const DebugScreen = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'error', 'warn', 'info', 'debug'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let allLogs = await LogService.getLogs();
      
      if (filter !== 'all') {
        allLogs = allLogs.filter(log => log.level === filter);
      }
      
      setLogs(allLogs);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Xác Nhận',
      'Bạn có chắc muốn xóa tất cả logs?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await LogService.clearLogs();
            loadLogs();
            Alert.alert('Thành Công', 'Đã xóa tất cả logs.');
          },
        },
      ]
    );
  };

  const handleExportLogs = async () => {
    try {
      const logText = await LogService.exportLogs();
      await Share.share({
        message: logText,
        title: 'App Logs',
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể export logs.');
    }
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'error':
        return COLORS.error;
      case 'warn':
        return COLORS.warning;
      case 'info':
        return COLORS.success;
      case 'debug':
        return COLORS.textSecondary;
      default:
        return COLORS.text;
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('vi-VN');
    } catch {
      return timestamp;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="←"
          onPress={() => navigation.goBack()}
          variant="tertiary"
          style={styles.backButton}
        />
        <Text style={styles.title}>Debug & Logs</Text>
      </View>

      <View style={styles.controls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'error', 'warn', 'info', 'debug'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.filterButton,
                filter === level && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(level)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === level && styles.filterButtonTextActive,
                ]}
              >
                {level.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.actions}>
          <Button
            title="🔄 Refresh"
            onPress={loadLogs}
            variant="secondary"
            style={styles.actionButton}
            loading={loading}
          />
          <Button
            title="📤 Export"
            onPress={handleExportLogs}
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title="🗑️ Clear"
            onPress={handleClearLogs}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>
      </View>

      <ScrollView style={styles.logsContainer}>
        {logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có logs</Text>
          </View>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={styles.logEntry}>
              <View style={styles.logHeader}>
                <Text style={[styles.logLevel, { color: getLogColor(log.level) }]}>
                  {log.level.toUpperCase()}
                </Text>
                <Text style={styles.logCategory}>[{log.category}]</Text>
                <Text style={styles.logTimestamp}>{formatTimestamp(log.timestamp)}</Text>
              </View>
              <Text style={styles.logMessage}>{log.message}</Text>
              {log.data && (
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <Text style={styles.logData}>{log.data}</Text>
                </ScrollView>
              )}
            </View>
          ))
        )}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textSecondary + '20',
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
  controls: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textSecondary + '20',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  logsContainer: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  logEntry: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.textSecondary,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  logLevel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  logCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  logTimestamp: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  logMessage: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  logData: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 4,
  },
});

export default DebugScreen;

