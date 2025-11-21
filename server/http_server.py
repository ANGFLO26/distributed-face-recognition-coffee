"""
HTTP API Server for Mobile App
Provides REST API endpoints for RECOGNIZE and REGISTER requests
Compatible with Expo Go (uses fetch API instead of TCP socket)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from server.request_handler import RequestHandler
from utils.message_handler import MessageHandler

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for mobile app

request_handler = RequestHandler()
message_handler = MessageHandler()


@app.route('/', methods=['GET'])
def root():
    """Root endpoint - API information"""
    return jsonify({
        'name': 'Face Recognition API',
        'version': '1.0.0',
        'endpoints': {
            'recognize': '/api/recognize (POST)',
            'register': '/api/register (POST)',
            'health': '/api/health (GET)'
        }
    }), 200


@app.route('/api/recognize', methods=['POST'])
def recognize():
    """Handle RECOGNIZE request via HTTP"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'error_code': 'INVALID_REQUEST',
                'error_message': 'Request body must be JSON'
            }), 400
        
        # Validate request
        is_valid, error_msg = message_handler.validate_request(data)
        if not is_valid:
            return jsonify({
                'status': 'error',
                'error_code': 'INVALID_REQUEST',
                'error_message': error_msg
            }), 400
        
        # Handle request
        status, response_data = request_handler.handle_recognize_request(data)
        
        # Build response
        response = message_handler.build_response(
            status=status,
            request_id=data.get('request_id', 'unknown'),
            return_dict=True,  # Return dict for HTTP API
            **response_data
        )
        
        # Return appropriate HTTP status code
        http_status = 200 if status == 'success' else 400
        return jsonify(response), http_status
        
    except Exception as e:
        print(f"✗ Error in /api/recognize: {str(e)}")
        return jsonify({
            'status': 'error',
            'error_code': 'SERVER_ERROR',
            'error_message': f'Server error: {str(e)}'
        }), 500


@app.route('/api/register', methods=['POST'])
def register():
    """Handle REGISTER request via HTTP"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'error_code': 'INVALID_REQUEST',
                'error_message': 'Request body must be JSON'
            }), 400
        
        # Validate request
        is_valid, error_msg = message_handler.validate_request(data)
        if not is_valid:
            return jsonify({
                'status': 'error',
                'error_code': 'INVALID_REQUEST',
                'error_message': error_msg
            }), 400
        
        # Handle request
        status, response_data = request_handler.handle_register_request(data)
        
        # Build response
        response = message_handler.build_response(
            status=status,
            request_id=data.get('request_id', 'unknown'),
            return_dict=True,  # Return dict for HTTP API
            **response_data
        )
        
        # Return appropriate HTTP status code
        http_status = 200 if status == 'success' else 400
        return jsonify(response), http_status
        
    except Exception as e:
        print(f"✗ Error in /api/register: {str(e)}")
        return jsonify({
            'status': 'error',
            'error_code': 'SERVER_ERROR',
            'error_message': f'Server error: {str(e)}'
        }), 500


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Server is running'
    }), 200


def create_http_server():
    """Create and return Flask app instance"""
    return app


if __name__ == "__main__":
    # Get HTTP port from environment or use default
    http_port = int(os.getenv('HTTP_PORT', 8889))
    http_host = os.getenv('HTTP_HOST', '0.0.0.0')
    
    print(f"=" * 60)
    print(f"🌐 HTTP API Server Starting")
    print(f"📍 Listening on {http_host}:{http_port}")
    print(f"💡 Endpoints:")
    print(f"   - POST /api/recognize")
    print(f"   - POST /api/register")
    print(f"   - GET  /api/health")
    print(f"=" * 60)
    
    app.run(host=http_host, port=http_port, debug=False)

