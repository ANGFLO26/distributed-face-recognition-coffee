// App Constants
export const APP_CONFIG = {
  // Server Configuration (defaults, can be changed in Settings)
  DEFAULT_SERVER_HOST: 'localhost',
  DEFAULT_SERVER_PORT: 8888,  // TCP Socket port (for Python client)
  DEFAULT_HTTP_PORT: 8889,     // HTTP API port (for mobile app)
  
  // Branch Configuration
  DEFAULT_BRANCH_ID: 'BRANCH_001',
  BRANCH_ID_PATTERN: /^BRANCH_\d{3}$/,
  
  // Image Processing
  MAX_IMAGE_WIDTH: 800,
  MAX_IMAGE_HEIGHT: 800,
  IMAGE_QUALITY: 0.8, // 80%
  
  // Network
  SOCKET_TIMEOUT: 30000, // 30 seconds
  
  // Storage Keys
  STORAGE_KEYS: {
    BRANCH_ID: '@branch_id',
    SERVER_HOST: '@server_host',
    SERVER_PORT: '@server_port',
    HTTP_PORT: '@http_port',
    FIRST_LAUNCH: '@first_launch',
  },
};

export const COLORS = {
  primary: '#8B4513',      // Coffee brown
  success: '#4CAF50',      // Green
  error: '#F44336',        // Red
  warning: '#FF9800',      // Orange
  background: '#F5F5F5',   // Light gray
  text: '#212121',         // Dark gray
  textSecondary: '#757575', // Medium gray
  white: '#FFFFFF',
  black: '#000000',
};

export const ERROR_MESSAGES = {
  NO_FACE_DETECTED: 'Không phát hiện khuôn mặt. Vui lòng chụp lại với ánh sáng tốt hơn.',
  FACE_ENCODING_FAILED: 'Không thể xử lý ảnh. Vui lòng thử lại.',
  PROCESSING_ERROR: 'Lỗi xử lý. Vui lòng thử lại.',
  SERVER_ERROR: 'Lỗi server. Vui lòng thử lại sau.',
  INVALID_REQUEST: 'Yêu cầu không hợp lệ.',
  UNKNOWN_REQUEST_TYPE: 'Loại yêu cầu không xác định.',
  NETWORK_ERROR: 'Không có kết nối mạng. Vui lòng kiểm tra WiFi/Mobile Data.',
  CONNECTION_REFUSED: 'Không thể kết nối đến server. Vui lòng kiểm tra cài đặt.',
  CONNECTION_TIMEOUT: 'Kết nối timeout. Vui lòng thử lại.',
};

