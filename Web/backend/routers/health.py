from fastapi import APIRouter
from models.api_models import HealthResponse
from datetime import datetime

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Simple health check endpoint"""
    
    # TODO: Check if ML models are loaded
    models_loaded = True  # Replace with actual check
    
    return HealthResponse(
        status="healthy",
        models_loaded=models_loaded,
        timestamp=datetime.now().isoformat()
    )
