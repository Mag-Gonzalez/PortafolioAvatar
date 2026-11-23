"""Utilidades compartidas del flujo local de avatar.

Todas las rutas se resuelven desde este archivo. Este módulo solo lee imágenes de
``prepared/optimized`` y escribe dentro de ``docs/avatar/local``.
"""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from math import radians
from pathlib import Path

import bpy
from mathutils import Vector

SCRIPTS_DIR = Path(__file__).resolve().parent
LOCAL_DIR = SCRIPTS_DIR.parent
AVATAR_DIR = LOCAL_DIR.parent
OPTIMIZED_DIR = AVATAR_DIR / "prepared" / "optimized"
CONFIG_DIR = LOCAL_DIR / "config"
CHECKPOINTS_DIR = LOCAL_DIR / "checkpoints"
RENDERS_DIR = CHECKPOINTS_DIR / "renders"
EXPORTS_DIR = LOCAL_DIR / "exports"

# Escala de trabajo, en metros (Blender usa metros por defecto).
HEAD_HEIGHT_M = 0.22
FACE_HEIGHT_M = 0.17
DEFAULT_REFERENCE_HEIGHT_M = 0.40
REFERENCE_OFFSET_M = 0.12

# Cada vista tiene una cámara y un plano de referencia que le corresponde.
CAMERAS = {
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
    "profile": {
        "name": "CAM_PROFILE",
        "location": Vector((-1.0, 0.0, 0.0)),
        "reference": "REF_PROFILE_4553",
    },
}


def ensure_dirs() -> None:
    for path in (CONFIG_DIR, CHECKPOINTS_DIR, RENDERS_DIR, EXPORTS_DIR):
        path.mkdir(parents=True, exist_ok=True)


def read_json(path: Path) -> dict | None:
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_proportions() -> dict | None:
    """Devuelve proportions.json, o None si el usuario aún no lo ha generado."""
    return read_json(CONFIG_DIR / "proportions.json")


def reference_height(proportions: dict | None) -> tuple[float, str]:
    """Altura del plano de referencia en metros.

    Si el picker ya entregó ``linea_cabello_centro`` y ``menton``, se calcula la
    altura de imagen que hace que esa distancia mida FACE_HEIGHT_M. Si no, se usa
    un valor por defecto y se documenta el motivo.
    """
    if proportions:
        front = proportions.get("views", {}).get("front", {})
        points = front.get("points", {})
        size = front.get("image_size") or []
        hairline = points.get("linea_cabello_centro")
        chin = points.get("menton")
        if hairline and chin and len(size) == 2 and size[1] > 0:
            pixel_distance = abs(float(chin[1]) - float(hairline[1]))
            if pixel_distance > 1.0:
                height = FACE_HEIGHT_M * float(size[1]) / pixel_distance
                height = max(0.20, min(1.20, height))
                return height, "calculado desde proportions.json (linea_cabello_centro -> menton)"
    return DEFAULT_REFERENCE_HEIGHT_M, "valor por defecto; pendiente de proportions.json"


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def setup_scene() -> None:
    """Escena base: sin geometría de avatar, solo referencias, cámaras y luces."""
    clear_scene()
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 960
    scene.render.resolution_y = 960
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "AgX"
    world = bpy.data.worlds.new("WORLD_NEUTRAL")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.05, 0.055, 0.065, 1.0)
        bg.inputs["Strength"].default_value = 0.6
    scene.world = world


def build_emission_nodes(material: bpy.types.Material, image: bpy.types.Image) -> None:
    """Deja una única salida activa: imagen -> emisión -> superficie.

    Blender 5.3 crea los materiales con un Principled BSDF y un Output ya
    conectados. Si se añade otro Output sin limpiar, el activo sigue siendo el
    Principled (blanco) y la textura queda en una salida inactiva: el render
    sale gris claro aunque la imagen esté cargada. Por eso se limpia el árbol.
    """
    nodes = material.node_tree.nodes
    nodes.clear()
    links = material.node_tree.links
    material.surface_render_method = "DITHERED"
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = image
    tex.interpolation = "Linear"
    emission = nodes.new("ShaderNodeEmission")
    emission.inputs["Strength"].default_value = 1.0
    output = nodes.new("ShaderNodeOutputMaterial")
    output.is_active_output = True
    links.new(tex.outputs["Color"], emission.inputs["Color"])
    links.new(emission.outputs["Emission"], output.inputs["Surface"])


