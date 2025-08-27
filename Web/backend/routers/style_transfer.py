from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from services.style_service import StyleService
from models.api_models import StyleTransferResponse

router = APIRouter()
style_service = StyleService()

@router.post("/character", response_model=StyleTransferResponse)
async def style_character(
    image: UploadFile = File(...),
    style: str = Form(...),
    intensity: float = Form(0.8)
):
    """Apply artistic style to character image"""
    
    # TODO: Add validation logic here
    
    # Call service
    result = await style_service.apply_style(image, style, intensity)
    
    return StyleTransferResponse(**result)
