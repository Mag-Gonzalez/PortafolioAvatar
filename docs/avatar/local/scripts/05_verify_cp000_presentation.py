"""Lámina y comprobaciones locales de cp000_presentation (sin Blender).

    python docs/avatar/local/scripts/05_verify_cp000_presentation.py

Genera `cp000_presentation_contact_sheet.png` con etiquetas FRENTE /
TRES CUARTOS / OBLICUA y verifica que cada tile coincida con su render, que
originales y `prepared/` sigan intactos y que las banderas de privacidad no
hayan cambiado.
"""
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps, ImageStat

AVATAR_DIR = Path(__file__).resolve().parents[2]
LOCAL_DIR = AVATAR_DIR / "local"
RENDERS = LOCAL_DIR / "checkpoints" / "renders"
OPTIMIZED = AVATAR_DIR / "prepared" / "optimized"
MANIFEST = AVATAR_DIR / "manifest.json"
META = LOCAL_DIR / "checkpoints" / "cp000_presentation.json"

PAIRS = [
    ("cp000_presentation_front.png", "IMG_5306_2048.jpg", "FRENTE"),
    ("cp000_presentation_threequarter.png", "IMG_4582_2048.jpg", "TRES CUARTOS"),
    ("cp000_presentation_oblique.png", "IMG_4553_2048.jpg", "OBLICUA"),
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def gray_vector(image: Image.Image, size: int = 64) -> list[int]:
    return list(ImageOps.grayscale(image).resize((size, size)).tobytes())


def pearson(a: list[int], b: list[int]) -> float:
    n = len(a)
    ma = sum(a) / n
    mb = sum(b) / n
    num = sum((x - ma) * (y - mb) for x, y in zip(a, b))
    da = sum((x - ma) ** 2 for x in a)
    db = sum((y - mb) ** 2 for y in b)
    return num / math.sqrt(da * db) if da and db else 0.0


def main() -> None:
    tile = 480
    sheet = Image.new("RGB", (tile * 3, 520), (14, 17, 22))
    draw = ImageDraw.Draw(sheet)
    for index, (render_name, _, label) in enumerate(PAIRS):
        with Image.open(RENDERS / render_name) as image:
            sheet.paste(image.convert("RGB").resize((tile, tile)), (index * tile, 40))
        draw.text((index * tile + 12, 12), label, fill=(232, 237, 244))
    sheet_path = RENDERS / "cp000_presentation_contact_sheet.png"
    sheet.save(sheet_path)
    print(f"CONTACT_SHEET {sheet_path}")

    print("\nRENDERS Y LAMINA")
    for index, (render_name, _, label) in enumerate(PAIRS):
        with Image.open(RENDERS / render_name) as image:
            rgb = image.convert("RGB")
            center_std = sum(ImageStat.Stat(
                rgb.crop((rgb.width // 4, rgb.height // 4,
                          3 * rgb.width // 4, 3 * rgb.height // 4))
            ).stddev) / 3
        tile_correlation = pearson(
            gray_vector(sheet.crop((index * tile, 40, (index + 1) * tile, 520))),
            gray_vector(rgb),
        )
        print(f"  {label}: centro_std={center_std:.1f} tile_vs_render={tile_correlation:.4f}")

    meta = json.loads(META.read_text(encoding="utf-8"))
    print("\nCHECKPOINT")
    print(f"  checkpoint={meta['checkpoint']} modeling_started={meta['modeling_started']}")
    print(f"  true_profile_available={meta['true_profile_available']} "
          f"ortho_scale={meta['presentation']['ortho_scale']}")

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    expected_source = manifest["originals"]["final_sha256"]
    expected_prepared = {
        item["source_name"]: item["optimized_2048"]["sha256"]
        for item in manifest["photos"]
    }
    source_dir = Path(manifest["originals"]["directory"])

    print("\nINTEGRIDAD")
    for name, expected in expected_source.items():
        print(f"  original {name}: {'OK' if sha256(source_dir / name) == expected else 'CAMBIADO'}")
    for source_name, expected in expected_prepared.items():
        prepared_name = source_name.replace(".jpeg", "_2048.jpg")
        print(f"  prepared {prepared_name}: {'OK' if sha256(OPTIMIZED / prepared_name) == expected else 'CAMBIADO'}")
    privacy = manifest["privacy"]
    print(f"  privacy: upload={privacy['uploaded_to_external_services']} "
          f"generation={privacy['generation_started']} "
          f"platform={privacy['platform_selected']}")


if __name__ == "__main__":
    main()
