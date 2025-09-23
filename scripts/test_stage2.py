import os
import json
import random
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Load the trained breed classifier
model_path = 'models/breed_classifier.keras'
model = load_model(model_path)

# Load the class indices to breed names mapping
with open('models/breed_class_indices.json', 'r') as f:
    class_indices = json.load(f)
# Invert the dictionary to map indices to breed names
indices_to_breed = {v: k for k, v in class_indices.items()}

# Directory containing validation images
val_dir = 'data_stage2/val/'

# Gather all validation image paths and their labels
val_image_paths = []
val_labels = []
for breed in os.listdir(val_dir):
    breed_dir = os.path.join(val_dir, breed)
    if os.path.isdir(breed_dir):
        for img_file in os.listdir(breed_dir):
            if img_file.lower().endswith(('.png', '.jpg', '.jpeg')):
                val_image_paths.append(os.path.join(breed_dir, img_file))
                val_labels.append(breed)

# Randomly sample a few validation images for demonstration
sample_size = min(5, len(val_image_paths))
sample_indices = random.sample(range(len(val_image_paths)), sample_size)

print("Sample predictions on validation images:")
for idx in sample_indices:
    img_path = val_image_paths[idx]
    actual_breed = val_labels[idx]

    # Load and preprocess the image
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # Predict
    preds = model.predict(img_array)
    pred_index = np.argmax(preds)
    pred_breed = indices_to_breed[pred_index]
    confidence = preds[0][pred_index]

    print(f"Actual: {actual_breed} | Predicted: {pred_breed} | Confidence: {confidence:.4f}")

# Compute overall accuracy on the validation set
correct = 0
total = len(val_image_paths)
batch_size = 32

for i in range(0, total, batch_size):
    batch_paths = val_image_paths[i:i+batch_size]
    batch_labels = val_labels[i:i+batch_size]

    batch_images = []
    for img_path in batch_paths:
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img) / 255.0
        batch_images.append(img_array)
    batch_images = np.array(batch_images)

    preds = model.predict(batch_images)
    pred_indices = np.argmax(preds, axis=1)
    pred_breeds = [indices_to_breed[idx] for idx in pred_indices]

    for pred_breed, actual_breed in zip(pred_breeds, batch_labels):
        if pred_breed == actual_breed:
            correct += 1

accuracy = correct / total if total > 0 else 0
print(f"Overall validation accuracy: {accuracy:.4f}")
