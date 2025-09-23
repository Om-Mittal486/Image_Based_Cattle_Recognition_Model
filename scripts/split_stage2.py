import os
import shutil
from sklearn.model_selection import train_test_split

images_root = "raw_images_stage2"
output_root = "data_stage2"

if os.path.exists(output_root):
    shutil.rmtree(output_root)
os.makedirs(output_root, exist_ok=True)

train_root = os.path.join(output_root, "train")
val_root = os.path.join(output_root, "val")
os.makedirs(train_root, exist_ok=True)
os.makedirs(val_root, exist_ok=True)

breeds = [d for d in os.listdir(images_root) if os.path.isdir(os.path.join(images_root, d))]

for breed in breeds:
    breed_folder = os.path.join(images_root, breed)
    images = [f for f in os.listdir(breed_folder) if os.path.isfile(os.path.join(breed_folder, f))]
    train_imgs, val_imgs = train_test_split(images, test_size=0.2, random_state=42)

    os.makedirs(os.path.join(train_root, breed), exist_ok=True)
    os.makedirs(os.path.join(val_root, breed), exist_ok=True)

    for img_file in train_imgs:
        src = os.path.join(breed_folder, img_file)
        dst = os.path.join(train_root, breed, img_file)
        shutil.copy(src, dst)

    for img_file in val_imgs:
        src = os.path.join(breed_folder, img_file)
        dst = os.path.join(val_root, breed, img_file)
        shutil.copy(src, dst)

    print(f"Breed '{breed}': {len(train_imgs)} training images, {len(val_imgs)} validation images")

print("All done. Output at:")
print(f" - {train_root}/<breed_name>")
print(f" - {val_root}/<breed_name>")