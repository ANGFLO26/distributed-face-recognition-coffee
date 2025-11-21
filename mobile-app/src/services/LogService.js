// Log Service - Logging and error tracking
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../utils/constants';

const MAX_LOGS = 500; // Maximum number of logs to keep
const LOG_STORAGE_KEY = '@app_logs';

class LogService {
  /**
   * Get all logs
   * @returns {Promise<Array>} Array of log entries
   */
  async getLogs() {
    try {
      const logsJson = await AsyncStorage.getItem(LOG_STORAGE_KEY);
      if (!logsJson) {
        return [];
      }
      return JSON.parse(logsJson);
    } catch (error) {
      console.error('Error getting logs:', error);
      return [];
    }
  }

  /**
   * Add a log entry
   * @param {string} level - Log level: 'info', 'warn', 'error', 'debug'
   * @param {string} category - Log category (e.g., 'HTTP', 'IMAGE', 'NETWORK')
   * @param {string} message - Log message
   * @param {Object} data - Additional data (optional)
   */
  async addLog(level, category, message, data = null) {
    try {
      const logs = await this.getLogs();
      const logEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        timestamp: new Date().toISOString(),
        level,
        category,
        message,
        data: data ? JSON.stringify(data, null, 2) : null,
      };

      logs.unshift(logEntry); // Add to beginning

      // Keep only MAX_LOGS entries
      if (logs.length > MAX_LOGS) {
        logs.splice(MAX_LOGS);
      }

      await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));

      // Also log to console for development
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${category}] ${message}`, data || '');
    } catch (error) {
      console.error('Error adding log:', error);
    }
  }

  /**
   * Log info message
   */
  info(category, message, data = null) {
    return this.addLog('info', category, message, data);
  }

  /**
   * Log warning message
   */
  warn(category, message, data = null) {
    return this.addLog('warn', category, message, data);
  }

  /**
   * Log error message
   */
  error(category, message, error = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(error.response && { response: error.response }),
    } : null;
    return this.addLog('error', category, message, errorData);
  }

  /**
   * Log debug message
   */
  debug(category, message, data = null) {
    return this.addLog('debug', category, message, data);
  }

  /**
   * Clear all logs
   */
  async clearLogs() {
    try {
      await AsyncStorage.removeItem(LOG_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing logs:', error);
      return false;
    }
  }

  /**
   * Get logs by level
   * @param {string} level - Log level to filter
   * @returns {Promise<Array>} Filtered logs
   */
  async getLogsByLevel(level) {
    const logs = await this.getLogs();
    return logs.filter(log => log.level === level);
  }

  /**
   * Get error logs only
   * @returns {Promise<Array>} Error logs
   */
  async getErrorLogs() {
    return this.getLogsByLevel('error');
  }

  /**
   * Export logs as text
   * @returns {Promise<string>} Logs as formatted text
   */
  async exportLogs() {
    const logs = await this.getLogs();
    let text = '=== APP LOGS ===\n\n';
    
    logs.forEach(log => {
      text += `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.category}]\n`;
      text += `${log.message}\n`;
      if (log.data) {
        text += `Data: ${log.data}\n`;
      }
      text += '\n';
    });

    return text;
  }
}

export default new LogService();

