// Storage Service - AsyncStorage wrapper
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../utils/constants';

class StorageService {
  // Branch ID
  async getBranchId() {
    try {
      const branchId = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.BRANCH_ID);
      return branchId || APP_CONFIG.DEFAULT_BRANCH_ID;
    } catch (error) {
      console.error('Error getting branch_id:', error);
      return APP_CONFIG.DEFAULT_BRANCH_ID;
    }
  }

  async setBranchId(branchId) {
    try {
      await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.BRANCH_ID, branchId);
      return true;
    } catch (error) {
      console.error('Error setting branch_id:', error);
      return false;
    }
  }

  // Server Configuration
  async getServerHost() {
    try {
      const host = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.SERVER_HOST);
      return host || APP_CONFIG.DEFAULT_SERVER_HOST;
    } catch (error) {
      console.error('Error getting server_host:', error);
      return APP_CONFIG.DEFAULT_SERVER_HOST;
    }
  }

  async setServerHost(host) {
    try {
      await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.SERVER_HOST, host);
      return true;
    } catch (error) {
      console.error('Error setting server_host:', error);
      return false;
    }
  }

  async getServerPort() {
    try {
      const port = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.SERVER_PORT);
      return port ? parseInt(port, 10) : APP_CONFIG.DEFAULT_SERVER_PORT;
    } catch (error) {
      console.error('Error getting server_port:', error);
      return APP_CONFIG.DEFAULT_SERVER_PORT;
    }
  }

  async getHttpPort() {
    try {
      const port = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.HTTP_PORT);
      return port ? parseInt(port, 10) : APP_CONFIG.DEFAULT_HTTP_PORT;
    } catch (error) {
      console.error('Error getting http_port:', error);
      return APP_CONFIG.DEFAULT_HTTP_PORT;
    }
  }

  async setHttpPort(port) {
    try {
      await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.HTTP_PORT, port.toString());
      return true;
    } catch (error) {
      console.error('Error setting http_port:', error);
      return false;
    }
  }

  async setServerPort(port) {
    try {
      await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.SERVER_PORT, port.toString());
      return true;
    } catch (error) {
      console.error('Error setting server_port:', error);
      return false;
    }
  }

  // Check if first launch
  async isFirstLaunch() {
    try {
      const branchId = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.BRANCH_ID);
      return branchId === null;
    } catch (error) {
      return true; // Assume first launch on error
    }
  }
}

export default new StorageService();

