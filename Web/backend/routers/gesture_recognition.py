from fastapi import APIRouter, File, UploadFile, Form
from services.gesture_service import GestureService
from models.api_models import GameActionResponse

router = APIRouter()
# This instance is created once when the application starts
gesture_service = GestureService()

@router.post("/detect", response_model=GameActionResponse)
async def detect_gesture(
    player_id: int = Form(...),
    image: UploadFile = File(...)
):
    """Processes a game action based on a player's hand sign."""
    image_bytes = await image.read()
    result = await gesture_service.process_player_action(image_bytes, player_id)
    return GameActionResponse(**result)