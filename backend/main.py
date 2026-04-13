import os
import uuid
import time
import logging
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from openai import OpenAI
from gtts import gTTS
from dotenv import load_dotenv

# Set up logging to see details in terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="GovVoice AI IVR (No-FFmpeg Version)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenRouter Client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

sessions: Dict[str, List[Dict[str, str]]] = {}

SYSTEM_PROMPT = """
You are a helpful government IVR assistant for the Citizen Services Helpline.
Your tone should be professional, empathetic, and polite.
Support both Hindi and English (Hinglish).
Keep responses very concise (1-2 sentences).
"""

class TextQuery(BaseModel):
    text: str
    session_id: Optional[str] = None

class QueryResponse(BaseModel):
    session_id: str
    response_text: str
    audio_url: str

@app.get("/")
async def root():
    return {"message": "GovVoice AI Backend is running"}

@app.post("/process-text", response_model=QueryResponse)
async def process_text(query: TextQuery, request: Request):
    # Log the incoming data for debugging
    logger.info(f"Received query: {query.text} | Session: {query.session_id}")
    
    session_id = query.session_id
    if not session_id or session_id == "null":
        session_id = str(uuid.uuid4())
    
    if session_id not in sessions:
        sessions[session_id] = [{"role": "system", "content": SYSTEM_PROMPT}]

    try:
        sessions[session_id].append({"role": "user", "content": query.text})

        completion = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=sessions[session_id]
        )
        ai_response = completion.choices[0].message.content
        sessions[session_id].append({"role": "assistant", "content": ai_response})

        tts_output_path = f"response_{session_id}_{int(time.time())}.mp3"
        tts = gTTS(text=ai_response, lang='hi') 
        tts.save(tts_output_path)

        return QueryResponse(
            session_id=session_id,
            response_text=ai_response,
            audio_url=f"/get-audio?path={tts_output_path}"
        )

    except Exception as e:
        logger.error(f"Error processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-audio")
async def get_audio(path: str):
    if os.path.exists(path):
        return FileResponse(path, media_type="audio/mpeg", filename="response.mp3")
    raise HTTPException(status_code=404, detail="Audio file not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
