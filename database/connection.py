"""
MongoDB Connection Module
Handles database connection and initialization
"""

import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from dotenv import load_dotenv

load_dotenv()


class DatabaseConnection:
    """Singleton class for MongoDB connection"""
    
    _instance = None
    _client = None
    _db = None
    _connected = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        # Don't auto-connect on import to avoid errors
        pass
    
    def connect(self):
        """Establish connection to MongoDB"""
        if self._connected and self._client:
            return
        
        try:
            # Check if MONGODB_URL is provided (full connection string)
            mongodb_url = os.getenv('MONGODB_URL', '')
            
            if mongodb_url:
                # Use full connection string if provided
                database_name = os.getenv('MONGODB_DATABASE', 'coffeehouse_db')
                
                # Parse database name from URL if not specified
                if '/' in mongodb_url.rstrip('/'):
                    # Extract database from URL if present
                    url_parts = mongodb_url.rstrip('/').split('/')
                    if len(url_parts) > 3 and url_parts[-1]:
                        # Database name is in URL
                        database_name = url_parts[-1]
                
                self._client = MongoClient(
                    mongodb_url,
                    serverSelectionTimeoutMS=5000
                )
                print(f"✓ Connecting to MongoDB using connection string")
            else:
                # Use individual parameters
                host = os.getenv('MONGODB_HOST', 'localhost')
                port = int(os.getenv('MONGODB_PORT', 27017))
                database_name = os.getenv('MONGODB_DATABASE', 'coffeehouse_db')
                
                # Get authentication credentials (optional)
                username = os.getenv('MONGODB_USERNAME', '')
                password = os.getenv('MONGODB_PASSWORD', '')
                auth_source = os.getenv('MONGODB_AUTH_SOURCE', 'admin')
                
                # Build connection string
                if username and password:
                    # Connection with authentication
                    connection_string = f"mongodb://{username}:{password}@{host}:{port}/{database_name}?authSource={auth_source}"
                    self._client = MongoClient(
                        connection_string,
                        serverSelectionTimeoutMS=5000
                    )
                    print(f"✓ Connecting to MongoDB with authentication: {host}:{port}/{database_name}")
                else:
                    # Connection without authentication
                    self._client = MongoClient(
                        host=host,
                        port=port,
                        serverSelectionTimeoutMS=5000
                    )
                    print(f"✓ Connecting to MongoDB without authentication: {host}:{port}/{database_name}")
            
            # Test connection
            self._client.admin.command('ping')
            
            self._db = self._client[database_name]
            
            # Create indexes for better performance (with error handling)
            self._create_indexes()
            
            self._connected = True
            print(f"✓ Connected to MongoDB database: {database_name}")
            
        except ConnectionFailure as e:
            print(f"✗ Failed to connect to MongoDB: {e}")
            raise
        except Exception as e:
            print(f"✗ Error connecting to MongoDB: {e}")
            raise
    
    def _create_indexes(self):
        """Create indexes for better query performance"""
        try:
            # Index on customer_id for fast lookups
            # Use create_index with exist_ok=True equivalent (try-except)
            try:
                self._db.customers.create_index("customer_id", unique=True)
            except OperationFailure as e:
                # Index might already exist or no permission
                if "already exists" not in str(e).lower() and "unauthorized" not in str(e).lower():
                    print(f"⚠ Warning creating customer_id index: {e}")
            
            # Index on customer_id in orders for fast order queries
            try:
                self._db.orders.create_index("customer_id")
            except OperationFailure as e:
                if "already exists" not in str(e).lower() and "unauthorized" not in str(e).lower():
                    print(f"⚠ Warning creating orders.customer_id index: {e}")
            
            # Index on order_date for sorting latest orders
            try:
                self._db.orders.create_index([("customer_id", 1), ("order_date", -1)])
            except OperationFailure as e:
                if "already exists" not in str(e).lower() and "unauthorized" not in str(e).lower():
                    print(f"⚠ Warning creating orders compound index: {e}")
            
            # Index on branch_id if needed
            try:
                self._db.orders.create_index("branch_id")
            except OperationFailure as e:
                if "already exists" not in str(e).lower() and "unauthorized" not in str(e).lower():
                    print(f"⚠ Warning creating orders.branch_id index: {e}")
            
            print("✓ Database indexes checked/created")
            
        except Exception as e:
            # If we can't create indexes, continue anyway (they might already exist)
            print(f"⚠ Warning: Could not create all indexes: {e}")
            print("  Continuing anyway - indexes may already exist or require permissions")
    
    def get_database(self):
        """Get database instance"""
        if not self._connected or self._db is None:
            self.connect()
        return self._db
    
    def get_collection(self, collection_name):
        """Get collection instance"""
        return self.get_database()[collection_name]
    
    def close(self):
        """Close database connection"""
        if self._client:
            self._client.close()
            self._connected = False
            print("✓ MongoDB connection closed")


# Global database instance (lazy initialization)
db_connection = DatabaseConnection()

