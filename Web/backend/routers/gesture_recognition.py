from fastapi import APIRouter, File, UploadFile, Form
from services.gesture_service import GestureService
from models.api_models import (
    GestureDetectionResponse, 
    SequenceValidationRequest, 
    SequenceValidationResponse
)

router = APIRouter()
gesture_service = GestureService()

@router.post("/detect", response_model=GestureDetectionResponse)
async def detect_gesture(
    image: UploadFile = File(...),
    confidence_threshold: float = Form(0.8)
):
    """Detect hand sign from camera image"""
    
    # TODO: Add validation logic here
    
    # Call service
    result = await gesture_service.detect_sign(image, confidence_threshold)
    
    return GestureDetectionResponse(**result)

@router.post("/validate-sequence", response_model=SequenceValidationResponse)
async def validate_sequence(request: SequenceValidationRequest):
    """Validate hand sign sequence for ninjutsu"""
    
    # Call service
    result = await gesture_service.validate_sequence(
        request.required_sequence,
        request.detected_sequence,
        request.confidence_threshold
    )
    
    return SequenceValidationResponse(**result)
