#!/bin/bash

# Navigate to script directory
cd "$(dirname "$0")"

if [ ! -s .env ]; then
    echo "Error: .env file is empty or missing!"
    echo "Please edit backend/.env and add: GEMINI_API_KEY=your_key"
    echo "Current file content size: $(wc -c < .env) bytes"
    exit 1
fi

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
else
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Run the server
echo "Starting EmpaAI Backend..."
python3 -m uvicorn main:app --reload
