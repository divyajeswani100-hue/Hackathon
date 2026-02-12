# EmpaAI: Emotionally Intelligent AI Assistant

EmpaAI is a web-based AI assistant that bridges the gap between human emotions and artificial intelligence. It uses real-time facial expression analysis to detect user emotions and responds with empathy using Google's Gemini LLM.

## Features
- **Real-time Emotion Detection**: Uses `face-api.js` to analyze facial expressions in the browser.
- **Empathetic Responses**: Generates context-aware, empathetic replies via Google Gemini.
- **Privacy-First**: Emotion analysis happens locally in your browser; video streams are not sent to the server.
- **Modern UI**: Dark-themed, glassmorphism-inspired interface built with Next.js and Tailwind CSS.

## Tech Stack
- **Frontend**: Next.js (React), Tailwind CSS, face-api.js
- **Backend**: Python (FastAPI), Google Gemini API
- **Models**: Mobile-optimized face detection models (Tiny Face Detector)

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Gemini API Key

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` file in `backend/` with your API key:
```
GEMINI_API_KEY=your_api_key_here
```
Run the server:
```bash
python3 -m uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `backend/`: FastAPI server and LLM integration.
- `frontend/`: Next.js application.
- `frontend/public/models`: Pre-trained models for emotion detection.
