# ☕ Coffeehouse Face Recognition System - Backend

Hệ thống nhận diện khuôn mặt cho chuỗi coffeehouse sử dụng Python, MongoDB, và Face Recognition.

## 📋 Mục Lục

- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt](#cài-đặt)
- [Cấu Hình](#cấu-hình)
- [Chạy Server](#chạy-server)
- [API Endpoints](#api-endpoints)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Troubleshooting](#troubleshooting)

---

## 🖥️ Yêu Cầu Hệ Thống

### Hệ Điều Hành
- Ubuntu/Debian hoặc macOS
- Python 3.8+

### Dependencies Hệ Thống

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    pkg-config
```

**macOS:**
```bash
brew install cmake dlib
```

### MongoDB
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Hoặc sử dụng Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## 📦 Cài Đặt

### 1. Clone Repository
```bash
git clone <repository-url>
cd "distributed system/last"
```

### 2. Tạo Virtual Environment (Khuyến Nghị)
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
# hoặc
venv\Scripts\activate  # Windows
```

### 3. Cài Đặt Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Lưu Ý:** Nếu gặp lỗi khi cài `face-recognition`:
1. Đảm bảo đã cài đầy đủ system dependencies (xem trên)
2. Cài CMake trước: `sudo apt-get install cmake` hoặc `brew install cmake`
3. Thử lại: `pip install face-recognition==1.3.0`

### 4. Khởi Tạo Database
```bash
python3 init_db.py
```

---

## ⚙️ Cấu Hình

### Tạo File `.env`
Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

Hoặc tạo file `.env` mới trong thư mục gốc:

```env
# MongoDB Configuration
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=coffeehouse_db
MONGODB_USERNAME=
MONGODB_PASSWORD=

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8888

# HTTP API Server (for Mobile App)
HTTP_HOST=0.0.0.0
HTTP_PORT=8889

# Face Recognition Configuration
FACE_RECOGNITION_TOLERANCE=0.6
FACE_RECOGNITION_MODEL=hog
```

**Giải Thích:**
- `MONGODB_HOST`: Địa chỉ MongoDB (mặc định: localhost)
- `MONGODB_PORT`: Port MongoDB (mặc định: 27017)
- `MONGODB_DATABASE`: Tên database (mặc định: coffeehouse_db)
- `SERVER_PORT`: Port cho TCP Socket Server (mặc định: 8888)
- `HTTP_PORT`: Port cho HTTP API Server (mặc định: 8889)
- `FACE_RECOGNITION_TOLERANCE`: Độ nhạy nhận diện (0.0-1.0, thấp hơn = chính xác hơn)
- `FACE_RECOGNITION_MODEL`: Model sử dụng (`hog` hoặc `cnn`)

---

## 🚀 Chạy Server

### Khởi Động MongoDB
```bash
# Ubuntu/Debian
sudo systemctl start mongodb

# macOS
brew services start mongodb-community

# Hoặc Docker
docker start mongodb
```

### Chạy Server
```bash
python3 run_server.py
```

Server sẽ khởi động cả 2 services:
- **TCP Socket Server** (port 8888): Cho Python client
- **HTTP API Server** (port 8889): Cho Mobile App

**Output:**
```
============================================================
Face Recognition Server - CS401V Lab Assignment 2
============================================================
✓ HTTP API Server started (port 8889)
✓ TCP Socket Server started on 0.0.0.0:8888
✓ Waiting for connections...
```

---

## 📡 API Endpoints

### HTTP API (Mobile App)

#### 1. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

#### 2. Root Endpoint
```http
GET /
```

**Response:**
```json
{
  "name": "Face Recognition API",
  "version": "1.0.0",
  "endpoints": {
    "recognize": "/api/recognize (POST)",
    "register": "/api/register (POST)",
    "health": "/api/health (GET)"
  }
}
```

#### 3. Recognize Face
```http
POST /api/recognize
Content-Type: application/json

{
  "request_type": "RECOGNIZE",
  "image_data": "<base64_encoded_image>",
  "branch_id": "BRANCH_001",
  "request_id": "req_abc123"
}
```

**Success Response:**
```json
{
  "status": "success",
  "request_id": "req_abc123",
  "recognized": true,
  "customer_id": 1,
  "customer_name": "John Doe",
  "latest_order": {
    "order_details": "Cappuccino, Medium",
    "order_date": "2025-11-12T10:30:00",
    "branch_id": "BRANCH_001"
  },
  "timestamp": "2025-11-12T10:30:45"
}
```

**Not Recognized Response:**
```json
{
  "status": "success",
  "request_id": "req_abc123",
  "recognized": false,
  "message": "Không nhận diện được khách hàng",
  "timestamp": "2025-11-12T10:30:45"
}
```

#### 4. Register Customer
```http
POST /api/register
Content-Type: application/json

{
  "request_type": "REGISTER",
  "image_data": "<base64_encoded_image>",
  "customer_name": "Jane Doe",
  "order_details": "Latte, Large, Extra shot",
  "branch_id": "BRANCH_001",
  "request_id": "req_xyz789"
}
```

**Success Response:**
```json
{
  "status": "success",
  "request_id": "req_xyz789",
  "customer_id": 2,
  "message": "Đăng ký khách hàng thành công",
  "timestamp": "2025-11-12T10:35:00"
}
```

**Error Response:**
```json
{
  "status": "error",
  "request_id": "req_xyz789",
  "error_code": "NO_FACE_DETECTED",
  "error_message": "Không phát hiện khuôn mặt. Vui lòng chụp lại với ánh sáng tốt hơn.",
  "timestamp": "2025-11-12T10:35:00"
}
```

### TCP Socket API (Python Client)

Sử dụng Length Prefix Protocol:
1. Client gửi 4 bytes (big-endian) chứa độ dài message
2. Client gửi JSON message
3. Server trả về tương tự

**Message Format:**
```json
{
  "request_type": "RECOGNIZE" | "REGISTER",
  "image_data": "<base64_encoded_image>",
  "branch_id": "BRANCH_001",
  "customer_name": "John Doe",  // Chỉ cho REGISTER
  "order_details": "Latte, Large",  // Chỉ cho REGISTER
  "request_id": "req_abc123"
}
```

---

## 📁 Cấu Trúc Dự Án

```
.
├── README.md                 # File này
├── requirements.txt          # Python dependencies
├── .env                      # Configuration (tạo mới)
├── run_server.py            # Entry point
├── init_db.py               # Database initialization
│
├── server/                  # Server modules
│   ├── server.py           # TCP Socket Server
│   ├── http_server.py      # HTTP API Server
│   └── request_handler.py  # Request processing
│
├── database/               # Database modules
│   ├── connection.py       # MongoDB connection
│   └── models.py           # Database models
│
├── models/                 # Face recognition models
│   └── face_recognition.py # Face recognition logic
│
├── utils/                  # Utilities
│   └── message_handler.py  # Message parsing/building
│
└── client/                 # Python client (example)
    └── client.py           # TCP client example
```

---

## 🔧 Troubleshooting

### 1. MongoDB Connection Error
```
✗ Failed to connect to database: [Errno 111] Connection refused
```

**Giải pháp:**
- Kiểm tra MongoDB đang chạy: `sudo systemctl status mongodb`
- Kiểm tra port trong `.env`: `MONGODB_PORT=27017`
- Kiểm tra firewall: `sudo ufw allow 27017`

### 2. Face Recognition Installation Error
```
ERROR: Failed building wheel for dlib
```

**Giải pháp:**
```bash
# Ubuntu/Debian
sudo apt-get install build-essential cmake libopenblas-dev liblapack-dev

# macOS
brew install cmake dlib

# Sau đó cài lại
pip install face-recognition==1.3.0
```

### 3. Port Already in Use
```
OSError: [Errno 98] Address already in use
```

**Giải pháp:**
```bash
# Tìm process đang dùng port
sudo lsof -i :8888
sudo lsof -i :8889

# Kill process
kill -9 <PID>
```

### 4. Import Error
```
ModuleNotFoundError: No module named 'flask'
```

**Giải pháp:**
```bash
pip install -r requirements.txt
```

### 5. Database Index Error
```
IndexError: ...
```

**Giải pháp:**
```bash
# Khởi tạo lại database
python3 init_db.py
```

---

## 📝 Error Codes

| Error Code | Mô Tả |
|------------|-------|
| `NO_FACE_DETECTED` | Không phát hiện khuôn mặt trong ảnh |
| `FACE_ENCODING_FAILED` | Không thể encode khuôn mặt |
| `PROCESSING_ERROR` | Lỗi xử lý chung |
| `SERVER_ERROR` | Lỗi server |
| `INVALID_REQUEST` | Request không hợp lệ |
| `UNKNOWN_REQUEST_TYPE` | Loại request không xác định |

---

## 🔐 Security Notes

⚠️ **Production Deployment:**
- Thêm authentication cho API endpoints
- Sử dụng HTTPS thay vì HTTP
- Validate và sanitize inputs
- Rate limiting cho API
- MongoDB authentication enabled

---

## 📚 Dependencies

Xem `requirements.txt` để biết đầy đủ dependencies.

**Core:**
- `face-recognition==1.3.0` - Face recognition
- `opencv-python==4.8.1.78` - Image processing
- `numpy==1.24.3` - Numerical operations
- `pymongo==4.6.0` - MongoDB driver
- `Pillow==10.1.0` - Image handling
- `flask==3.0.0` - HTTP API server
- `flask-cors==4.0.0` - CORS support
- `python-dotenv==1.0.0` - Environment variables

---

## 📄 License

Dự án này được tạo cho mục đích giáo dục (CS401V Lab Assignment 2).

---

## 👥 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra phần Troubleshooting
2. Xem logs trong console
3. Kiểm tra MongoDB connection
4. Verify `.env` configuration

---

**Version:** 1.0.0  
**Last Updated:** November 2025
# distributed-face-recognition-coffee
