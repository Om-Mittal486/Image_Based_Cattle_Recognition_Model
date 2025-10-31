


import os
import random
import json
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from pathlib import Path

# Paths
MODEL_PATH = "models/buffalo_breed_classifier.keras"
CLASS_INDICES_PATH = "models/buffalo_class_indices.json"
VAL_DIR = Path("data_stage3/val")

# Load model and class indices
model = load_model(MODEL_PATH)
with open(CLASS_INDICES_PATH, "r") as f:
    class_indices = json.load(f)
inv_class_indices = {v: k for k, v in class_indices.items()}

# Helper: preprocess image
def preprocess_img(img_path, target_size=(224, 224)):
    img = image.load_img(img_path, target_size=target_size)
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = x / 255.0
    return x

# Sample images
sampled_images = []
for breed_dir in VAL_DIR.iterdir():
    if breed_dir.is_dir():
        imgs = list(breed_dir.glob("*.jpg")) + list(breed_dir.glob("*.png")) + list(breed_dir.glob("*.jpeg"))
        if imgs:
            sampled_images.extend(random.sample(imgs, min(5, len(imgs))))

# Run predictions
correct = 0
for img_path in sampled_images:
    x = preprocess_img(img_path)
    preds = model.predict(x)
    pred_idx = np.argmax(preds[0])
    pred_class = inv_class_indices[pred_idx]
    confidence = preds[0][pred_idx]

    actual_class = img_path.parent.name
    if pred_class == actual_class:
        correct += 1

    probs = {inv_class_indices[i]: float(preds[0][i]) for i in range(len(preds[0]))}
    print(f"Actual: {actual_class}, Predicted: {pred_class}, Confidence: {confidence:.4f}, Probabilities: {probs}")

# Overall accuracy
accuracy = correct / len(sampled_images) if sampled_images else 0
print(f"Overall accuracy: {accuracy:.4f}")