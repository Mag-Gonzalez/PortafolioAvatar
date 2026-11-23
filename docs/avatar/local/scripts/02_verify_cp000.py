"""Verificación local de cp000 tras la reparación de materiales.

Se ejecuta con el Python del sistema (solo Pillow):

    python docs/avatar/local/scripts/02_verify_cp000.py

Regenera la lámina de contacto y comprueba, sin inferir de tamaños de archivo:
que cada render tenga estructura de imagen, que se parezca a su foto de
origen, y que originales, copias preparadas y banderas de privacidad sigan
intactas.
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

PAIRS = [
    ("cp000_front.png", "IMG_5306_2048.jpg", "FRENTE"),
    ("cp000_threequarter.png", "IMG_4582_2048.jpg", "TRES CUARTOS"),
    ("cp000_profile.png", "IMG_4553_2048.jpg", "PERFIL"),
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
    # Lámina de contacto, con el mismo diseño que la original.
    tile = 480
    sheet = Image.new("RGB", (tile * 3, 520), (14, 17, 22))
    draw = ImageDraw.Draw(sheet)
    for index, (render_name, _, label) in enumerate(PAIRS):
        with Image.open(RENDERS / render_name) as image:
            sheet.paste(image.convert("RGB").resize((tile, tile)), (index * tile, 40))
        draw.text((index * tile + 12, 12), label, fill=(232, 237, 244))
    sheet_path = RENDERS / "cp000_contact_sheet.png"
    sheet.save(sheet_path)

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    expected_source = manifest["originals"]["final_sha256"]
    expected_prepared = {
        item["source_name"]: item["optimized_2048"]["sha256"]
        for item in manifest["photos"]
    }
    source_dir = Path(manifest["originals"]["directory"])

    print(f"CONTACT_SHEET {sheet_path}")
    print("\nRENDERS")
    for render_name, source_name, _ in PAIRS:
        with Image.open(RENDERS / render_name) as render:
            rgb = render.convert("RGB")
            stat = ImageStat.Stat(rgb)
            center = rgb.crop((rgb.width // 4, rgb.height // 4,
                               3 * rgb.width // 4, 3 * rgb.height // 4))
            center_std = sum(ImageStat.Stat(center).stddev) / 3
            render_vector = gray_vector(center)
        with Image.open(OPTIMIZED / source_name) as source:
            candidates = [source]
            w, h = source.size
            for fraction in (0.90, 0.80, 0.70):
                candidates.append(source.crop((int(w * (1 - fraction) / 2),
                                               int(h * (1 - fraction) / 2),
                                               int(w * (1 + fraction) / 2),
                                               int(h * (1 + fraction) / 2))))
            correlation = max(pearson(render_vector, gray_vector(candidate))
                              for candidate in candidates)
        print(f"  {render_name}: centro_std={center_std:.1f} "
              f"correlacion_max={correlation:.3f} vs {source_name}")

    print("\nINTEGRIDAD")
    for name, expected in expected_source.items():
        actual = sha256(source_dir / name)
        print(f"  original {name}: {'OK' if actual == expected else 'CAMBIADO'}")
    for source_name, expected in expected_prepared.items():
        prepared_name = source_name.replace(".jpeg", "_2048.jpg")
        actual = sha256(OPTIMIZED / prepared_name)
        print(f"  prepared {prepared_name}: {'OK' if actual == expected else 'CAMBIADO'}")
    privacy = manifest["privacy"]
    print(f"  privacy: upload={privacy['uploaded_to_external_services']} "
          f"generation={privacy['generation_started']} "
          f"platform={privacy['platform_selected']}")


if __name__ == "__main__":
    main()
