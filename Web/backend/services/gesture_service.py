import time
import numpy as np
import cv2
from pathlib import Path
from fastapi import UploadFile
from typing import List, Dict
from ml_models.gesture_recognition.inference import GestureRecognitionModel #find correct path of inference

class GestureService:
    """Business logic for gesture recognition"""
    
    def __init__(self):
        self.supported_signs = [
            'bird', 'boar', 'dog', 'dragon', 'hare', 'horse',
            'monkey', 'ox', 'ram', 'rat', 'snake', 'tiger'
        ]
        # TODO: Initialize ML model here
        backend_root = Path(__file__).resolve().parent.parent 
        model_path = backend_root / "weights" / "best.pt"
        print(f"Attempting to load model from absolute path: {model_path}")

        self.model = GestureRecognitionModel(model_path=str(model_path))
        self.JUTSU_DATABASE = {
            # Single-sign Jutsus
            ('tiger',): {"name": "Fire Release", "damage": 5, "video_url": "https://youtu.be/KuH8AA8HeC4"},
            ('dog',): {"name": "Water Release", "damage": 5, "video_url": "https://www.youtube.com/watch?v=lJjb193Tidc"},
            ('bird',): {"name": "Wind Release", "damage": 5, "video_url": "https://www.youtube.com/watch?v=GOBZIdBKaHw"},

            # Multi-sign Jutsus (ensuring unique prefixes)
            ('horse', 'tiger', 'Monkey'): {"name": "Chidori", "damage": 25, "video_url": "https://www.youtube.com/watch?v=AyQi0N3zuGU"},
            ('ram', 'Tiger', 'monkey', 'boar', 'horse', 'tiger'): {"name": "Katon: Gōkakyū no Jutsu", "damage": 35, "video_url": "https://www.youtube.com/watch?v=oWi8jVqITng"},
            ('snake', 'ram', 'monkey', 'boar', 'horse', 'tiger'): {"name": "Katon: Hosenka no Jutsu", "damage": 30, "video_url": "https://www.youtube.com/watch?v=P5e9U-E2t5g"},
        }
        
        # Manages the current sequence for each player
        self.player_sequences: Dict[int, list] = {1: [], 2: []}
    
    async def process_player_action(self, image_bytes: bytes, player_id: int) -> dict:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        prediction = self.model.predict(img)
        
        if not prediction or prediction['confidence'] < 0.75:
            return {"status": "no_sign_detected"}

        detected_sign = prediction['sign']
        player_sequence = self.player_sequences[player_id]

        if not player_sequence or player_sequence[-1] != detected_sign:
            player_sequence.append(detected_sign)

        current_sequence_tuple = tuple(player_sequence)
        if current_sequence_tuple in self.JUTSU_DATABASE:
            jutsu_info = self.JUTSU_DATABASE[current_sequence_tuple]
            self.player_sequences[player_id] = [] # Reset on success
            return {"status": "jutsu_activated", "jutsu": jutsu_info}
        
        return {"status": "sequence_updated", "current_sequence": player_sequence}
    
    
    async def detect_sign(self, image_file: UploadFile, confidence_threshold: float = 0.8):
        """Detect hand sign from camera image"""
        
        start_time = time.time()
        #10 combination class + 3 single ez class
        try:
            # TODO: 1. Validate input
            
            # TODO: 2. Save uploaded file (temporary)
            
            # TODO: 3. Process the image (call ML model)
            
            # TODO: 4. Clean up input file
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "detected_sign": "tiger",  # Placeholder
                "confidence": 0.95,        # Placeholder
                "processing_time": processing_time #Consider adding the jutsu result as well
                
            }
            
        except Exception as e:
            return {
                "success": False,
                "detected_sign": "",
                "confidence": 0.0,
                "processing_time": time.time() - start_time
            }
    
    async def validate_sequence(self, required_sequence: List[str], detected_sequence: List[str], confidence_threshold: float = 0.8):
        """Validate if detected sequence matches required sequence"""
        
        try:
            # TODO: Implement sequence validation logic
            
            sequence_valid = False  # Placeholder
            
            return {
                "success": True,
                "sequence_valid": sequence_valid,
                "message": "Sequence validation completed"
            }
            
        except Exception as e:
            return {
                "success": False,
                "sequence_valid": False,
                "message": f"Error: {str(e)}"
            }
    
    def _validate_signs(self, signs: List[str]):
        """Validate if all signs are supported"""
        # TODO: Implement validation
        pass
    
    async def _preprocess_image(self, image_file: UploadFile):
        """Preprocess image for ML model"""
        # TODO: Implement preprocessing
        pass
