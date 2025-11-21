"""
Client Application for Face Recognition System
Python client for testing the server functionality
"""

import socket
import json
import base64
import os
from typing import Dict, Any, Optional
from PIL import Image
import io


class FaceRecognitionClient:
    """Client for communicating with Face Recognition Server"""
    
    def __init__(self, host: str = 'localhost', port: int = 8888):
        self.host = host
        self.port = port
        self.socket = None
    
    def connect(self):
        """Connect to server"""
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.connect((self.host, self.port))
            print(f"✓ Connected to server {self.host}:{self.port}")
            return True
        except Exception as e:
            print(f"✗ Failed to connect: {str(e)}")
            return False
    
    def disconnect(self):
        """Disconnect from server"""
        if self.socket:
            self.socket.close()
            self.socket = None
            print("✓ Disconnected from server")
    
    def _image_to_base64(self, image_path: str) -> str:
        """Convert image file to base64 string"""
        try:
            with open(image_path, 'rb') as image_file:
                image_data = image_file.read()
                base64_string = base64.b64encode(image_data).decode('utf-8')
                return base64_string
        except Exception as e:
            raise Exception(f"Failed to read image: {str(e)}")
    
    def _send_request(self, message: Dict[str, Any]) -> bytes:
        """Send request and receive response"""
        if not self.socket:
            raise Exception("Not connected to server")
        
        # Serialize message
        message_json = json.dumps(message)
        message_bytes = message_json.encode('utf-8')
        
        # Send message length first (4 bytes, big-endian)
        message_length = len(message_bytes)
        length_bytes = message_length.to_bytes(4, byteorder='big')
        self.socket.sendall(length_bytes)
        
        # Send message data
        self.socket.sendall(message_bytes)
        
        # Receive response length first
        length_data = self.socket.recv(4)
        if not length_data or len(length_data) != 4:
            raise Exception("Failed to receive response length")
        
        response_length = int.from_bytes(length_data, byteorder='big')
        
        # Receive response data
        response_chunks = []
        received = 0
        self.socket.settimeout(30.0)
        
        while received < response_length:
            chunk = self.socket.recv(min(response_length - received, 4096))
            if not chunk:
                raise Exception("Connection closed while receiving response")
            response_chunks.append(chunk)
            received += len(chunk)
        
        response_bytes = b''.join(response_chunks)
        return response_bytes
    
    def recognize_face(self, image_path: str, branch_id: str = "BRANCH_001", request_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Send RECOGNIZE request
        Args:
            image_path: Path to image file
            branch_id: Branch identifier
            request_id: Optional request ID
        Returns:
            Response dictionary
        """
        try:
            # Convert image to base64
            image_base64 = self._image_to_base64(image_path)
            
            # Create request message
            message = {
                'request_type': 'RECOGNIZE',
                'image_data': image_base64,
                'branch_id': branch_id,
                'request_id': request_id or f"req_{os.urandom(4).hex()}"
            }
            
            # Send request and get response
            response_bytes = self._send_request(message)
            response = json.loads(response_bytes.decode('utf-8'))
            
            return response
            
        except Exception as e:
            return {
                'status': 'error',
                'error_code': 'CLIENT_ERROR',
                'error_message': str(e)
            }
    
    def register_customer(
        self,
        image_path: str,
        customer_name: str,
        order_details: str,
        branch_id: str = "BRANCH_001",
        request_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send REGISTER request
        Args:
            image_path: Path to image file
            customer_name: Name of customer
            order_details: Order details
            branch_id: Branch identifier
            request_id: Optional request ID
        Returns:
            Response dictionary
        """
        try:
            # Convert image to base64
            image_base64 = self._image_to_base64(image_path)
            
            # Create request message
            message = {
                'request_type': 'REGISTER',
                'image_data': image_base64,
                'customer_name': customer_name,
                'order_details': order_details,
                'branch_id': branch_id,
                'request_id': request_id or f"req_{os.urandom(4).hex()}"
            }
            
            # Send request and get response
            response_bytes = self._send_request(message)
            response = json.loads(response_bytes.decode('utf-8'))
            
            return response
            
        except Exception as e:
            return {
                'status': 'error',
                'error_code': 'CLIENT_ERROR',
                'error_message': str(e)
            }


def main():
    """Example usage of the client"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python client.py recognize <image_path>")
        print("  python client.py register <image_path> <customer_name> <order_details>")
        return
    
    client = FaceRecognitionClient()
    
    if not client.connect():
        return
    
    try:
        command = sys.argv[1]
        
        if command == 'recognize':
            if len(sys.argv) < 3:
                print("Error: Missing image path")
                return
            
            image_path = sys.argv[2]
            print(f"\n📸 Recognizing face from: {image_path}")
            
            response = client.recognize_face(image_path)
            print("\n📋 Response:")
            print(json.dumps(response, indent=2, default=str))
            
            if response.get('status') == 'success':
                if response.get('recognized'):
                    print(f"\n✓ Customer recognized!")
                    print(f"  Name: {response.get('customer_name')}")
                    print(f"  ID: {response.get('customer_id')}")
                    if response.get('latest_order'):
                        order = response['latest_order']
                        print(f"  Latest Order: {order.get('order_details')}")
                else:
                    print("\n✗ Customer not recognized")
        
        elif command == 'register':
            if len(sys.argv) < 5:
                print("Error: Missing arguments")
                print("Usage: python client.py register <image_path> <customer_name> <order_details>")
                return
            
            image_path = sys.argv[2]
            customer_name = sys.argv[3]
            order_details = sys.argv[4]
            
            print(f"\n📝 Registering customer:")
            print(f"  Image: {image_path}")
            print(f"  Name: {customer_name}")
            print(f"  Order: {order_details}")
            
            response = client.register_customer(image_path, customer_name, order_details)
            print("\n📋 Response:")
            print(json.dumps(response, indent=2, default=str))
            
            if response.get('status') == 'success':
                print(f"\n✓ Customer registered successfully!")
                print(f"  Customer ID: {response.get('customer_id')}")
        
        else:
            print(f"Unknown command: {command}")
    
    finally:
        client.disconnect()


if __name__ == "__main__":
    main()

