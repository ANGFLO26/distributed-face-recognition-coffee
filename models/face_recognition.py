"""
Face Recognition Engine
Handles face detection and recognition using face_recognition library
"""

import os
import face_recognition
import numpy as np
from typing import Optional, Tuple, List, Dict
from PIL import Image
import io
import base64
from dotenv import load_dotenv

load_dotenv()


class FaceRecognitionEngine:
    """Face Recognition Engine using face_recognition library"""
    
    def __init__(self):
        self.tolerance = float(os.getenv('FACE_RECOGNITION_TOLERANCE', 0.6))
        self.model = os.getenv('FACE_RECOGNITION_MODEL', 'hog')  # 'hog' or 'cnn'
        print(f"✓ Face Recognition Engine initialized (tolerance: {self.tolerance}, model: {self.model})")
    
    def decode_image_from_base64(self, base64_string: str) -> np.ndarray:
        """Decode base64 string to image array"""
        try:
            # Remove data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # Decode base64
            image_data = base64.b64decode(base64_string)
            
            # Convert to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy array
            image_array = np.array(image)
            
            return image_array
            
        except Exception as e:
            raise Exception(f"Failed to decode image: {str(e)}")
    
    def detect_and_extract_face_encoding(self, image_array: np.ndarray) -> Tuple[Optional[np.ndarray], str]:
        """
        Detect face in image and extract encoding
        Returns: (face_encoding, status_message)
        """
        try:
            # Detect faces
            face_locations = face_recognition.face_locations(
                image_array,
                model=self.model
            )
            
            if len(face_locations) == 0:
                return None, "NO_FACE_DETECTED"
            
            if len(face_locations) > 1:
                # Multiple faces detected, use the largest one
                face_sizes = []
                for face_location in face_locations:
                    top, right, bottom, left = face_location
                    size = (bottom - top) * (right - left)
                    face_sizes.append(size)
                
                largest_face_idx = np.argmax(face_sizes)
                face_location = face_locations[largest_face_idx]
                
                print(f"⚠ Multiple faces detected, using largest face")
            else:
                face_location = face_locations[0]
            
            # Extract face encoding
            face_encodings = face_recognition.face_encodings(
                image_array,
                [face_location]
            )
            
            if len(face_encodings) == 0:
                return None, "FACE_ENCODING_FAILED"
            
            face_encoding = face_encodings[0]
            
            return face_encoding, "SUCCESS"
            
        except Exception as e:
            raise Exception(f"Face detection error: {str(e)}")
    
    def compare_faces(self, known_encodings: List[np.ndarray], face_encoding_to_check: np.ndarray) -> Tuple[Optional[int], float]:
        """
        Compare face encoding with known encodings
        Returns: (best_match_index, distance)
        """
        if len(known_encodings) == 0:
            return None, float('inf')
        
        # Calculate distances
        distances = face_recognition.face_distance(
            known_encodings,
            face_encoding_to_check
        )
        
        # Find best match (smallest distance)
        best_match_idx = np.argmin(distances)
        best_distance = distances[best_match_idx]
        
        return best_match_idx, best_distance
    
    def recognize_face(self, image_base64: str, known_customers: List[Dict]) -> Tuple[Optional[int], float, str]:
        """
        Recognize face from base64 image
        Args:
            image_base64: Base64 encoded image string
            known_customers: List of customer dicts with 'customer_id' and 'face_encoding'
        Returns:
            (customer_id, distance, status_message)
        """
        try:
            # Decode image
            image_array = self.decode_image_from_base64(image_base64)
            
            # Extract face encoding
            face_encoding, status = self.detect_and_extract_face_encoding(image_array)
            
            if face_encoding is None:
                return None, float('inf'), status
            
            # Prepare known encodings
            known_encodings = []
            customer_ids = []
            
            for customer in known_customers:
                # Convert list to numpy array if needed
                encoding = customer['face_encoding']
                if isinstance(encoding, list):
                    encoding = np.array(encoding)
                known_encodings.append(encoding)
                customer_ids.append(customer['customer_id'])
            
            # Compare faces
            best_match_idx, distance = self.compare_faces(known_encodings, face_encoding)
            
            if best_match_idx is not None and distance <= self.tolerance:
                customer_id = customer_ids[best_match_idx]
                return customer_id, distance, "RECOGNIZED"
            else:
                return None, distance, "NOT_RECOGNIZED"
                
        except Exception as e:
            raise Exception(f"Recognition error: {str(e)}")


# Global instance
face_engine = FaceRecognitionEngine()

