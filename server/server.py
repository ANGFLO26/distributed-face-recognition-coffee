"""
Socket Server with Multi-threading Support
Handles multiple client connections concurrently
"""

import socket
import threading
import os
from dotenv import load_dotenv
from utils.message_handler import MessageHandler
from server.request_handler import RequestHandler

load_dotenv()


class ClientThread(threading.Thread):
    """Thread to handle individual client connection"""
    
    def __init__(self, client_socket: socket.socket, client_address: tuple):
        threading.Thread.__init__(self)
        self.client_socket = client_socket
        self.client_address = client_address
        self.message_handler = MessageHandler()
        self.request_handler = RequestHandler()
    
    def run(self):
        """Handle client request"""
        try:
            print(f"→ Client connected: {self.client_address}")
            
            # Receive data
            data = self._receive_data()
            
            if data is None:
                return
            
            # Parse request
            try:
                message = self.message_handler.parse_request(data)
            except ValueError as e:
                self._send_error("INVALID_REQUEST", str(e))
                return
            
            # Validate request
            is_valid, error_msg = self.message_handler.validate_request(message)
            if not is_valid:
                self._send_error("INVALID_REQUEST", error_msg)
                return
            
            # Handle request
            request_type = message['request_type']
            request_id = message.get('request_id', 'unknown')
            
            if request_type == 'RECOGNIZE':
                status, response_data = self.request_handler.handle_recognize_request(message)
            elif request_type == 'REGISTER':
                status, response_data = self.request_handler.handle_register_request(message)
            else:
                self._send_error("UNKNOWN_REQUEST_TYPE", f"Unknown request type: {request_type}")
                return
            
            # Build and send response
            response = self.message_handler.build_response(
                status=status,
                request_id=request_id,
                **response_data
            )
            
            # Send response length first (4 bytes)
            response_length = len(response)
            length_bytes = response_length.to_bytes(4, byteorder='big')
            self.client_socket.sendall(length_bytes)
            
            # Send response data
            self.client_socket.sendall(response)
            print(f"✓ Response sent to {self.client_address}")
            
        except Exception as e:
            print(f"✗ Error handling client {self.client_address}: {str(e)}")
            try:
                self._send_error("SERVER_ERROR", "Internal server error")
            except:
                pass
        finally:
            self.client_socket.close()
            print(f"← Client disconnected: {self.client_address}")
    
    def _receive_data(self) -> bytes:
        """Receive all data from client"""
        try:
            # Set timeout for receiving
            self.client_socket.settimeout(30.0)
            
            # First, receive the length (4 bytes)
            length_data = self.client_socket.recv(4)
            if not length_data or len(length_data) != 4:
                return None
            
            message_length = int.from_bytes(length_data, byteorder='big')
            
            # Receive the actual message data
            chunks = []
            received = 0
            
            while received < message_length:
                chunk_size = min(message_length - received, 4096)
                chunk = self.client_socket.recv(chunk_size)
                if not chunk:
                    return None
                chunks.append(chunk)
                received += len(chunk)
            
            if not chunks:
                return None
            
            return b''.join(chunks)
            
        except socket.timeout:
            print(f"✗ Timeout receiving data from {self.client_address}")
            return None
        except Exception as e:
            print(f"✗ Error receiving data: {str(e)}")
            return None
    
    def _send_error(self, error_code: str, error_message: str):
        """Send error response"""
        try:
            response = self.message_handler.build_response(
                status='error',
                error_code=error_code,
                error_message=error_message
            )
            
            # Send response length first (4 bytes)
            response_length = len(response)
            length_bytes = response_length.to_bytes(4, byteorder='big')
            self.client_socket.sendall(length_bytes)
            
            # Send response data
            self.client_socket.sendall(response)
        except:
            pass


class SocketServer:
    """Socket server with multi-threading support"""
    
    def __init__(self):
        self.host = os.getenv('SERVER_HOST', '0.0.0.0')
        self.port = int(os.getenv('SERVER_PORT', 8888))
        self.server_socket = None
        self.running = False
    
    def start(self):
        """Start the server"""
        try:
            # Create socket
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            
            # Bind to address
            self.server_socket.bind((self.host, self.port))
            
            # Listen for connections
            self.server_socket.listen(10)  # Allow up to 10 pending connections
            
            self.running = True
            
            print(f"=" * 60)
            print(f"🚀 Face Recognition Server Started")
            print(f"📍 Listening on {self.host}:{self.port}")
            print(f"💡 Waiting for connections...")
            print(f"=" * 60)
            
            # Accept connections
            while self.running:
                try:
                    client_socket, client_address = self.server_socket.accept()
                    
                    # Create and start thread for each client
                    client_thread = ClientThread(client_socket, client_address)
                    client_thread.daemon = True
                    client_thread.start()
                    
                except Exception as e:
                    if self.running:
                        print(f"✗ Error accepting connection: {str(e)}")
        
        except Exception as e:
            print(f"✗ Server error: {str(e)}")
        finally:
            self.stop()
    
    def stop(self):
        """Stop the server"""
        self.running = False
        if self.server_socket:
            self.server_socket.close()
            print("\n✓ Server stopped")


if __name__ == "__main__":
    # Import database connection to initialize
    from database.connection import db_connection
    
    # Create and start server
    server = SocketServer()
    
    try:
        server.start()
    except KeyboardInterrupt:
        print("\n⚠ Server interrupted by user")
        server.stop()

