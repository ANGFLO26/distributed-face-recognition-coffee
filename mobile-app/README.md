# 📱 Coffeehouse Face Recognition - Mobile App

Ứng dụng mobile nhận diện và đăng ký khách hàng cho chuỗi coffeehouse sử dụng React Native + Expo.

## 📋 Mục Lục

- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt](#cài-đặt)
- [Cấu Hình](#cấu-hình)
- [Chạy App](#chạy-app)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Troubleshooting](#troubleshooting)
- [Debug & Logging](#debug--logging)

---

## 📱 Yêu Cầu Hệ Thống

### Hệ Điều Hành
- **Development:** macOS, Linux, hoặc Windows
- **Mobile:** iOS 13+ hoặc Android 6+

### Dependencies
- Node.js 18+
- npm hoặc yarn
- Expo CLI (tự động cài khi chạy `npm install`)

### Mobile Device
- **iOS:** iPhone với iOS 13+ và Expo Go app
- **Android:** Android 6+ và Expo Go app
- **Network:** WiFi hoặc Mobile Data (cùng network với backend server)

---

## 📦 Cài Đặt

### 1. Clone Repository
```bash
cd mobile-app
```

### 2. Cài Đặt Dependencies
```bash
npm install
```

**Lưu Ý:** Nếu gặp lỗi `No matching version found`:
- Kiểm tra Node.js version: `node --version` (cần >= 18)
- Xóa `node_modules` và `package-lock.json`, sau đó chạy lại `npm install`

### 3. Cài Đặt Expo CLI (Nếu Chưa Có)
```bash
npm install -g expo-cli
```

Hoặc sử dụng npx (không cần cài global):
```bash
npx expo start
```

---

## ⚙️ Cấu Hình

### 1. Cấu Hình Trong App

App sẽ tự động yêu cầu cấu hình khi lần đầu mở:

1. **Branch ID:** Nhập Branch ID (ví dụ: `BRANCH_001`)
2. **Server Host:** IP address của backend server (ví dụ: `192.168.1.100`)
3. **HTTP Port:** Port của HTTP API server (mặc định: `8889`)

### 2. Cấu Hình Thủ Công

Vào **Settings** → Cấu hình:
- **Branch ID:** Mã chi nhánh
- **Server Host:** IP của backend server
- **HTTP Port:** Port HTTP API (mặc định: 8889)

**Lưu Ý:**
- Server Host phải là IP address, không phải `localhost`
- Đảm bảo mobile device và backend server cùng WiFi network
- Hoặc sử dụng public IP nếu server có public IP

---

## 🚀 Chạy App

### 1. Khởi Động Development Server
```bash
npm start
```

Hoặc:
```bash
npx expo start
```

### 2. Mở App Trên Mobile

**Cách 1: Expo Go (Khuyến Nghị)**
1. Cài **Expo Go** trên điện thoại:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Quét QR code hiển thị trong terminal
3. App sẽ tự động mở trên điện thoại

**Cách 2: Development Build**
```bash
# Android
npm run android

# iOS (chỉ macOS)
npm run ios
```

### 3. Kiểm Tra Kết Nối

1. Mở app trên điện thoại
2. Vào **Settings**
3. Nhấn **"Test Connection"**
4. Nếu thành công: "Kết nối đến server thành công!"

---

## 📁 Cấu Trúc Dự Án

```
mobile-app/
├── README.md              # File này
├── package.json          # Dependencies
├── app.json              # Expo configuration
├── App.js                # Entry point
│
├── src/
│   ├── screens/          # App screens
│   │   ├── SplashScreen.js
│   │   ├── HomeScreen.js
│   │   ├── RecognitionScreen.js
│   │   ├── RecognitionResultScreen.js
│   │   ├── RegistrationScreen.js
│   │   ├── RegistrationResultScreen.js
│   │   ├── SettingsScreen.js
│   │   └── DebugScreen.js
│   │
│   ├── services/          # Services
│   │   ├── HttpService.js      # HTTP API communication
│   │   ├── ImageService.js     # Image processing
│   │   ├── LogService.js       # Logging system
│   │   ├── NetworkService.js   # Network status
│   │   └── StorageService.js   # Local storage
│   │
│   ├── components/        # UI components
│   │   └── common/
│   │       ├── Button.js
│   │       ├── Input.js
│   │       ├── LoadingIndicator.js
│   │       └── ErrorMessage.js
│   │
│   ├── navigation/        # Navigation
│   │   └── AppNavigator.js
│   │
│   └── utils/            # Utilities
│       ├── constants.js
│       ├── helpers.js
│       └── validators.js
│
└── assets/               # Images, icons
```

---

## 🔍 Debug & Logging

### Xem Logs

1. Mở app
2. Vào **Settings**
3. Scroll xuống phần **Debug**
4. Nhấn **"🔍 View Logs & Errors"**

### Tính Năng Debug Screen

- **Filter Logs:** Filter theo level (ALL, ERROR, WARN, INFO, DEBUG)
- **Export Logs:** Chia sẻ logs qua email/messenger
- **Clear Logs:** Xóa tất cả logs
- **Refresh:** Reload logs

### Log Levels

- **ERROR:** Lỗi nghiêm trọng
- **WARN:** Cảnh báo
- **INFO:** Thông tin quan trọng
- **DEBUG:** Chi tiết kỹ thuật

### Khi Gặp Lỗi

1. Mở **Debug Screen**
2. Filter: **ERROR**
3. Xem chi tiết log:
   - URL đang được gọi
   - Error message
   - Request ID
   - Timestamp
4. Export logs và gửi cho developer

---

## 🔧 Troubleshooting

### 1. "Không thể kết nối đến server"

**Kiểm tra:**
- Backend server đang chạy: `python3 run_server.py`
- IP address trong Settings đúng
- Mobile device và server cùng WiFi network
- Firewall không block port 8889

**Debug:**
- Mở Debug Screen → Filter: ERROR
- Xem log "Network connection failed"
- Kiểm tra URL trong log

### 2. "Request timeout"

**Giải pháp:**
- Kiểm tra network connection
- Server có thể đang xử lý chậm
- Thử lại sau vài giây

### 3. "No matching version found"

**Giải pháp:**
```bash
# Xóa cache
rm -rf node_modules package-lock.json

# Cài lại
npm install
```

### 4. Expo Go không kết nối được

**Kiểm tra:**
- Mobile device và computer cùng WiFi network
- Firewall không block port 19000, 19001, 19002
- Thử dùng tunnel mode: `npx expo start --tunnel`

### 5. Camera không hoạt động

**Giải pháp:**
- Kiểm tra permissions trong Settings của điện thoại
- App cần quyền Camera và Storage
- Restart app sau khi cấp quyền

### 6. "Invalid JSON response"

**Giải pháp:**
- Kiểm tra backend server đang chạy
- Kiểm tra HTTP port trong Settings
- Xem logs trong Debug Screen

---

## 📱 Tính Năng

### 1. Nhận Diện Khách Hàng
- Chụp hoặc chọn ảnh
- Gửi request đến server
- Hiển thị kết quả:
  - ✅ Nhận diện thành công → Hiển thị thông tin khách hàng
  - ❌ Không nhận diện được → Thông báo

### 2. Đăng Ký Khách Hàng
- Chụp hoặc chọn ảnh
- Nhập tên khách hàng
- Nhập chi tiết đơn hàng
- Gửi request đến server
- Hiển thị kết quả đăng ký

### 3. Settings
- Cấu hình Branch ID
- Cấu hình Server Host và Port
- Test connection
- Xem Debug logs

### 4. Network Status
- Hiển thị trạng thái kết nối mạng
- Tự động disable features khi offline
- Cảnh báo khi không có network

---

## 📚 Dependencies

Xem `package.json` để biết đầy đủ dependencies.

**Core:**
- `expo ~54.0.0` - Expo framework
- `react 18.2.0` - React library
- `react-native 0.76.0` - React Native

**Navigation:**
- `@react-navigation/native ^6.1.9` - Navigation core
- `@react-navigation/stack ^6.3.20` - Stack navigator

**Camera & Image:**
- `expo-camera ~15.0.14` - Camera access
- `expo-image-picker ~15.0.7` - Image picker
- `expo-image-manipulator ~12.0.1` - Image processing
- `expo-file-system ~17.0.1` - File system

**Storage & Network:**
- `@react-native-async-storage/async-storage 1.23.1` - Local storage
- `@react-native-community/netinfo 11.1.0` - Network status

**UI:**
- `react-native-safe-area-context 4.10.5` - Safe area
- `react-native-screens ~3.31.1` - Native screens

---

## 🎯 Workflow

### 1. Nhận Diện Khách Hàng
```
Home → Recognition → [Chụp/Chọn ảnh] → [Gửi request] → Recognition Result
```

### 2. Đăng Ký Khách Hàng
```
Home → Registration → [Chụp/Chọn ảnh] → [Nhập thông tin] → [Gửi request] → Registration Result
```

### 3. Cấu Hình
```
Home → Settings → [Cấu hình] → [Test Connection] → [Save]
```

---

## 🔐 Permissions

App yêu cầu các permissions sau:

- **Camera:** Để chụp ảnh khách hàng
- **Storage:** Để chọn ảnh từ gallery
- **Internet:** Để kết nối với backend server
- **Network State:** Để kiểm tra trạng thái mạng

---

## 📄 License

Dự án này được tạo cho mục đích giáo dục (CS401V Lab Assignment 2).

---

## 👥 Support

Nếu gặp vấn đề:
1. Kiểm tra phần Troubleshooting
2. Xem logs trong Debug Screen
3. Kiểm tra backend server đang chạy
4. Verify network connection

---

**Version:** 1.0.0  
**Last Updated:** November 2025
