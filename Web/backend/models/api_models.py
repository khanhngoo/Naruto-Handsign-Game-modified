from pydantic import BaseModel, Field
from typing import List, Optional

# Style Transfer Models
class StyleTransferResponse(BaseModel):
    success: bool
    styled_image_url: str
    processing_time: float
    message: Optional[str] = None

# Gesture Recognition Models
class GestureDetectionResponse(BaseModel):
    success: bool
    detected_sign: str
    confidence: float
    processing_time: float

class SequenceValidationRequest(BaseModel):
    ninjutsu_name: str
    required_sequence: List[str]
    detected_sequence: List[str]
    confidence_threshold: float = Field(default=0.8, ge=0.0, le=1.0)

class SequenceValidationResponse(BaseModel):
    success: bool
    sequence_valid: bool
    message: str

# Health Check Model
class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    timestamp: str
