from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import pandas as pd
import uvicorn
import os
import io
from PIL import Image

app = FastAPI()

# Root endpoint for API status
@app.get("/")
async def root():
    return {"message": "FarmVision API is running. Use /predict/ with POST to classify images."}

import json

# Load models
cattle_model = tf.keras.models.load_model("models/cattle_detector.h5")
breed_model = tf.keras.models.load_model("models/breed_classifier.h5")

# Load breed class indices mapping
with open("models/breed_class_indices.json", "r") as f:
    breed_class_indices = json.load(f)
    # Invert mapping to get index -> breed name
    idx_to_breed = {int(v): k for k, v in breed_class_indices.items()}

# Load dataset.csv for metadata
df = pd.read_csv("dataset.csv")

# Normalize helper
def preprocess(img: Image.Image):
    img = img.resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0
    return img_array

# Compute ATC score (simple weighted average)
def compute_atc(age, height, weight):
    return round((0.2 * age + 0.3 * height + 0.5 * weight) / 10, 2)

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img_array = preprocess(img)

    # Stage 1: Cattle detection
    pred_stage1 = cattle_model.predict(img_array)
    class_idx = np.argmax(pred_stage1, axis=1)[0]
    confidence = float(np.max(pred_stage1))

    if class_idx == 0:  # assuming 0 = not cattle, 1 = cattle
        return JSONResponse(content={
            "is_cattle": False,
            "confidence": confidence
        })

    # Stage 2: Breed classification
    pred_stage2 = breed_model.predict(img_array)
    breed_idx = np.argmax(pred_stage2, axis=1)[0]
    confidence_breed = float(np.max(pred_stage2))
    breed_name = idx_to_breed[breed_idx]

    # Fetch traits for this breed (take average of dataset entries)
    breed_data = df[df["breed"] == breed_name]
    age = float(breed_data["age_in_year"].mean())
    height = float(breed_data["height_in_inch"].mean())
    weight = float(breed_data["weight_in_kg"].mean())
    sex = breed_data["sex"].mode()[0]

    # Compute ATC score
    atc_score = compute_atc(age, height, weight)

    return JSONResponse(content={
        "is_cattle": True,
        "cattle_confidence": confidence,
        "breed": breed_name,
        "breed_confidence": confidence_breed,
        "sex": sex,
        "age_in_year": age,
        "height_in_inch": height,
        "weight_in_kg": weight,
        "ATC_score": atc_score
    })

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)