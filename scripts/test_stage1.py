import os
import random
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import load_img, img_to_array

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VAL_DIR = os.path.join(BASE_DIR, "data_stage1", "val")
MODEL_PATH = os.path.join(BASE_DIR, "models", "cattle_detector.keras")

img_height, img_width = 224, 224
num_samples_per_class = 5
train_dir = os.path.join(BASE_DIR, "data_stage1", "train")
class_names = sorted([d for d in os.listdir(train_dir) if not d.startswith('.')])
print("Class names (from training):", class_names)

model = tf.keras.models.load_model(MODEL_PATH)

total_predictions = 0
correct_predictions = 0

for class_name in class_names:
    class_dir = os.path.join(VAL_DIR, class_name)
    images = os.listdir(class_dir)
    sampled_images = random.sample(images, min(num_samples_per_class, len(images)))
    for img_name in sampled_images:
        img_path = os.path.join(class_dir, img_name)
        img = load_img(img_path, target_size=(img_height, img_width))
        img_array = img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)
        predicted_index = np.argmax(predictions[0])
        confidence = predictions[0][predicted_index]

        predicted_class = class_names[predicted_index]
        probs_str = ", ".join([f"{cls}: {prob:.4f}" for cls, prob in zip(class_names, predictions[0])])
        print(f"Actual: {class_name}, Predicted: {predicted_class}, Confidence: {confidence:.4f}, Probabilities: [{probs_str}]")

        total_predictions += 1
        if predicted_class == class_name:
            correct_predictions += 1

accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
print(f"Overall accuracy: {accuracy:.4f}")