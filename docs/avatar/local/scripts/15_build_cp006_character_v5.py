"""cp006_character_v5 — Ajuste de mandíbula/cuello y GLB sin advertencias de parentesco.

Base: cp005_character_v4. Conserva armature, Idle_Animation, cámaras y materiales.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import bpy

CHECKPOINT = "cp006_character_v5"
BASE_DIR = Path(__file__).resolve().parents[2]
LOCAL_DIR = BASE_DIR / "local"
CHECKPOINTS_DIR = LOCAL_DIR / "checkpoints"
RENDERS_DIR = CHECKPOINTS_DIR / "renders"
EXPORTS_DIR = LOCAL_DIR / "exports"
PUBLIC_ASSETS_DIR = BASE_DIR.parents[1] / "public" / "assets" / "avatar"
ATLAS_V2 = LOCAL_DIR / "references" / "turnaround" / "character_texture_atlas_v2.png"

INPUT_BLEND = CHECKPOINTS_DIR / f"{CHECKPOINT}.blend"


def swap_atlas():
    if not ATLAS_V2.exists():
        raise RuntimeError(f"Falta atlas corregido: {ATLAS_V2}")
    mat = bpy.data.materials.get("MAT_Avatar_Atlas")
    if mat is None:
        raise RuntimeError("Falta MAT_Avatar_Atlas")
    img = bpy.data.images.load(str(ATLAS_V2), check_existing=True)
    for node in mat.node_tree.nodes:
        if node.type == "TEX_IMAGE":
            node.image = img
            print("ATLAS SWAPPED", node.image.filepath, flush=True)
            return
    raise RuntimeError("No se encontró el nodo de textura del atlas")


def refine_shape():
    obj = bpy.data.objects.get("UpperBody")
    if obj is None or obj.type != "MESH":
        raise RuntimeError("UpperBody no encontrado")

    for v in obj.data.vertices:
        x, y, z = v.co

        # Mandíbula y parte baja del rostro: más anchas que en cp005.
        if 1.355 <= z <= 1.485:
            t = (z - 1.355) / (1.485 - 1.355)
            weight = 1.0 - abs(2.0 * t - 1.0)
            x *= 1.0 + 0.085 * weight
            y *= 1.0 + 0.035 * weight

        # Cuello y unión con clavículas: más estrechos.
        if 1.175 <= z <= 1.345:
            t = (z - 1.175) / (1.345 - 1.175)
            weight = 1.0 - abs(2.0 * t - 1.0)
            x *= 1.0 - 0.125 * weight
            y *= 1.0 - 0.085 * weight

        v.co = (x, y, z)

    obj.data.update()
    print("SHAPE REFINED", flush=True)


def parent_skinned_meshes():
    arm = bpy.data.objects.get("Armature")
    if arm is None:
        raise RuntimeError("Armature no encontrado")
    count = 0
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        has_armature = any(m.type == "ARMATURE" for m in obj.modifiers)
        if not has_armature:
            continue
        obj.parent = arm
        obj.matrix_parent_inverse = arm.matrix_world.inverted()
        count += 1
    print("PARENTED SKINNED MESHES", count, flush=True)


def verify():
    arm = bpy.data.objects.get("Armature")
    if not arm or not arm.animation_data or not arm.animation_data.action:
        raise RuntimeError("Se perdió armature o Idle_Animation")
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    print("VERIFY", len(meshes), "meshes", len(arm.data.bones), "bones",
          arm.animation_data.action.name, flush=True)


def render_all():
    scene = bpy.context.scene
    scene.render.resolution_x = 960
    scene.render.resolution_y = 960
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    names = ["front", "left_profile", "right_profile", "three_quarter", "back", "full"]
    renders = {}
    for name in names:
        cam = bpy.data.objects.get(f"Cam_{name}")
        if cam is None:
            raise RuntimeError(f"Falta Cam_{name}")
        scene.camera = cam
        path = RENDERS_DIR / f"{CHECKPOINT}_{name}.png"
        scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        renders[name] = path
        print("RENDER OK", path, flush=True)
    return renders


def export_and_copy():
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    glb = EXPORTS_DIR / f"{CHECKPOINT}.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(glb),
        export_format="GLB",
        use_selection=False,
        export_apply=False,
        export_yup=True,
        export_animations=True,
        export_skins=True,
        export_morph=True,
        export_materials="EXPORT",
    )
    public_glb = PUBLIC_ASSETS_DIR / "avatar.glb"
    shutil.copy2(glb, public_glb)
    print("GLB OK", glb, public_glb, flush=True)
    return glb, public_glb


def write_metadata(renders, glb, public_glb):
    meta = {
        "checkpoint": CHECKPOINT,
        "base": "cp005_character_v4",
        "reference_source": "docs/avatar/source/avatar_complete.jpg",
        "changes": [
            "Mandíbula y rostro bajo ensanchados para acercarse al perfil de la referencia.",
            "Cuello y clavículas estrechados.",
            "Atlas de piel ajustado en copia local (más cálido, menos azul).",
            "Mallas skinneadas parentadas al armature para eliminar advertencias de glTF.",
        ],
        "preserved": [
            "Armature de 14 huesos y acción Idle_Animation",
            "Ausencia de gafas, collar y plataforma decidida en cp005",
            "Cámaras y luces de revisión",
        ],
        "blend_file": str(CHECKPOINTS_DIR / f"{CHECKPOINT}.blend"),
        "glb_file": str(glb),
        "public_glb": str(public_glb),
        "renders": {k: str(v) for k, v in renders.items()},
        "privacy": "El atlas v2 es una copia local derivada; no se subió a ningún servicio.",
    }
    path = CHECKPOINTS_DIR / f"{CHECKPOINT}.json"
    path.write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
    print("META OK", path, flush=True)


def main():
    if not INPUT_BLEND.exists():
        raise RuntimeError(f"No existe checkpoint base: {INPUT_BLEND}")
    bpy.ops.wm.open_mainfile(filepath=str(INPUT_BLEND))
    swap_atlas()
    refine_shape()
    parent_skinned_meshes()
    verify()
    renders = render_all()
    blend_path = CHECKPOINTS_DIR / f"{CHECKPOINT}.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    print("BLEND OK", blend_path, flush=True)
    glb, public_glb = export_and_copy()
    write_metadata(renders, glb, public_glb)
    print(f"--- {CHECKPOINT} completado ---", flush=True)


if __name__ == "__main__":
    main()
