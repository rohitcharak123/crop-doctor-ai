from fastapi import FastAPI, UploadFile, File
import uvicorn
import numpy as np
from PIL import Image
import io
import os
import tensorflow as tf

app = FastAPI(title="Crop Doctor AI Engine")

MODEL_PATH = "crop_doctor_model.keras"

# Check if model exists, load it
try:
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH)
        print("Custom AI Model loaded successfully!")
    else:
        model = None
        print(f"Model '{MODEL_PATH}' not found. Please run train.py first!")
except Exception as e:
    model = None
    print(f"Error loading model: {e}")

import json

# Try to load custom class names from training session
CLASS_NAMES = []
try:
    if os.path.exists("class_names.json"):
        with open("class_names.json", "r") as f:
            CLASS_NAMES = json.load(f)
            print(f"Loaded {len(CLASS_NAMES)} custom classes for prediction.")
    else:
        print("class_names.json not found! Run train.py first so the server knows what classes exist.")
except Exception as e:
    print(f"Error loading class_names.json: {e}")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        return {"error": "Model not trained yet. Please run train.py first to create the custom dataset model."}
    
    try:
        # Read uploaded image
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Resize image to match what the model expects (224x224 RGB)
        image = image.resize((224, 224)).convert("RGB")
        
        # Convert to numpy array and scale pixels
        img_array = np.array(image) / 255.0
        
        # Expand dimensions to match model input (Batch size 1)
        img_array = np.expand_dims(img_array, axis=0) # Shape: (1, 224, 224, 3)
        
        # Run prediction
        predictions = model.predict(img_array)
        score = tf.nn.softmax(predictions[0])
        
        predicted_class_index = np.argmax(score)
        predicted_label = CLASS_NAMES[predicted_class_index]
        confidence = float(np.max(score))
        
        return {
            "label": predicted_label,
            "confidence": confidence
        }

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
