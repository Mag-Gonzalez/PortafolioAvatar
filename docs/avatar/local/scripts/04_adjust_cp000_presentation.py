"""cp000_presentation — corrección presentacional del escenario de referencias.

No toma decisiones anatómicas: muestra la fotografía completa, iguala el marco
de las tres vistas y renombra la tercera a OBLICUA. No modifica imágenes,
posiciones de planos, rotaciones ni geometría (no hay geometría de avatar).

Uso:
  blender --background docs/avatar/local/checkpoints/cp000_references.blend \
    --python docs/avatar/local/scripts/04_adjust_cp000_presentation.py
"""
from __future__ import annotations

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy
from mathutils import Vector

import common as C

ORTHO_SCALE = 0.46  # plano de 0,40 m + margen; antes 0,34 recortaba la foto

PRESENTATION_CAMERAS = {
    "front": {
        "name": "CAM_FRONT",
        "location": Vector((0.0, -1.0, 0.0)),
        "reference": "REF_FRONT_5306",
    },
    "threequarter": {
        "name": "CAM_THREEQUARTER",
        "location": Vector((-0.7, -0.7, 0.0)),
        "reference": "REF_3Q_4582",
    },
    "oblique": {
        "name": "CAM_OBLIQUE",
        "location": Vector((-1.0, 0.0, 0.0)),
        "reference": "REF_OBLIQUE_4553",
    },
}


def rename_chain(old: str, new: str) -> None:
    obj = bpy.data.objects[old]
    obj.name = new
    if obj.data and hasattr(obj.data, "name"):
        obj.data.name = new
    for material in bpy.data.materials:
        if material.name == old.replace("REF_", "MAT_"):
            material.name = new.replace("REF_", "MAT_")


def main() -> None:
    meta = C.read_json(C.CHECKPOINTS_DIR / "cp000_references.json") or {}

    # 1) Renombrado semántico de la tercera vista. La foto no se transforma.
    rename_chain("CAM_PROFILE", "CAM_OBLIQUE")
    rename_chain("REF_PROFILE_4553", "REF_OBLIQUE_4553")

    # 2) Encuadre: mismo marco para las tres cámaras, sin lens shift.
    for spec in PRESENTATION_CAMERAS.values():
        camera = bpy.data.objects[spec["name"]].data
        camera.type = "ORTHO"
        camera.ortho_scale = ORTHO_SCALE
        camera.shift_x = 0.0
        camera.shift_y = 0.0

    for view_key, spec in PRESENTATION_CAMERAS.items():
        assert spec["name"] in bpy.data.objects, spec["name"]
        assert spec["reference"] in bpy.data.objects, spec["reference"]

    bpy.context.scene.camera = bpy.data.objects["CAM_FRONT"]

    meta.update({
        "checkpoint": "cp000_presentation",
        "based_on": "cp000_references.blend",
        "purpose": "Escenario de referencias con encuadre completo y tercera vista renombrada a OBLICUA. Sin geometría de avatar.",
        "modeling_started": False,
        "presentation": {
            "ortho_scale": ORTHO_SCALE,
            "previous_ortho_scale": 0.34,
            "reference_plane_height_m": 0.40,
            "lens_shift_x": 0.0,
            "lens_shift_y": 0.0,
            "note": "La escala del plano y del marco es solo presentación visual; no debe interpretarse como medida anatómica. Ninguna fotografía fue deformada, recortada o reencuadrada en su archivo.",
        },
        "views": {
            "front": {"image": "IMG_5306_2048.jpg", "role": "frontal"},
            "threequarter": {"image": "IMG_4582_2048.jpg", "role": "tres cuartos"},
            "oblique": {
                "image": "IMG_4553_2048.jpg",
                "role": "oblicua / referencia complementaria",
                "true_profile": False,
            },
        },
        "true_profile_available": False,
        "profile_landmarks_status": "pendientes de una vista de perfil real; no se inventan ni se usan para cp001",
    })
    meta["view_angles"] = {
        "front": "camara en -Y; foto frontal completa",
        "threequarter": "camara a -35 grados sobre el eje Z; foto completa",
        "oblique": "camara en -X; foto oblicua con espejo, NO perfil verdadero",
    }

    saved = C.save_checkpoint("cp000_presentation.blend", meta)
    renders = C.render_views("cp000_presentation", cameras=PRESENTATION_CAMERAS)
    print(f"CHECKPOINT {saved}")
    for render in renders:
        print(f"RENDER {render}")
    print(f"ORTHO_SCALE {bpy.data.objects['CAM_FRONT'].data.ortho_scale}")
    print(f"TRUE_PROFILE_AVAILABLE {meta['true_profile_available']}")


if __name__ == "__main__":
    main()
