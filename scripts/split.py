import os
import shutil
import random
from pathlib import Path

VALID_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

PROJECT_ROOT = Path(__file__).resolve().parents[1]
RAW_DATA = PROJECT_ROOT / "raw_data"
DATA_STAGE1 = PROJECT_ROOT / "data_stage1"
CATTLE_DIR = RAW_DATA / "cattle"
NON_CATTLE_DIR = RAW_DATA / "non_cattle"
BUFFALO_DIR = RAW_DATA / "buffalo"


def is_image(p: Path) -> bool:
    return p.is_file() and p.suffix.lower() in VALID_EXTS


def split_files(file_list, train_dir: Path, val_dir: Path, split_ratio=0.8):
    random.shuffle(file_list)
    split_idx = int(len(file_list) * split_ratio)
    train_files = file_list[:split_idx]
    val_files = file_list[split_idx:]
    train_dir.mkdir(parents=True, exist_ok=True)
    val_dir.mkdir(parents=True, exist_ok=True)
    for src in train_files:
        dst = train_dir / src.name
        if dst.exists():
            dst = train_dir / f"{src.parent.name}_{src.name}"
        shutil.copy2(str(src), str(dst))
    for src in val_files:
        dst = val_dir / src.name
        if dst.exists():
            dst = val_dir / f"{src.parent.name}_{src.name}"
        shutil.copy2(str(src), str(dst))
    return len(train_files), len(val_files)


def main():
    random.seed(42)
    # Clean old train/val folders before creating new ones
    if DATA_STAGE1.exists():
        shutil.rmtree(DATA_STAGE1)
    DATA_STAGE1.mkdir(parents=True, exist_ok=True)
    if not CATTLE_DIR.exists():
        raise FileNotFoundError(f"Missing cattle folder at: {CATTLE_DIR}")
    if not NON_CATTLE_DIR.exists():
        raise FileNotFoundError(f"Missing non_cattle folder at: {NON_CATTLE_DIR}")
    if not BUFFALO_DIR.exists():
        raise FileNotFoundError(f"Missing buffalo folder at: {BUFFALO_DIR}")

    cattle_files = [p for p in CATTLE_DIR.rglob("*") if is_image(p)]
    non_cattle_files = [p for p in NON_CATTLE_DIR.rglob("*") if is_image(p)]
    buffalo_files = [p for p in BUFFALO_DIR.rglob("*") if is_image(p)]

    print(f"Cattle files found: {len(cattle_files)}")
    print(f"Non-cattle files found: {len(non_cattle_files)}")
    print(f"Buffalo files found: {len(buffalo_files)}")

    train_cattle = DATA_STAGE1 / "train" / "cattle"
    val_cattle = DATA_STAGE1 / "val" / "cattle"
    train_nc = DATA_STAGE1 / "train" / "non_cattle"
    val_nc = DATA_STAGE1 / "val" / "non_cattle"
    train_buffalo = DATA_STAGE1 / "train" / "buffalo"
    val_buffalo = DATA_STAGE1 / "val" / "buffalo"

    print("Splitting cattle 80/20 → train/val …")
    c_tr, c_val = split_files(cattle_files, train_cattle, val_cattle, split_ratio=0.8)
    print(f"✅ Cattle → train: {c_tr}, val: {c_val}")

    print("Splitting non_cattle 80/20 → train/val …")
    n_tr, n_val = split_files(non_cattle_files, train_nc, val_nc, split_ratio=0.8)
    print(f"✅ Non-cattle → train: {n_tr}, val: {n_val}")

    print("Splitting buffalo 80/20 → train/val …")
    b_tr, b_val = split_files(buffalo_files, train_buffalo, val_buffalo, split_ratio=0.8)
    print(f"✅ Buffalo → train: {b_tr}, val: {b_val}")

    print("\nAll done. Output at:")
    print(f" - {train_cattle}")
    print(f" - {val_cattle}")
    print(f" - {train_nc}")
    print(f" - {val_nc}")
    print(f" - {train_buffalo}")
    print(f" - {val_buffalo}")


if __name__ == "__main__":
    main()
