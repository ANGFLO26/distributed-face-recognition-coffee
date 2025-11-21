#!/usr/bin/env python3
"""
Main entry point for the Face Recognition Server
Starts both TCP Socket Server and HTTP API Server
"""

import sys
import os
import threading
from dotenv import load_dotenv

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server.server import SocketServer
from server.http_server import create_http_server
from database.connection import db_connection

load_dotenv()

def start_http_server():
    """Start HTTP API server in a separate thread"""
    http_app = create_http_server()
    http_port = int(os.getenv('HTTP_PORT', 8889))
    http_host = os.getenv('HTTP_HOST', '0.0.0.0')
    http_app.run(host=http_host, port=http_port, debug=False, use_reloader=False)

if __name__ == "__main__":
    print("=" * 60)
    print("Face Recognition Server - CS401V Lab Assignment 2")
    print("=" * 60)
    
    # Initialize database connection
    try:
        db_connection.connect()
    except Exception as e:
        print(f"✗ Failed to connect to database: {e}")
        print("Please make sure MongoDB is running")
        sys.exit(1)
    
    # Start HTTP API server in a separate thread
    http_thread = threading.Thread(target=start_http_server, daemon=True)
    http_thread.start()
    print("✓ HTTP API Server started (port 8889)")
    
    # Create and start TCP Socket server (main thread)
    server = SocketServer()
    
    try:
        server.start()
    except KeyboardInterrupt:
        print("\n⚠ Server interrupted by user")
    finally:
        server.stop()
        db_connection.close()

