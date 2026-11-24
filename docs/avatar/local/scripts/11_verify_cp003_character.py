"""Verificación local de cp003_character_v2 (sin Blender).

    python docs/avatar/local/scripts/11_verify_cp003_character.py

Genera la lámina de seis vistas y comprueba metadatos, renders y GLB.
"""
from __future__ import annotations

import hashlib
import json
import struct
from pathlib import Path

from PIL import Image, ImageDraw, ImageStat

AVATAR_DIR = Path(__file__).resolve().parents[2]
LOCAL_DIR = AVATAR_DIR / "local"
CHECKPOINTS = LOCAL_DIR / "checkpoints"
RENDERS = CHECKPOINTS / "renders"
EXPORTS = LOCAL_DIR / "exports"
META_PATH = CHECKPOINTS / "cp003_character_v2.json"
GLB_PATH = EXPORTS / "cp003_character_v2.glb"

TILES = [
    ("front", "FRONTAL"),
    ("left_profile", "PERFIL IZQ."),
    ("right_profile", "PERFIL DER."),
    ("three_quarter", "TRES CUARTOS"),
    ("back", "ESPALDA"),
    ("full", "COMPLETO"),
]


def glb_json(path: Path) -> dict:
    data = path.read_bytes()
    magic, version, length = struct.unpack_from("<4sII", data, 0)
    if magic != b"glTF":
        raise ValueError("ELF no es GLB")
    offset = 12
    while offset < length:
        chunk_len, chunk_type = struct.unpack_from("<II", data, offset)
        offset += 8
        if chunk_type == 0x4E4F534A:
            raw = data[offset:offset + chunk_len].rstrip(b" \x00").decode("utf-8")
            return json.loads(raw)
        offset += chunk_len
    raise ValueError("GLB sin chunk JSON")


def main() -> None:
    meta = json.loads(META_PATH.read_text(encoding="utf-8"))
    print("CHECKPOINT")
    print(f"  checkpoint={meta['checkpoint']}")
    print(f"  based_on={meta['based_on']}")
    print(f"  objects={meta['geometry']['objects']} meshes={meta['geometry']['meshes']}")
    print(f"  body={meta['geometry']['body_modeled']} clothing={meta['geometry']['clothing_modeled']}")
    print(f"  rig={meta['rig']['type']} bones={len(meta['rig']['bones'])}")
    print(f"  external_services={meta['privacy']['uploaded_to_external_services']}")

    print("RENDERS")
    tile_w, tile_h = 360, 540
    sheet = Image.new("RGB", (tile_w * 3, (tile_h + 34) * 2), (12, 16, 28))
    draw = ImageDraw.Draw(sheet)
    for index, (key, label) in enumerate(TILES):
        path = RENDERS / f"cp003_character_v2_{key}.png"
        with Image.open(path) as image:
            rgb = image.convert("RGB")
            center = rgb.crop((rgb.width // 4, rgb.height // 5,
                               3 * rgb.width // 4, 4 * rgb.height // 5))
            std = sum(ImageStat.Stat(center).stddev) / 3
            x = (index % 3) * tile_w
            y = (index // 3) * (tile_h + 34)
            sheet.paste(rgb.resize((tile_w, tile_h)), (x, y + 30))
            draw.text((x + 12, y + 9), label, fill=(230, 236, 245))
        print(f"  {key}: {rgb.size} centro_std={std:.1f}")

    sheet_path = RENDERS / "cp003_character_v2_contact_sheet.png"
    sheet.save(sheet_path)
    print(f"CONTACT_SHEET {sheet_path}")

    print("GLB")
    if not GLB_PATH.exists():
        print(f"  ERROR: no existe {GLB_PATH}")
        return
    data = GLB_PATH.read_bytes()
    print(f"  size={len(data)} bytes sha256={hashlib.sha256(data).hexdigest()[:16]}")
    doc = glb_json(GLB_PATH)
    print(f"  nodes={len(doc.get('nodes', []))} meshes={len(doc.get('meshes', []))}")
    print(f"  materials={len(doc.get('materials', []))} skins={len(doc.get('skins', []))}")
    print(f"  images={len(doc.get('images', []))} textures={len(doc.get('textures', []))}")
    print(f"  animations={len(doc.get('animations', []))}")
    if doc.get("images"):
        print("  ADVERTENCIA: el GLB contiene imágenes incrustadas")
    if not doc.get("skins"):
        print("  ADVERTENCIA: el GLB no contiene skins")


if __name__ == "__main__":
    main()
