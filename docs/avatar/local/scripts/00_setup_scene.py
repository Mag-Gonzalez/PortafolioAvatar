"""cp000 — escenario de referencia. NO crea geometría del avatar.

Uso:
  blender --background --python docs/avatar/local/scripts/00_setup_scene.py
"""
from __future__ import annotations

from math import radians
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C

SOURCES = {
    "REF_FRONT_5306": "IMG_5306_2048.jpg",
    "REF_3Q_4582": "IMG_4582_2048.jpg",
    "REF_PROFILE_4553": "IMG_4553_2048.jpg",
}

ROTATIONS = {
    "REF_FRONT_5306": (radians(90), 0.0, 0.0),
    "REF_3Q_4582": (radians(90), 0.0, radians(-35)),
    "REF_PROFILE_4553": (radians(90), 0.0, radians(-90)),
}

LOCATIONS = {
    "REF_FRONT_5306": (0.0, C.REFERENCE_OFFSET_M, 0.0),
    "REF_3Q_4582": (
        C.REFERENCE_OFFSET_M * 0.5736,
        C.REFERENCE_OFFSET_M * 0.8192,
        0.0,
    ),
    "REF_PROFILE_4553": (C.REFERENCE_OFFSET_M, 0.0, 0.0),
}


def main() -> None:
    C.ensure_dirs()
    C.setup_scene()

    proportions = C.load_proportions()
    height, height_source = C.reference_height(proportions)

    used_images = {}
    for name, filename in SOURCES.items():
        path = C.OPTIMIZED_DIR / filename
        if not path.exists():
            raise FileNotFoundError(f"Falta la referencia local: {path}")
        C.add_reference_plane(name, path, ROTATIONS[name], LOCATIONS[name], height)
        used_images[filename] = C.sha256(path)

    C.add_lights()
    C.setup_cameras()

    meta = {
        "checkpoint": "cp000_references",
        "purpose": "Solo escenario de referencia: cámaras, luces y planos de imagen. Sin geometría de avatar.",
        "modeling_started": False,
        "source_images": used_images,
        "reference_plane_height_m": round(height, 5),
        "reference_height_source": height_source,
        "proportions_available": proportions is not None,
        "head_height_target_m": C.HEAD_HEIGHT_M,
        "view_angles": {
            "front": "camara en -Y, rostro mirando -Y",
            "threequarter": "camara a -35 grados sobre el eje Z",
            "profile": "camara en -X (referencia de espejo, no perfil true)",
        },
        "privacy": {
            "uploaded_to_external_services": False,
            "generation_started": False,
        },
    }

    saved = C.save_checkpoint("cp000_references.blend", meta)
    renders = C.render_views("cp000")
    print(f"CHECKPOINT {saved}")
    for render in renders:
        print(f"RENDER {render}")
    print(f"REFERENCE_HEIGHT_M {height:.5f} ({height_source})")
    print(f"PROPORTIONS_AVAILABLE {proportions is not None}")


if __name__ == "__main__":
    main()
