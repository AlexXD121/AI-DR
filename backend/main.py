import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("ai-doc.main")

app = FastAPI(title="AI Doc Backend", version="1.0.0")

# Allow all origins in development so CORS never blocks the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,   # must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(chat_router, prefix="/api")


@app.on_event("startup")
async def on_startup():
    logger.info("=" * 50)
    logger.info("  AI Doc Backend is RUNNING on http://localhost:8000")
    logger.info("  Frontend expected at  http://localhost:5173")
    logger.info("  Chat endpoint:        POST /api/chat")
    logger.info("=" * 50)


@app.get("/")
def health_check():
    return {"status": "AI Doc backend is running 🩺"}
