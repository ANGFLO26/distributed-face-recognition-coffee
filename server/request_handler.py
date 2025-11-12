"""
Request Handler Module
Handles different types of requests (RECOGNIZE, REGISTER)
"""

from typing import Dict, Any, Tuple
from models.face_recognition import face_engine
from database.models import CustomerModel, OrderModel
import numpy as np


class RequestHandler:
    """Handle different types of requests"""
    
    def __init__(self):
        # Cache for customer encodings (for performance)
        self._customers_cache = None
        self._cache_timestamp = None
    
    def _get_customers_cache(self):
        """Get cached customers list, reload if needed"""
        # For now, always reload (can optimize later with cache invalidation)
        customers = CustomerModel.get_all_customers_with_encodings()
        
        # Convert encodings to numpy arrays
        for customer in customers:
            if isinstance(customer['face_encoding'], list):
                customer['face_encoding'] = np.array(customer['face_encoding'])
        
        return customers
    
    def handle_recognize_request(self, message: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
        """
        Handle RECOGNIZE request
        Returns: (status, response_data)
        """
        try:
            image_data = message['image_data']
            branch_id = message.get('branch_id', 'UNKNOWN')
            
            # Get all customers with encodings
            customers = self._get_customers_cache()
            
            if len(customers) == 0:
                # No customers in database
                return 'success', {
                    'recognized': False,
                    'message': 'No customers in database'
                }
            
            # Recognize face
            customer_id, distance, status = face_engine.recognize_face(
                image_data,
                customers
            )
            
            if status == "NO_FACE_DETECTED":
                return 'error', {
                    'error_code': 'NO_FACE_DETECTED',
                    'error_message': 'No face detected in the image. Please try again.'
                }
            
            elif status == "FACE_ENCODING_FAILED":
                return 'error', {
                    'error_code': 'FACE_ENCODING_FAILED',
                    'error_message': 'Failed to extract face encoding. Please try again.'
                }
            
            elif status == "RECOGNIZED":
                # Get customer info
                customer = CustomerModel.get_customer_by_id(customer_id)
                customer_name = customer['name'] if customer else None
                
                # Get latest order
                latest_order = OrderModel.get_latest_order(customer_id)
                
                order_data = None
                if latest_order:
                    order_data = {
                        'order_details': latest_order['order_details'],
                        'order_date': latest_order['order_date'].isoformat(),
                        'branch_id': latest_order['branch_id']
                    }
                
                return 'success', {
                    'recognized': True,
                    'customer_id': customer_id,
                    'customer_name': customer_name,
                    'latest_order': order_data
                }
            
            else:  # NOT_RECOGNIZED
                return 'success', {
                    'recognized': False,
                    'message': 'Customer not found in database'
                }
                
        except Exception as e:
            print(f"✗ Error in handle_recognize_request: {str(e)}")
            return 'error', {
                'error_code': 'PROCESSING_ERROR',
                'error_message': f'Error processing request: {str(e)}'
            }
    
    def handle_register_request(self, message: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
        """
        Handle REGISTER request
        Returns: (status, response_data)
        """
        try:
            image_data = message['image_data']
            customer_name = message['customer_name']
            order_details = message['order_details']
            branch_id = message.get('branch_id', 'UNKNOWN')
            
            # Decode image and extract face encoding
            image_array = face_engine.decode_image_from_base64(image_data)
            face_encoding, status = face_engine.detect_and_extract_face_encoding(image_array)
            
            if face_encoding is None:
                if status == "NO_FACE_DETECTED":
                    return 'error', {
                        'error_code': 'NO_FACE_DETECTED',
                        'error_message': 'No face detected in the image. Please try again.'
                    }
                else:
                    return 'error', {
                        'error_code': 'FACE_ENCODING_FAILED',
                        'error_message': 'Failed to extract face encoding. Please try again.'
                    }
            
            # Convert numpy array to list for MongoDB storage
            face_encoding_list = face_encoding.tolist()
            
            # Create customer
            customer = CustomerModel.create_customer(customer_name, face_encoding_list)
            customer_id = customer['customer_id']
            
            # Create order
            order = OrderModel.create_order(customer_id, order_details, branch_id)
            
            # Invalidate cache
            self._customers_cache = None
            
            return 'success', {
                'message': 'Customer registered successfully',
                'customer_id': customer_id
            }
            
        except Exception as e:
            print(f"✗ Error in handle_register_request: {str(e)}")
            return 'error', {
                'error_code': 'PROCESSING_ERROR',
                'error_message': f'Error processing request: {str(e)}'
            }

