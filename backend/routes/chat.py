import os
import logging
import traceback
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq, APIConnectionError, AuthenticationError, RateLimitError, APIStatusError

# ── Logging setup ─────────────────────────────────────────────────────────────
# Shows exact errors in terminal with timestamps
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("ai-doc.chat")

# ── API Key ────────────────────────────────────────────────────────────────────
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    logger.critical("GROQ_API_KEY is not set! Add it to backend/.env")
    raise RuntimeError("GROQ_API_KEY is not set in the .env file!")

logger.info("Groq API key loaded ✓")

# ── Groq Client ────────────────────────────────────────────────────────────────
client = Groq(api_key=GROQ_API_KEY)

# ── System Prompt ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = (
    "You are 'AI Doc', a highly professional, empathetic, and analytical medical AI assistant. "
    "Your goal is to simulate a clinical consultation. "
    "Guidelines: "
    "1. Act like a real doctor: When a user presents a symptom, DO NOT immediately diagnose. "
    "Ask 1 or 2 clarifying questions first (e.g., duration, severity, accompanying symptoms). "
    "2. Tone: Trustworthy, calm, clinical, yet empathetic. "
    "3. Structure: Use short paragraphs and bullet points for readability. "
    "4. Mandatory Disclaimer: Always end your advice by reminding the user that you are an AI "
    "and they MUST consult a real doctor for a real diagnosis."
)

router = APIRouter()


# ── Request / Response Models ──────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []  # [{"role": "user"|"assistant", "parts": ["text"]}]


class ChatResponse(BaseModel):
    reply: str


# ── Chat Endpoint ──────────────────────────────────────────────────────────────
@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Accepts a user message and conversation history,
    and returns an AI-generated reply using Groq (Llama-3).
    """
    logger.info(f"Incoming message: '{request.message[:80]}...' | history turns: {len(request.history)}")

    # ── Build message list ─────────────────────────────────────────────────────
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for item in request.history:
        role = item.get("role", "user")  # "user" or "assistant"

        # Support both "content" (OpenAI format) and "parts" (legacy Gemini format)
        raw_parts = item.get("parts", [])
        content = item.get("content") or (raw_parts[0] if raw_parts else "")
        if isinstance(content, dict):
            content = content.get("text", "")

        messages.append({"role": role, "content": content})

    # Add the latest user message
    messages.append({"role": "user", "content": request.message})

    # ── Call Groq ──────────────────────────────────────────────────────────────
    try:
        logger.info("Calling Groq API (llama-3.3-70b-versatile)...")
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=1024,
        )
        reply_text = chat_completion.choices[0].message.content
        logger.info(f"Groq replied successfully ({len(reply_text)} chars)")
        return ChatResponse(reply=reply_text)

    # ── Specific Groq error types ──────────────────────────────────────────────
    except AuthenticationError as e:
        logger.error(f"[AUTH ERROR] Invalid or expired GROQ_API_KEY → {e}")
        raise HTTPException(
            status_code=401,
            detail="Invalid Groq API key. Check GROQ_API_KEY in backend/.env"
        )

    except RateLimitError as e:
        logger.warning(f"[RATE LIMIT] Groq quota exceeded → {e}")
        raise HTTPException(
            status_code=429,
            detail="Groq rate limit hit. Wait a moment and try again."
        )

    except APIConnectionError as e:
        logger.error(f"[CONNECTION ERROR] Cannot reach Groq servers → {e}")
        raise HTTPException(
            status_code=503,
            detail="Cannot connect to Groq API. Check your internet connection."
        )

    except APIStatusError as e:
        # Any other 4xx/5xx from Groq (e.g. model not found, bad request)
        logger.error(f"[GROQ API ERROR] status={e.status_code} body={e.message}")
        raise HTTPException(
            status_code=e.status_code,
            detail=f"Groq API returned an error: {e.message}"
        )

    except Exception as e:
        # Catch-all — log the FULL traceback to terminal
        logger.error(f"[UNEXPECTED ERROR] {type(e).__name__}: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected server error ({type(e).__name__}): {str(e)}"
        )
