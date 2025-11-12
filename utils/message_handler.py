"""
Message Handler Utilities
Handles request/response message parsing and building
"""

import json
from typing import Dict, Any, Optional, Tuple
from datetime import datetime


class MessageHandler:
    """Handle message parsing and building"""
    
    @staticmethod
    def parse_request(data: bytes) -> Dict[str, Any]:
        """Parse incoming request message"""
        try:
            message_str = data.decode('utf-8')
            message = json.loads(message_str)
            return message
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON format: {str(e)}")
        except UnicodeDecodeError as e:
            raise ValueError(f"Invalid encoding: {str(e)}")
    
    @staticmethod
    def build_response(
        status: str,
        request_id: Optional[str] = None,
        recognized: Optional[bool] = None,
        customer_id: Optional[int] = None,
        customer_name: Optional[str] = None,
        latest_order: Optional[Dict[str, Any]] = None,
        message: Optional[str] = None,
        error_code: Optional[str] = None,
        error_message: Optional[str] = None,
        return_dict: bool = False
    ):
        """Build response message
        
        Args:
            return_dict: If True, return dict instead of bytes (for HTTP API)
        """
        response = {
            'status': status,
            'timestamp': datetime.now().isoformat()
        }
        
        if request_id:
            response['request_id'] = request_id
        
        if status == 'success':
            if recognized is not None:
                response['recognized'] = recognized
            
            # Add customer_id if provided (for both recognize and register)
            if customer_id is not None:
                response['customer_id'] = customer_id
            
            if recognized and customer_id:
                if customer_name:
                    response['customer_name'] = customer_name
                if latest_order:
                    response['latest_order'] = latest_order
            
            if message:
                response['message'] = message
        
        elif status == 'error':
            if error_code:
                response['error_code'] = error_code
            if error_message:
                response['error_message'] = error_message
        
        if return_dict:
            return response
        
        response_json = json.dumps(response, default=str)
        return response_json.encode('utf-8')
    
    @staticmethod
    def validate_request(message: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """Validate request message structure"""
        if 'request_type' not in message:
            return False, "Missing 'request_type' field"
        
        request_type = message['request_type']
        
        if request_type == 'RECOGNIZE':
            if 'image_data' not in message:
                return False, "Missing 'image_data' field for RECOGNIZE request"
        
        elif request_type == 'REGISTER':
            required_fields = ['image_data', 'customer_name', 'order_details']
            for field in required_fields:
                if field not in message:
                    return False, f"Missing '{field}' field for REGISTER request"
        
        else:
            return False, f"Unknown request_type: {request_type}"
        
        return True, None

