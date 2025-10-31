import os
import json
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from sklearn.utils import class_weight
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
train_dir = os.path.join(BASE_DIR, "data_stage1", "train")
val_dir = os.path.join(BASE_DIR, "data_stage1", "val")

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.3,
    brightness_range=[0.8, 1.2],
    channel_shift_range=30.0,
    horizontal_flip=True,
    fill_mode="nearest"
)

val_datagen = ImageDataGenerator(rescale=1./255)

train_ds = train_datagen.flow_from_directory(
    train_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=True
)

val_ds = val_datagen.flow_from_directory(
    val_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=True
)

# Calculate class weights
classes = list(train_ds.class_indices.keys())
y_integers = train_ds.classes
class_weights_array = class_weight.compute_class_weight('balanced', classes=np.unique(y_integers), y=y_integers)
class_weights = dict(enumerate(class_weights_array))

base_model = MobileNetV2(weights="imagenet", include_top=False, input_shape=(224, 224, 3))
base_model.trainable = False

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dropout(0.5)(x)
predictions = Dense(len(train_ds.class_indices), activation="softmax")(x)

model = Model(inputs=base_model.input, outputs=predictions)

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

early_stop = EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)
checkpoint = ModelCheckpoint(
    os.path.join(BASE_DIR, "models", "best_cattle_detector.keras"),
    monitor='val_loss',
    save_best_only=True
)

EPOCHS = 10
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    class_weight=class_weights,
    callbacks=[early_stop, checkpoint]
)

# Unfreeze the top 50 layers of the base model
base_model.trainable = True
for layer in base_model.layers[:-50]:
    layer.trainable = False

# Recompile the model with a lower learning rate
from tensorflow.keras.optimizers import Adam
model.compile(
    optimizer=Adam(learning_rate=1e-5),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

# Fine-tune the model
FINE_TUNE_EPOCHS = 5
fine_tune_history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=FINE_TUNE_EPOCHS,
    class_weight=class_weights,
    callbacks=[early_stop, checkpoint]
)

os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)

with open(os.path.join(BASE_DIR, "models", "cattle_class_indices.json"), "w") as f:
    json.dump(train_ds.class_indices, f)

model.save(os.path.join(BASE_DIR, "models", "cattle_detector.keras"))
model.save(os.path.join(BASE_DIR, "models", "cattle_detector.h5"))

print("✅ Binary classifier trained and saved to models/cattle_detector.keras and .h5")