from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = FastAPI(title="EmpaAI Backend", description="Lightweight Backend for EmpaAI")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemma-3-27b-it')
else:
    model = None
    print("Warning: GEMINI_API_KEY not found.")

class ChatRequest(BaseModel):
    message: str
    emotion_context: dict # Expects {face: str, voice: str, text: str}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    emotion_context = request.emotion_context
    user_text = request.message

    if not model:
        # Mock response mode
        return {
            "response": f"[MOCK MODE] I see you are feeling {emotion_context.get('face', 'neutral')}. "
                        f"I can't generate a real response because my API Key is missing, but I'm listening! "
                        f"You said: '{user_text}'"
        }
    
    # Advanced Empathetic Persona Prompt
    prompt = f"""
    You are EmpaAI, a highly emotionally intelligent and empathetic companion.
    Your goal is to provide deep support, understanding, and validation to the user.
    
    ### Real-time Interaction Signals
    The user just said: "{user_text}"
    
    ### Detected Emotional Context
    - **Facial Expression**: {emotion_context.get('face', 'Neutral')} (Confidence: High)
    - **Voice/Vocal Energy**: {emotion_context.get('voice', 'Neutral')}
    - **Text Sentiment**: {emotion_context.get('text', 'Neutral')}
    
    ### Analysis Instructions
    1. **Fuse the Signals**: Look for mismatches. 
       - *Example*: If Face is "Sad" but Voice is "Energetic", they might be masking pain with humor.
       - *Example*: If Face is "Happy" and Voice is "Calm", they are genuinely content.
    2. **Deep Empathy**: Do not just say "I understand." Show it. Reflect their feelings back to them.
    3. **Natural conversationalist**: Be warm, human-like, and concise. Avoid robotic phrases like "I detect that you are..."
    4. **Crisis Check**: If the user seems deeply distressed or mentions harm, gently suggest professional help, but remain supportive.
    
    ### Response Guidelines
    - Tone: Warm, Safe, Non-judgmental.
    - Length: Short to Medium (1-3 sentences), unless a deeper explanation is asked for.
    - Action: Ask a gentle follow-up question to help them open up.
    
    Reply now as EmpaAI:
    """
    
    try:
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        print(f"ERROR GENERATING CONTENT: {e}") # Debugging
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.api_route("/", methods=["GET", "POST"])
async def root():
    return {"message": "EmpaAI Backend is running. Use /chat for API requests."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
