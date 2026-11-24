"""Verificación local de cp001_blockout (sin Blender).

    python docs/avatar/local/scripts/08_verify_cp001_blockout.py

Comprueba metadatos, integridad de proportions.json, renders y genera la lámina
de revisión con las etiquetas FRENTE / TRES CUARTOS.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageStat

AVATAR_DIR = Path(__file__).resolve().parents[2]
LOCAL_DIR = AVATAR_DIR / "local"
RENDERS = LOCAL_DIR / "checkpoints" / "renders"
META = LOCAL_DIR / "checkpoints" / "cp001_blockout.json"
PROPORTIONS = LOCAL_DIR / "config" / "proportions.json"

TILES = [
    ("cp001_blockout_front.png", "FRENTE"),
    ("cp001_blockout_threequarter.png", "TRES CUARTOS"),
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    meta = json.loads(META.read_text(encoding="utf-8"))
    print("CHECKPOINT")
    print(f"  checkpoint={meta['checkpoint']} modeling_started={meta['modeling_started']}")
    print(f"  body_modeled={meta['body_modeled']} clothing_modeled={meta['clothing_modeled']}")
    print(f"  profile_available={meta['profile']['available']} status={meta['profile']['status']}")
    print(f"  pixel_to_meter={meta['scale']['pixel_to_meter']:.8f}")
    print(f"  face_height_m={meta['scale']['face_height_m']}")
    print(f"  reference_plane_height_m={meta['scale']['reference_plane_height_m']:.4f}")

    actual = sha256(PROPORTIONS)
    print(f"  proportions_sha256_ok={actual == meta['proportions_sha256']}")

    tile = 480
    sheet = Image.new("RGB", (tile * 2, 520), (14, 17, 22))
    draw = ImageDraw.Draw(sheet)
    print("RENDERS")
    for index, (name, label) in enumerate(TILES):
        path = RENDERS / name
        with Image.open(path) as image:
            rgb = image.convert("RGB")
            center = rgb.crop((rgb.width // 4, rgb.height // 4,
                               3 * rgb.width // 4, 3 * rgb.height // 4))
            std = sum(ImageStat.Stat(center).stddev) / 3
            sheet.paste(rgb.resize((tile, tile)), (index * tile, 40))
        print(f"  {name}: size={rgb.size} centro_std={std:.1f}")
        draw.text((index * tile + 12, 12), label, fill=(232, 237, 244))

    sheet_path = RENDERS / "cp001_blockout_contact_sheet.png"
    sheet.save(sheet_path)
    print(f"CONTACT_SHEET {sheet_path}")


if __name__ == "__main__":
    main()
