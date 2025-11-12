// Network Service - Network status detection
import NetInfo from '@react-native-community/netinfo';

class NetworkService {
  async isConnected() {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }

  subscribe(callback) {
    return NetInfo.addEventListener(callback);
  }

  async getConnectionType() {
    try {
      const state = await NetInfo.fetch();
      return state.type; // 'wifi', 'cellular', 'none', etc.
    } catch (error) {
      console.error('Error getting connection type:', error);
      return 'unknown';
    }
  }
}

export default new NetworkService();

