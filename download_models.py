import os
import urllib.request

MODELS_DIR = "frontend/public/models"
# Correct raw content URL - the previous one was potentially wrong or had issues
BASE_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

models = [
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_expression_model-weights_manifest.json",
    "face_expression_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1"
]

def download_models():
    # Ensure directory exists
    if not os.path.exists(MODELS_DIR):
        try:
            os.makedirs(MODELS_DIR)
            print(f"Created directory: {MODELS_DIR}")
        except FileExistsError:
            pass # Race condition or already exists

    for model_name in models:
        url = f"{BASE_URL}/{model_name}"
        dest_path = os.path.join(MODELS_DIR, model_name)
        
        if os.path.exists(dest_path):
            print(f"Skipping {model_name} (already exists)")
            continue
            
        print(f"Downloading {model_name}...")
        try:
            urllib.request.urlretrieve(url, dest_path)
            print("Done.")
        except Exception as e:
            print(f"Failed to download {model_name}: {e}")

if __name__ == "__main__":
    download_models()
