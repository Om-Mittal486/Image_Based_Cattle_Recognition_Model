import os
import random
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks, optimizers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import json

# Data directories
train_dir = 'data_stage2/train'
val_dir = 'data_stage2/val'
batch_size = 32
img_size = (224, 224)

# Data generators with stronger augmentation
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=30,
    width_shift_range=0.1,
    height_shift_range=0.1,
    shear_range=0.1,
    zoom_range=0.2,
    brightness_range=[0.8,1.2],
    horizontal_flip=True,
    fill_mode='nearest'
)
val_datagen = ImageDataGenerator(rescale=1./255)

train_gen = train_datagen.flow_from_directory(
    train_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=True
)
train_classes = list(train_gen.class_indices.keys())

val_gen = val_datagen.flow_from_directory(
    val_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=False
)

num_classes = len(train_gen.class_indices)

# Build model
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
base_model.trainable = False
model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.5),
    layers.Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# Callbacks
early_stop = callbacks.EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)
checkpoint = callbacks.ModelCheckpoint('models/best_breed_classifier.h5', monitor='val_loss', save_best_only=True)

# Train model - initial training with frozen base_model
epochs = 10
steps_per_epoch = len(train_gen)
validation_steps = len(val_gen)
model.fit(
    train_gen,
    epochs=epochs,
    validation_data=val_gen,
    steps_per_epoch=steps_per_epoch,
    validation_steps=validation_steps,
    callbacks=[early_stop, checkpoint]
)

# Unfreeze top 50 layers of base_model for fine-tuning
base_model.trainable = True
for layer in base_model.layers[:-50]:
    layer.trainable = False

# Recompile with lower learning rate
model.compile(
    optimizer=optimizers.Adam(learning_rate=1e-5),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Fine-tune model
fine_tune_epochs = 5
total_epochs = epochs + fine_tune_epochs
model.fit(
    train_gen,
    epochs=total_epochs,
    initial_epoch=epochs,
    validation_data=val_gen,
    steps_per_epoch=steps_per_epoch,
    validation_steps=validation_steps,
    callbacks=[early_stop, checkpoint]
)

# Save final model and class indices
os.makedirs('models', exist_ok=True)
model.save('models/breed_classifier.h5')
model.save('models/breed_classifier.keras')

with open('models/breed_class_indices.json', 'w') as f:
    json.dump(train_gen.class_indices, f)

print("Model saved as 'models/breed_classifier.h5' and 'models/breed_classifier.keras'.")
print("Class indices saved as 'models/breed_class_indices.json'.")
print("breed_class_indices.json generated with mapping:", train_gen.class_indices)

# Inference on 5 random val images
from tensorflow.keras.preprocessing import image

class_indices = val_gen.class_indices
idx_to_class = {v: k for k, v in class_indices.items()}

# Sample 5 random images directly from val_dir subdirectories
all_val_files = []
for breed in train_classes:
    breed_dir = os.path.join(val_dir, breed)
    if os.path.isdir(breed_dir):
        files = [os.path.join(breed, f) for f in os.listdir(breed_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        all_val_files.extend(files)

sampled_files = random.sample(all_val_files, min(5, len(all_val_files)))

print("\nSampled validation predictions:")
for file_path in sampled_files:
    img_path = os.path.join(val_dir, file_path)
    actual_breed = os.path.dirname(file_path)
    img = image.load_img(img_path, target_size=img_size)
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = x / 255.0
    preds = model.predict(x)
    pred_idx = np.argmax(preds[0])
    pred_breed = idx_to_class[pred_idx]
    confidence = preds[0][pred_idx]
    print(f"Actual: {actual_breed} | Predicted: {pred_breed} ({confidence:.2%})")

# Evaluate overall validation accuracy
val_loss, val_acc = model.evaluate(val_gen, steps=validation_steps)
print(f"\nOverall validation accuracy: {val_acc:.2%}")