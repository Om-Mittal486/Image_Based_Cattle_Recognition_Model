import os
import shutil
from pathlib import Path
import random

RAW_DIR = Path("raw_data/buffalo")
DATA_STAGE3 = Path("data_stage3")

# Remove existing data_stage3 directory if it exists
if DATA_STAGE3.exists():
    shutil.rmtree(DATA_STAGE3)

# Create train and val directories
train_dir = DATA_STAGE3 / "train"
val_dir = DATA_STAGE3 / "val"
train_dir.mkdir(parents=True, exist_ok=True)
val_dir.mkdir(parents=True, exist_ok=True)

# For each breed folder in RAW_DIR
for breed_dir in RAW_DIR.iterdir():
    if breed_dir.is_dir():
        breed = breed_dir.name
        images = list(breed_dir.glob("*.*"))
        random.shuffle(images)
        split_index = int(0.8 * len(images))
        train_images = images[:split_index]
        val_images = images[split_index:]

        # Create breed directories in train and val
        breed_train_dir = train_dir / breed
        breed_val_dir = val_dir / breed
        breed_train_dir.mkdir(parents=True, exist_ok=True)
        breed_val_dir.mkdir(parents=True, exist_ok=True)

        # Copy images to train
        for img_path in train_images:
            shutil.copy(img_path, breed_train_dir / img_path.name)

        # Copy images to val
        for img_path in val_images:
            shutil.copy(img_path, breed_val_dir / img_path.name)

        print(f"Breed '{breed}': {len(train_images)} train images, {len(val_images)} val images")
