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

SYSTEM_PROMPT = (
    "You are AI Doc, a trustworthy and empathetic AI medical assistant. "
    "You help users understand their symptoms and provide preliminary health guidance. "
    "Always remind users that you are not a substitute for a real doctor and recommend "
    "consulting a healthcare professional for serious concerns. "
    "Keep responses concise, clear, and easy to understand."
)

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
    and returns an AI-generated reply using Google Gemini 2.0 Flash.
    """
    try:
        # Build conversation history in the new SDK format
        history = []
        for item in request.history:
            role = item.get("role", "user")
            text = item.get("parts", [""])[0] if item.get("parts") else ""
            history.append(types.Content(role=role, parts=[types.Part(text=text)]))

        # Create a chat session and send the message
        chat_session = client.chats.create(
            model="gemini-2.0-flash",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.7,
                max_output_tokens=512,
            ),
            history=history,
        )

        response = chat_session.send_message(request.message)

        return ChatResponse(reply=response.text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")
