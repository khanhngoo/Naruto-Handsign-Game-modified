from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import style_transfer, gesture_recognition, health

# Create FastAPI app
app = FastAPI(
    title="Naruto Game Backend",
    description="Backend API for Naruto Fighting Game with AI features",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(style_transfer.router, prefix="/api/style-transfer", tags=["style-transfer"])
app.include_router(gesture_recognition.router, prefix="/api/gesture", tags=["gesture"])

@app.on_event("startup")
async def startup_event():
    """Initialize ML models on startup"""
    # TODO: Load ML models here
    print("Loading ML models...")
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
