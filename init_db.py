#!/usr/bin/env python3
"""
Script to initialize database and create sample data (optional)
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.connection import db_connection
from database.models import CustomerModel, OrderModel

def main():
    print("=" * 60)
    print("Database Initialization Script")
    print("=" * 60)
    
    try:
        # Connect to database
        db_connection.connect()
        
        # Check if database is empty
        customers_count = CustomerModel.get_collection().count_documents({})
        orders_count = OrderModel.get_collection().count_documents({})
        
        print(f"\nDatabase Status:")
        print(f"  Customers: {customers_count}")
        print(f"  Orders: {orders_count}")
        
        if customers_count == 0:
            print("\n✓ Database is empty and ready to use")
        else:
            print("\n✓ Database already contains data")
        
        print("\n✓ Database initialization complete!")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)
    finally:
        db_connection.close()

if __name__ == "__main__":
    main()

