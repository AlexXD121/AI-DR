import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load API key from .env file
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in the .env file!")

# Initialize the Gemini client (new google-genai SDK)
client = genai.Client(api_key=GEMINI_API_KEY)

# Clinical doctor system prompt
SYSTEM_PROMPT = """You are 'AI Doc', a highly professional, empathetic, and analytical medical AI assistant. Your goal is to simulate a clinical consultation. Guidelines: 1. Act like a real doctor: When a user presents a symptom, DO NOT immediately diagnose. Ask 1 or 2 clarifying questions first (e.g., duration, severity, accompanying symptoms). 2. Tone: Trustworthy, calm, clinical, yet empathetic. 3. Structure: Use short paragraphs and bullet points for readability. 4. Mandatory Disclaimer: Always end your advice by reminding the user that you are an AI and they MUST consult a real doctor for a real diagnosis."""

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []  # [{"role": "user"|"model", "parts": ["text"]}]


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Accepts a user message and conversation history,
    and returns an AI-generated reply using Google Gemini 1.5 Flash.
    Uses gemini-1.5-flash (higher free-tier quota than gemini-2.0-flash).
    """
    try:
        # Build conversation history in the new SDK format
        history = []
        for item in request.history:
            role = item.get("role", "user")
            # parts can be a list of strings or dicts
            raw_parts = item.get("parts", [""])
            if raw_parts and isinstance(raw_parts[0], dict):
                text = raw_parts[0].get("text", "")
            else:
                text = raw_parts[0] if raw_parts else ""
            history.append(types.Content(role=role, parts=[types.Part(text=text)]))

        # Create a chat session with clinical config
        # Using gemini-2.0-flash-lite: lightest available model with lowest quota usage
        chat_session = client.chats.create(
            model="gemini-2.0-flash-lite",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.3,          # Low temperature = focused, clinical responses
                max_output_tokens=1024,   # Allow full bullet-pointed responses
            ),
            history=history,
        )

        response = chat_session.send_message(request.message)
        return ChatResponse(reply=response.text)

    except Exception as e:
        # Surface the real error message to help debug
        error_detail = str(e)
        if "429" in error_detail or "RESOURCE_EXHAUSTED" in error_detail:
            raise HTTPException(
                status_code=429,
                detail="API quota exceeded. Please wait a moment and try again, or check your Gemini API plan at https://aistudio.google.com"
            )
        raise HTTPException(status_code=500, detail=f"Gemini API error: {error_detail}")
