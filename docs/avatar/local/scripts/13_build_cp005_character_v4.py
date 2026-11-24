"""cp005_character_v4 — Refinamiento conservador sobre cp004_character_v3.

Parte del checkpoint funcional de Antigravity y mantiene:
- malla UV de 4 cuadrantes
- armature de 14 huesos
- acción Idle_Animation
- cámaras y luces de revisión

Cambios de esta iteración:
- eliminar gafas, collar de cuentas y plataforma cian (no verificables en la referencia)
- estrechar el cuello y ajustar levemente el vuelo de la mandíbula
- reducir el lavado de la iluminación de revisión y aumentar el roughness de la piel
- conservar piernas/calzado neutros porque la referencia está recortada por la cintura
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import bpy

CHECKPOINT = "cp005_character_v4"
BASE_DIR = Path(__file__).resolve().parents[2]
LOCAL_DIR = BASE_DIR / "local"
CHECKPOINTS_DIR = LOCAL_DIR / "checkpoints"
RENDERS_DIR = CHECKPOINTS_DIR / "renders"
EXPORTS_DIR = LOCAL_DIR / "exports"
PUBLIC_ASSETS_DIR = BASE_DIR.parents[1] / "public" / "assets" / "avatar"

INPUT_BLEND = CHECKPOINTS_DIR / f"{CHECKPOINT}.blend"


def clean_unverified_accessories():
    removed = []
    prefixes = (
        "Lens_", "Frame_Top_", "Temple_", "Glasses_Bridge",
        "Bead_", "Pedestal",
    )
    for obj in list(bpy.data.objects):
        if obj.name.startswith(prefixes):
            removed.append(obj.name)
            bpy.data.objects.remove(obj, do_unlink=True)
    print("REMOVED", removed, flush=True)
    return removed


def refine_upper_body():
    obj = bpy.data.objects.get("UpperBody")
    if obj is None or obj.type != "MESH":
        raise RuntimeError("UpperBody no encontrado en el checkpoint base")

    for v in obj.data.vertices:
        x, y, z = v.co

        # Cuello ligeramente más estrecho: la referencia no tiene el cuello tan ancho.
        if 1.235 <= z <= 1.375:
            t = (z - 1.235) / (1.375 - 1.235)
            # peso máximo en el centro del cuello, cero en los extremos
            weight = 1.0 - abs(2.0 * t - 1.0)
            factor = 1.0 - 0.115 * weight
            x *= factor
            y *= factor

        # Sienes un poco más anchas y mandíbula menos cuadrada.
        if 1.455 <= z <= 1.640:
            t = (z - 1.455) / (1.640 - 1.455)
            x *= 1.0 + 0.035 * t
            y *= 1.0 + 0.020 * t
        elif 1.360 <= z < 1.455:
            t = (1.455 - z) / (1.455 - 1.360)
            x *= 1.0 - 0.025 * t

        v.co = (x, y, z)

    obj.data.update()
    print("UPPERBODY REFINED", len(obj.data.vertices), "verts", flush=True)


def tune_materials_and_lighting():
    skin = bpy.data.materials.get("MAT_Avatar_Atlas")
    if skin:
        bsdf = skin.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Roughness"].default_value = 0.68
            if "Subsurface Weight" in bsdf.inputs:
                bsdf.inputs["Subsurface Weight"].default_value = 0.035
            if "Specular IOR Level" in bsdf.inputs:
                bsdf.inputs["Specular IOR Level"].default_value = 0.28

    # Pantalón y calzado neutros: no hay evidencia de jeans índigo ni zapatos visibles.
    for mat_name, rgb in [
        ("MAT_Jeans", (0.085, 0.080, 0.095, 1.0)),
        ("MAT_Shoes", (0.045, 0.045, 0.055, 1.0)),
    ]:
        mat = bpy.data.materials.get(mat_name)
        if mat:
            bsdf = mat.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                bsdf.inputs["Base Color"].default_value = rgb
                bsdf.inputs["Roughness"].default_value = 0.82

    # Iluminación de revisión más cercana al azul profundo de la referencia.
    scene = bpy.context.scene
    if scene.world:
        bg = scene.world.node_tree.nodes.get("Background")
        if bg:
            bg.inputs["Color"].default_value = (0.002, 0.020, 0.150, 1.0)
            bg.inputs["Strength"].default_value = 0.82

    energies = {
        "Key_Light": 105.0,
        "Fill_Light": 58.0,
        "Rim_Light_Back": 120.0,
        "Under_Glow_Cyan": 32.0,
    }
    for name, energy in energies.items():
        light_obj = bpy.data.objects.get(name)
        if light_obj and light_obj.data:
            light_obj.data.energy = energy

    print("MATERIALS AND LIGHTING TUNED", flush=True)


def verify_preserved():
    arm = bpy.data.objects.get("Armature")
    if arm is None:
        raise RuntimeError("Se perdió el armature")
    if not arm.animation_data or not arm.animation_data.action:
        raise RuntimeError("Se perdió Idle_Animation")
    print("PRESERVED", arm.name, len(arm.data.bones), "bones",
          arm.animation_data.action.name, flush=True)


def render_all():
    scene = bpy.context.scene
    scene.render.resolution_x = 960
    scene.render.resolution_y = 960
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    RENDERS_DIR.mkdir(parents=True, exist_ok=True)

    names = [
        "front", "left_profile", "right_profile",
        "three_quarter", "back", "full",
    ]
    renders = {}
    for name in names:
        cam = bpy.data.objects.get(f"Cam_{name}")
        if cam is None:
            raise RuntimeError(f"Falta cámara Cam_{name}")
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


def write_metadata(removed, renders, glb, public_glb):
    meta = {
        "checkpoint": CHECKPOINT,
        "base": "cp004_character_v3",
        "reference_source": "docs/avatar/source/avatar_complete.jpg",
        "changes": [
            "Eliminadas gafas, lentes, varillas y puente: no hay marco visible verificable en la referencia y en cp004 tapaban los ojos.",
            "Eliminado collar de perlas/cuentas: no aparece en el canal de piel del pecho.",
            "Eliminada plataforma cian: la referencia no muestra pedestal.",
            "Cuello estrechado y sienes/mandíbula ajustados según perfiles de silueta.",
            "Iluminación de revisión y roughness de piel ajustados para reducir el lavado facial.",
            "Jeans y calzado convertidos a neutros oscuros; la referencia está recortada por la cintura.",
        ],
        "preserved": [
            "Malla UpperBody UV 4 cuadrantes",
            "Armature de 14 huesos",
            "Acción Idle_Animation",
            "Cámaras frontal, perfiles, tres cuartos, espalda y completo",
            "Cejas y material de cabello",
        ],
        "removed_objects": removed,
        "blend_file": str(CHECKPOINTS_DIR / f"{CHECKPOINT}.blend"),
        "glb_file": str(glb),
        "public_glb": str(public_glb),
        "renders": {k: str(v) for k, v in renders.items()},
        "privacy": "La referencia no se subió a ningún servicio; el atlas ya embebido por Antigravity se conserva tal cual.",
    }
    path = CHECKPOINTS_DIR / f"{CHECKPOINT}.json"
    path.write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
    print("META OK", path, flush=True)


def main():
    if not INPUT_BLEND.exists():
        raise RuntimeError(f"No existe el checkpoint base copiado: {INPUT_BLEND}")
    bpy.ops.wm.open_mainfile(filepath=str(INPUT_BLEND))

    removed = clean_unverified_accessories()
    refine_upper_body()
    tune_materials_and_lighting()
    verify_preserved()

    renders = render_all()

    blend_path = CHECKPOINTS_DIR / f"{CHECKPOINT}.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    print("BLEND OK", blend_path, flush=True)

    glb, public_glb = export_and_copy()
    write_metadata(removed, renders, glb, public_glb)
    print(f"--- {CHECKPOINT} completado ---", flush=True)


if __name__ == "__main__":
    main()
