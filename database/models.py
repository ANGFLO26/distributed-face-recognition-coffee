"""
Database Models and Operations
Handles CRUD operations for customers and orders
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from database.connection import db_connection
import json


class CustomerModel:
    """Customer database operations"""
    
    @staticmethod
    def get_collection():
        return db_connection.get_collection('customers')
    
    @staticmethod
    def get_next_customer_id() -> int:
        """Get next available customer_id"""
        collection = CustomerModel.get_collection()
        last_customer = collection.find_one(
            sort=[("customer_id", -1)]
        )
        if last_customer:
            return last_customer['customer_id'] + 1
        return 1
    
    @staticmethod
    def create_customer(name: str, face_encoding: List[float]) -> Dict[str, Any]:
        """Create a new customer"""
        collection = CustomerModel.get_collection()
        
        customer_id = CustomerModel.get_next_customer_id()
        
        customer = {
            'customer_id': customer_id,
            'name': name,
            'face_encoding': face_encoding,  # Store as array in MongoDB
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        result = collection.insert_one(customer)
        
        if result.inserted_id:
            print(f"✓ Created customer: {customer_id} - {name}")
            return customer
        else:
            raise Exception("Failed to create customer")
    
    @staticmethod
    def get_customer_by_id(customer_id: int) -> Optional[Dict[str, Any]]:
        """Get customer by ID"""
        collection = CustomerModel.get_collection()
        customer = collection.find_one({'customer_id': customer_id})
        
        if customer:
            # Remove MongoDB _id field
            customer.pop('_id', None)
        return customer
    
    @staticmethod
    def get_all_customers_with_encodings() -> List[Dict[str, Any]]:
        """Get all customers with their face encodings for recognition"""
        collection = CustomerModel.get_collection()
        customers = list(collection.find(
            {},
            {'customer_id': 1, 'name': 1, 'face_encoding': 1}
        ))
        
        # Remove MongoDB _id field
        for customer in customers:
            customer.pop('_id', None)
        
        return customers
    
    @staticmethod
    def update_customer(customer_id: int, updates: Dict[str, Any]):
        """Update customer information"""
        collection = CustomerModel.get_collection()
        updates['updated_at'] = datetime.now()
        
        result = collection.update_one(
            {'customer_id': customer_id},
            {'$set': updates}
        )
        
        return result.modified_count > 0


class OrderModel:
    """Order database operations"""
    
    @staticmethod
    def get_collection():
        return db_connection.get_collection('orders')
    
    @staticmethod
    def get_next_order_id() -> int:
        """Get next available order_id"""
        collection = OrderModel.get_collection()
        last_order = collection.find_one(
            sort=[("order_id", -1)]
        )
        if last_order:
            return last_order['order_id'] + 1
        return 1
    
    @staticmethod
    def create_order(customer_id: int, order_details: str, branch_id: str) -> Dict[str, Any]:
        """Create a new order"""
        collection = OrderModel.get_collection()
        
        order_id = OrderModel.get_next_order_id()
        
        order = {
            'order_id': order_id,
            'customer_id': customer_id,
            'order_details': order_details,
            'order_date': datetime.now(),
            'branch_id': branch_id
        }
        
        result = collection.insert_one(order)
        
        if result.inserted_id:
            print(f"✓ Created order: {order_id} for customer {customer_id}")
            return order
        else:
            raise Exception("Failed to create order")
    
    @staticmethod
    def get_latest_order(customer_id: int) -> Optional[Dict[str, Any]]:
        """Get the latest order for a customer"""
        collection = OrderModel.get_collection()
        order = collection.find_one(
            {'customer_id': customer_id},
            sort=[('order_date', -1)]
        )
        
        if order:
            order.pop('_id', None)
        return order
    
    @staticmethod
    def get_all_orders_by_customer(customer_id: int) -> List[Dict[str, Any]]:
        """Get all orders for a customer"""
        collection = OrderModel.get_collection()
        orders = list(collection.find(
            {'customer_id': customer_id},
            sort=[('order_date', -1)]
        ))
        
        for order in orders:
            order.pop('_id', None)
        
        return orders

