// HTTP Service - REST API communication (Expo Go compatible)
// Uses fetch() API instead of TCP socket
import { APP_CONFIG } from '../utils/constants';
import StorageService from './StorageService';
import LogService from './LogService';

class HttpService {
  /**
   * Generate request ID
   * @returns {string} Request ID
   */
  _generateRequestId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `req_${timestamp}${random}`;
  }

  /**
   * Send HTTP request to server
   * @param {string} endpoint - API endpoint (/api/recognize or /api/register)
   * @param {Object} message - JSON message to send
   * @returns {Promise<Object>} Response object
   */
  async sendRequest(endpoint, message) {
    const requestId = message.request_id || 'unknown';
    let host, port, url;
    
    try {
      // Get server configuration
      host = await StorageService.getServerHost();
      port = await StorageService.getHttpPort();
      
      // Build URL
      url = `http://${host}:${port}${endpoint}`;
      
      LogService.debug('HTTP', `Sending request to ${url}`, {
        endpoint,
        requestId,
        host,
        port,
      });

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      // Send POST request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      LogService.debug('HTTP', `Response received`, {
        endpoint,
        requestId,
        status: response.status,
        statusText: response.statusText,
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        LogService.error('HTTP', 'Non-JSON response received', {
          endpoint,
          requestId,
          status: response.status,
          contentType,
          body: text.substring(0, 500), // First 500 chars
        });
        throw new Error(`Server returned non-JSON response: ${response.status}`);
      }

      // Parse response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        LogService.error('HTTP', 'Failed to parse JSON response', {
          endpoint,
          requestId,
          parseError: parseError.message,
        });
        throw new Error('Invalid JSON response from server');
      }
      
      // Check HTTP status
      if (!response.ok) {
        const errorMessage = data.error_message || data.message || `HTTP ${response.status}`;
        LogService.warn('HTTP', `Request failed`, {
          endpoint,
          requestId,
          status: response.status,
          error: errorMessage,
          response: data,
        });
        throw new Error(errorMessage);
      }

      LogService.info('HTTP', `Request successful`, {
        endpoint,
        requestId,
        status: response.status,
      });
      
      return data;
    } catch (error) {
      // Handle abort (timeout)
      if (error.name === 'AbortError') {
        LogService.error('HTTP', 'Request timeout', {
          endpoint,
          requestId,
          url,
          timeout: '30s',
        });
        throw new Error('Kết nối timeout. Vui lòng kiểm tra lại server và network.');
      }

      // Handle network errors
      if (error.message.includes('Network request failed') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError')) {
        LogService.error('HTTP', 'Network connection failed', {
          endpoint,
          requestId,
          url,
          error: error.message,
        });
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra network và server IP.');
      }

      // Handle other errors
      LogService.error('HTTP', 'Request error', {
        endpoint,
        requestId,
        url,
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }

  /**
   * Send RECOGNIZE request
   * @param {string} imageBase64 - Base64 encoded image
   * @param {string} branchId - Branch ID
   * @returns {Promise<Object>} Response object
   */
  async recognizeFace(imageBase64, branchId) {
    const requestId = this._generateRequestId();
    const message = {
      request_type: 'RECOGNIZE',
      image_data: imageBase64,
      branch_id: branchId,
      request_id: requestId,
    };

    LogService.info('HTTP', 'Recognize request', {
      requestId,
      branchId,
      imageSize: imageBase64 ? imageBase64.length : 0,
    });
    
    try {
      const response = await this.sendRequest('/api/recognize', message);
      LogService.info('HTTP', 'Recognize success', {
        requestId,
        recognized: response.recognized,
        customerId: response.customer_id,
      });
      return response;
    } catch (error) {
      LogService.error('HTTP', 'Recognize failed', error);
      throw error;
    }
  }

  /**
   * Send REGISTER request
   * @param {string} imageBase64 - Base64 encoded image
   * @param {string} customerName - Customer name
   * @param {string} orderDetails - Order details
   * @param {string} branchId - Branch ID
   * @returns {Promise<Object>} Response object
   */
  async registerCustomer(imageBase64, customerName, orderDetails, branchId) {
    const requestId = this._generateRequestId();
    const message = {
      request_type: 'REGISTER',
      image_data: imageBase64,
      customer_name: customerName,
      order_details: orderDetails,
      branch_id: branchId,
      request_id: requestId,
    };

    LogService.info('HTTP', 'Register request', {
      requestId,
      branchId,
      customerName,
      imageSize: imageBase64 ? imageBase64.length : 0,
    });
    
    try {
      const response = await this.sendRequest('/api/register', message);
      LogService.info('HTTP', 'Register success', {
        requestId,
        customerId: response.customer_id,
      });
      return response;
    } catch (error) {
      LogService.error('HTTP', 'Register failed', error);
      throw error;
    }
  }
}

export default new HttpService();

