"""Verificación por proyección de cámara de cp000_presentation (Blender).

    blender --background docs/avatar/local/checkpoints/cp000_presentation.blend \
      --python docs/avatar/local/scripts/06_verify_cp000_projection_presentation.py

Compara el render con la foto proyectada por la cámara guardada. Además confirma
que los tres marcos son iguales, que no hay lens shift y que la tercera vista
se llama OBLICUA.
"""
from __future__ import annotations

from pathlib import Path
import sys

import numpy as np
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy
import common as C

PAIRS = [
    ("CAM_FRONT", "REF_FRONT_5306", "cp000_presentation_front.png", "IMG_5306_2048.jpg"),
    ("CAM_THREEQUARTER", "REF_3Q_4582", "cp000_presentation_threequarter.png", "IMG_4582_2048.jpg"),
    ("CAM_OBLIQUE", "REF_OBLIQUE_4553", "cp000_presentation_oblique.png", "IMG_4553_2048.jpg"),
]


def pixels(image: bpy.types.Image) -> np.ndarray:
    size = image.size[0] * image.size[1] * image.channels
    return np.asarray(image.pixels[:size], dtype=np.float32).reshape(
        image.size[1], image.size[0], image.channels
    )


def luminance(rgb: np.ndarray) -> np.ndarray:
    return rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722


def main() -> None:
    scene = bpy.context.scene
    width = scene.render.resolution_x
    height = scene.render.resolution_y

    print(" CAMARAS")
    for camera_name, _, _, _ in PAIRS:
        camera = bpy.data.objects[camera_name].data
        print(f"  {camera_name}: ortho={camera.ortho_scale:.3f} "
              f"shift=({camera.shift_x:.3f},{camera.shift_y:.3f})")
    print(f"  CAM_PROFILE_existe={'CAM_PROFILE' in bpy.data.objects}")
    print(f"  REF_OBLIQUE_existe={'REF_OBLIQUE_4553' in bpy.data.objects}")

    for camera_name, plane_name, render_name, source_name in PAIRS:
        camera = bpy.data.objects[camera_name]
        plane = bpy.data.objects[plane_name]
        render = bpy.data.images.load(str(C.RENDERS_DIR / render_name), check_existing=True)
        source = bpy.data.images.load(str(C.OPTIMIZED_DIR / source_name), check_existing=True)
        render_px = pixels(render)
        source_px = pixels(source)

        render_values = []
        source_values = []
        steps = 60
        for i in range(steps + 1):
            u = -1.0 + 2.0 * i / steps
            for j in range(steps + 1):
                v = -1.0 + 2.0 * j / steps
                world = plane.matrix_world @ Vector((u, v, 0.0))
                ndc = world_to_camera_view(scene, camera, world)
                if ndc.z <= 0 or not (0 <= ndc.x <= 1 and 0 <= ndc.y <= 1):
                    continue
                px = min(width - 1, max(0, int(ndc.x * (width - 1))))
                py = min(height - 1, max(0, int(ndc.y * (height - 1))))
                sx = min(source.size[0] - 1, max(0, int((u + 1) / 2 * (source.size[0] - 1))))
                sy = min(source.size[1] - 1, max(0, int((v + 1) / 2 * (source.size[1] - 1))))
                render_values.append(luminance(render_px[py, px, :3]))
                source_values.append(luminance(source_px[sy, sx, :3]))

        a = np.asarray(render_values)
        b = np.asarray(source_values)
        print(f"  {render_name} <- {source_name}: muestras={len(a)} "
              f"correlacion={float(np.corrcoef(a, b)[0, 1]):.4f}")


if __name__ == "__main__":
    main()
