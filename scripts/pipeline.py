import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image

# Paths
stage1_model_path = "models/stage1_model.h5"
stage2_model_path = "models/stage2_model.h5"
stage3_model_path = "models/stage3_model.h5"

# Load models
stage1_model = tf.keras.models.load_model(stage1_model_path)
stage2_model = tf.keras.models.load_model(stage2_model_path)
stage3_model = tf.keras.models.load_model(stage3_model_path)

# Helper function to preprocess image
def preprocess_img(img_path, target_size=(224, 224)):
    img = image.load_img(img_path, target_size=target_size)
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = x / 255.0
    return x

# Stage 1 classes
stage1_classes = ['cattle', 'buffalo', 'non_cattle']

# Pipeline
def run_pipeline(img_path):
    x = preprocess_img(img_path)

    # Stage 1: classify cattle, buffalo, or non_cattle
    preds1 = stage1_model.predict(x)
    pred_idx1 = np.argmax(preds1[0])
    pred_label1 = stage1_classes[pred_idx1]
    confidence1 = preds1[0][pred_idx1]
    print(f"Stage 1: {pred_label1} ({confidence1:.2f})")

    if pred_label1 == 'non_cattle':
        return

    if pred_label1 == 'cattle':
        # Stage 2: cattle breed classification
        preds2 = stage2_model.predict(x)
        pred_idx2 = np.argmax(preds2[0])
        confidence2 = preds2[0][pred_idx2]
        print(f"Stage 2: {pred_idx2} ({confidence2:.2f})")
    else:
        # Stage 3: buffalo breed classification
        preds3 = stage3_model.predict(x)
        pred_idx3 = np.argmax(preds3[0])
        confidence3 = preds3[0][pred_idx3]
        print(f"Stage 3: {pred_idx3} ({confidence3:.2f})")

# Example usage
if __name__ == "__main__":
    test_img = "/Users/pritpatel/Downloads/sahiwal-cow.jpg"  # change path to test
    run_pipeline(test_img)