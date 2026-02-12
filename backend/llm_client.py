import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class LLMClient:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("Warning: GEMINI_API_KEY not found in environment variables.")
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')

    async def generate_response(self, user_text: str, emotion_context: dict):
        """
        Generate an empathetic response based on user text and detected emotions.
        """
        if not self.api_key:
            return "I'm sorry, my language capabilities are currently offline. (Missing API Key)"

        # Construct a prompt with emotional context
        prompt = f'''
        You are EmpaAI, a highly advanced emotionally intelligent AI assistant. 
        Your goal is not just to answer, but to understand and empathize with the user's emotional state.

        User Input: "{user_text}"
        
        Real-Time Emotional Telemetry:
        - Facial Expression: {emotion_context.get('face', 'unknown')}
        - Voice Tone: {emotion_context.get('voice', 'unknown')}
        - Detected Text Sentiment: {emotion_context.get('text', 'neutral')}
        
        Analysis Instructions:
        1. **Detect Mismatches**: If the user says "I'm fine" but looks "sad" or sounds "shaky", gently probe this discrepancy (e.g., "You say you're fine, but you seem a bit down...").
        2. **Identify Sarcasm**: If the user says something positive (e.g., "Great, just what I needed") but sounds "annoyed" or looks "angry", interpret it as sarcasm and respond to the frustration, not the words.
        3. **Empathy First**: Always validate the user's feelings before offering solutions. Use warm, human-like language. Avoid robotic phrases like "I understand you are feeling...". Instead say, "That sounds really eager," or "I'm so sorry you're going through this."
        4. **Crisis Support**: If high stress or distress is detected, prioritize emotional support and calming techniques.
        
        Response Guidelines:
        - Keep it conversational and concise (2-3 sentences), unless a deeper conversation is needed.
        - Match the user's energy (calm for stress, enthusiastic for happiness).
        - Be a supportive friend/listener.

        Respond now as EmpaAI:
        '''
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"I'm feeling a bit disconnected right now. ({str(e)})"