def _emission_material(name: str, image: bpy.types.Image) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    build_emission_nodes(material, image)
    return material


def add_reference_plane(
    name: str,
    image_path: Path,
    rotation: tuple[float, float, float],
    location: tuple[float, float, float],
    height_m: float,
) -> bpy.types.Object:
    """Plano con textura de imagen, usado solo como referencia visual."""
    if not image_path.exists():
        raise FileNotFoundError(image_path)
    image = bpy.data.images.load(str(image_path), check_existing=True)
    width_m = height_m * (image.size[0] / image.size[1])

    bpy.ops.mesh.primitive_plane_add(size=2.0, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = (width_m / 2.0, height_m / 2.0, 1.0)
    obj["is_reference"] = True
    obj["source_image"] = image_path.name
    obj["source_sha256"] = sha256(image_path)

    mesh = obj.data
    if not mesh.uv_layers:
        mesh.uv_layers.new(name="UVMap")
    uv = mesh.uv_layers.active.data
    for polygon in mesh.polygons:
        for loop_index in polygon.loop_indices:
            vertex = mesh.vertices[mesh.loops[loop_index].vertex_index].co
            uv[loop_index].uv = ((vertex.x + 1.0) / 2.0, (vertex.y + 1.0) / 2.0)

    obj.data.materials.append(_emission_material(f"MAT_{name}", image))
    return obj


def add_camera(name: str, location: Vector, target: Vector, ortho_scale: float) -> bpy.types.Object:
    data = bpy.data.cameras.new(name)
    data.type = "ORTHO"
    data.ortho_scale = ortho_scale
    data.lens = 50.0
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (target - location).to_track_quat("-Z", "Y").to_euler()
    return obj


def add_lights() -> None:
    '''Luces suaves y fijas para todos los checkpoints (aún sin geometría).'''
    specs = (
        ("LIGHT_KEY", (-0.8, -1.0, 1.2), 260.0, 1.2),
        ("LIGHT_FILL", (1.0, -0.6, 0.7), 140.0, 1.4),
        ("LIGHT_RIM", (0.4, 1.1, 1.0), 200.0, 0.9),
    )
    for name, location, energy, size in specs:
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.shape = "DISK"
        data.size = size
        obj = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(obj)
        obj.location = location
        obj.rotation_euler = (Vector((0.0, 0.0, 0.0)) - obj.location).to_track_quat("-Z", "Y").to_euler()


def setup_cameras() -> None:
    target = Vector((0.0, 0.0, 0.0))
    for spec in CAMERAS.values():
        add_camera(spec["name"], spec["location"], target, 0.34)
    bpy.context.scene.camera = bpy.data.objects[CAMERAS["front"]["name"]]


def save_checkpoint(filename: str, meta: dict) -> Path:
    ensure_dirs()
    path = CHECKPOINTS_DIR / filename
    payload = dict(meta)
    payload["saved_at_utc"] = utc_now()
    payload["blender_version"] = bpy.app.version_string
    write_json(path.with_suffix(".json"), payload)
    bpy.ops.wm.save_as_mainfile(filepath=str(path))
    return path


def render_views(prefix: str, cameras: dict | None = None) -> list[Path]:
    """Un render por cámara, mostrando solo el plano de referencia correspondiente.

    ``cameras`` permite renderizar un checkpoint corregido sin alterar el mapa
    histórico ``CAMERAS`` usado por cp000.
    """
    ensure_dirs()
    scene = bpy.context.scene
    references = [obj for obj in bpy.data.objects if obj.get("is_reference")]
    outputs: list[Path] = []
    for view_key, spec in (cameras or CAMERAS).items():
        for obj in references:
            obj.hide_render = obj.name != spec["reference"]
        scene.camera = bpy.data.objects[spec["name"]]
        path = RENDERS_DIR / f"{prefix}_{view_key}.png"
        scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        outputs.append(path)
    for obj in references:
        obj.hide_render = False
    return outputs
