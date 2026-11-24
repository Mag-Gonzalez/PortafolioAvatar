"""cp003_character_v2 — reconstrucción 3D del personaje de avatar_complete.jpg.

Este checkpoint NO parte de cp001_blockout: ese diseño quedó descartado.
Se crea desde cero usando únicamente la composición de seis vistas de
``docs/avatar/source/avatar_complete.jpg`` y los recortes no destructivos de
``docs/avatar/local/references/turnaround/``.

Lo que se considera respaldado por las referencias:
- paleta: piel cálida, cabello muy oscuro, ojos azules, prenda gris oscura;
- silueta de cabeza voluminosa, rostro ovalado, cuello y hombros;
- brazos y manos desnudos a los lados del torso;
- vista frontal y laterales coherentes entre sí.

Lo que se marca como inferido:
- longitud y forma de las piernas y pies (la referencia está recortada a la cintura);
- profundidad exacta de rasgos faciales (no hay的测量 de perfil, solo píxeles);
- Individual clumps de cabello y detalles menores de la prenda.

Uso:
  blender --background --python docs/avatar/local/scripts/10_build_cp003_character_v2.py
"""
from __future__ import annotations

import math
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy
from mathutils import Vector

import common as C

CHECKPOINT = "cp003_character_v2"
SEGMENTS = 32

# ---------------------------------------------------------------------------
# Utilidades de geometría
# ---------------------------------------------------------------------------

def collection(name: str) -> bpy.types.Collection:
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    return col


def link_to(obj: bpy.types.Object, col: bpy.types.Collection) -> None:
    for old in list(obj.users_collection):
        old.objects.unlink(obj)
    col.objects.link(obj)


def material(name: str, rgb: tuple[float, float, float], roughness: float = 0.65,
             metallic: float = 0.0) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.diffuse_color = (*rgb, 1.0)
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return mat


def mesh_object(name: str, vertices, faces, mat: bpy.types.Material,
                col: bpy.types.Collection, smooth: bool = True) -> bpy.types.Object:
    mesh = bpy.data.meshes.new(name + "_MESH")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)
    obj.data.materials.append(mat)
    if smooth:
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
    return obj


def loft(name: str, rings, mat: bpy.types.Material, col: bpy.types.Collection,
         segments: int = SEGMENTS) -> bpy.types.Object:
    """rings: (z, rx, ry, cx, cy). Genera un volumen cerrado y suave."""
    verts = []
    for z, rx, ry, cx, cy in rings:
        for i in range(segments):
            a = 2.0 * math.pi * i / segments
            verts.append((cx + rx * math.cos(a), cy + ry * math.sin(a), z))
    faces = []
    for r in range(len(rings) - 1):
        for i in range(segments):
            j = (i + 1) % segments
            faces.append((r * segments + i, r * segments + j,
                          (r + 1) * segments + j, (r + 1) * segments + i))
    faces.append(tuple(reversed(range(segments))))
    last = (len(rings) - 1) * segments
    faces.append(tuple(last + i for i in range(segments)))
    return mesh_object(name, verts, faces, mat, col)


def tube(name: str, p0, p1, r0: float, r1: float, mat: bpy.types.Material,
         col: bpy.types.Collection, steps: int = 5, segments: int = 20) -> bpy.types.Object:
    a, b = Vector(p0), Vector(p1)
    axis = (b - a).normalized()
    helper = Vector((0.0, 0.0, 1.0)) if abs(axis.z) < 0.9 else Vector((0.0, 1.0, 0.0))
    u = axis.cross(helper).normalized()
    v = axis.cross(u).normalized()
    verts = []
    for s in range(steps):
        t = s / (steps - 1)
        center = a.lerp(b, t)
        radius = r0 + (r1 - r0) * t
        for i in range(segments):
            ang = 2.0 * math.pi * i / segments
            verts.append(tuple(center + radius * (math.cos(ang) * u + math.sin(ang) * v)))
    faces = []
    for s in range(steps - 1):
        for i in range(segments):
            j = (i + 1) % segments
            faces.append((s * segments + i, s * segments + j,
                          (s + 1) * segments + j, (s + 1) * segments + i))
    faces.append(tuple(reversed(range(segments))))
    last = (steps - 1) * segments
    faces.append(tuple(last + i for i in range(segments)))
    return mesh_object(name, verts, faces, mat, col)


def ellipsoid(name: str, loc, scale, mat: bpy.types.Material,
              col: bpy.types.Collection, rotation=None) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=14, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.data.name = name + "_MESH"
    obj.scale = scale
    if rotation is not None:
        obj.rotation_euler = rotation
    link_to(obj, col)
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def curve_line(name: str, points, mat: bpy.types.Material, col: bpy.types.Collection,
               bevel: float = 0.0025) -> bpy.types.Object:
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = bevel
    curve.bevel_resolution = 2
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for i, p in enumerate(points):
        spline.points[i].co = (*p, 1.0)
    obj = bpy.data.objects.new(name, curve)
    col.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


def tag(obj: bpy.types.Object, part: str, confidence: str) -> bpy.types.Object:
    obj["body_part"] = part
    obj["source_confidence"] = confidence
    return obj


# ---------------------------------------------------------------------------
# Escena base
# ---------------------------------------------------------------------------

def reset_scene() -> tuple[bpy.types.Collection, ...]:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for data in (bpy.data.meshes, bpy.data.curves, bpy.data.armatures, bpy.data.materials):
        for block in list(data):
            if block.users == 0:
                data.remove(block)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 720
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.world.color = (0.025, 0.040, 0.115)
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.render.image_settings.color_mode = "RGBA"
    return (
        collection("CHARACTER_HEAD"),
        collection("CHARACTER_BODY"),
        collection("CHARACTER_CLOTHING"),
        collection("CHARACTER_RIG"),
        collection("REVIEW_CAMERAS"),
        collection("REVIEW_LIGHTS"),
    )


def build_materials():
    return {
        "skin": material("MAT_SKIN", (0.79, 0.60, 0.545), 0.72),
        "skin_shadow": material("MAT_SKIN_SHADOW", (0.64, 0.44, 0.42), 0.75),
        "lip": material("MAT_LIP", (0.55, 0.35, 0.33), 0.70),
        "hair": material("MAT_HAIR", (0.075, 0.068, 0.085), 0.62),
        "hair_light": material("MAT_HAIR_HIGHLIGHT", (0.16, 0.14, 0.19), 0.60),
        "brow": material("MAT_BROW", (0.10, 0.075, 0.085), 0.75),
        "sclera": material("MAT_EYE_SCLERA", (0.78, 0.75, 0.72), 0.35),
        "iris": material("MAT_EYE_IRIS", (0.035, 0.29, 0.55), 0.28),
        "pupil": material("MAT_EYE_PUPIL", (0.012, 0.015, 0.026), 0.20),
        "garment": material("MAT_GARMENT", (0.20, 0.19, 0.225), 0.82),
        "garment_dark": material("MAT_GARMENT_DARK", (0.13, 0.125, 0.15), 0.85),
        "shoe": material("MAT_SHOE", (0.09, 0.085, 0.10), 0.78),
    }


# ---------------------------------------------------------------------------
# Cabeza y rasgos
# ---------------------------------------------------------------------------

def build_head(mats, col) -> list[bpy.types.Object]:
    head = loft("HEAD", [
        (1.300, 0.022, 0.026, 0.0, -0.006),
        (1.312, 0.050, 0.055, 0.0, 0.0),
        (1.338, 0.082, 0.090, 0.0, 0.0),
        (1.375, 0.110, 0.106, 0.0, 0.0),
        (1.415, 0.123, 0.112, 0.0, 0.0),
        (1.455, 0.120, 0.108, 0.0, 0.004),
        (1.495, 0.105, 0.096, 0.0, 0.008),
        (1.530, 0.078, 0.072, 0.0, 0.010),
        (1.555, 0.030, 0.030, 0.0, 0.010),
        (1.562, 0.006, 0.006, 0.0, 0.010),
    ], mats["skin"], col)
    parts = [tag(head, "head", "measured-silhouette")]

    for side, sign in (("L", -1), ("R", 1)):
        ear = ellipsoid(f"EAR_{side}", (sign * 0.122, 0.004, 1.405),
                        (0.018, 0.026, 0.034), mats["skin"], col)
        parts.append(tag(ear, "ear", "measured-silhouette"))

    nose_bridge = ellipsoid("NOSE_BRIDGE", (0.0, -0.111, 1.414),
                            (0.013, 0.014, 0.030), mats["skin"], col)
    nose_tip = ellipsoid("NOSE_TIP", (0.0, -0.128, 1.392),
                         (0.019, 0.016, 0.016), mats["skin"], col)
    parts += [tag(nose_bridge, "nose", "inferred-depth"),
              tag(nose_tip, "nose", "inferred-depth")]

    # Ojos almendrados: el azul y la posición horizontal están en el render.
    for side, sign in (("L", -1), ("R", 1)):
        x = sign * 0.046
        sclera = ellipsoid(f"EYE_SCLERA_{side}", (x, -0.111, 1.424),
                           (0.028, 0.009, 0.012), mats["sclera"], col)
        iris = ellipsoid(f"EYE_IRIS_{side}", (x, -0.119, 1.424),
                         (0.012, 0.005, 0.011), mats["iris"], col)
        pupil = ellipsoid(f"EYE_PUPIL_{side}", (x, -0.123, 1.424),
                          (0.0055, 0.0025, 0.006), mats["pupil"], col)
        lid = curve_line(f"EYELID_{side}", [
            (x - 0.027, -0.116, 1.429),
            (x, -0.121, 1.436),
            (x + 0.027, -0.116, 1.429),
        ], mats["brow"], col, 0.0022)
        parts += [tag(sclera, "eye", "measured-color"),
                  tag(iris, "eye", "measured-color"),
                  tag(pupil, "eye", "inferred-detail"),
                  tag(lid, "eyelid", "inferred-detail")]

    for side, sign in (("L", -1), ("R", 1)):
        x = sign * 0.046
        brow = curve_line(f"BROW_{side}", [
            (x - 0.030, -0.112, 1.451),
            (x - 0.010, -0.116, 1.455),
            (x + 0.014, -0.116, 1.454),
            (x + 0.030, -0.110, 1.449),
        ], mats["brow"], col, 0.0032)
        parts.append(tag(brow, "eyebrow", "measured-silhouette"))

    upper = ellipsoid("LIP_UPPER", (0.0, -0.118, 1.352),
                      (0.027, 0.006, 0.0045), mats["lip"], col)
    lower = ellipsoid("LIP_LOWER", (0.0, -0.117, 1.344),
                      (0.026, 0.006, 0.005), mats["lip"], col)
    mouth_line = curve_line("MOUTH_LINE", [
        (-0.024, -0.123, 1.348), (0.0, -0.125, 1.347), (0.024, -0.123, 1.348)
    ], mats["skin_shadow"], col, 0.0013)
    parts += [tag(upper, "mouth", "inferred-detail"),
              tag(lower, "mouth", "inferred-detail"),
              tag(mouth_line, "mouth", "inferred-detail")]

    return parts


def build_hair(mats, col) -> list[bpy.types.Object]:
    parts = []
    specs = [
        ("HAIR_TOP", (0.0, 0.012, 1.522), (0.134, 0.118, 0.058), mats["hair"], None),
        ("HAIR_BACK", (0.0, 0.045, 1.455), (0.126, 0.096, 0.082), mats["hair"], None),
        ("HAIR_SIDE_L", (-0.108, -0.005, 1.447), (0.043, 0.095, 0.078), mats["hair"], None),
        ("HAIR_SIDE_R", (0.108, -0.005, 1.447), (0.043, 0.095, 0.078), mats["hair"], None),
        ("HAIR_FRINGE_L", (-0.048, -0.092, 1.498), (0.055, 0.032, 0.030), mats["hair_light"],
         (0.0, 0.0, math.radians(-12))),
        ("HAIR_FRINGE_C", (0.006, -0.102, 1.505), (0.060, 0.030, 0.026), mats["hair_light"],
         (0.0, 0.0, math.radians(5))),
        ("HAIR_FRINGE_R", (0.060, -0.091, 1.497), (0.050, 0.030, 0.028), mats["hair_light"],
         (0.0, 0.0, math.radians(14))),
        ("HAIR_CROWN_CLUMP_L", (-0.070, 0.035, 1.565), (0.052, 0.052, 0.030), mats["hair_light"], None),
        ("HAIR_CROWN_CLUMP_R", (0.065, 0.040, 1.560), (0.050, 0.050, 0.028), mats["hair_light"], None),
    ]
    for name, loc, scale, mat, rot in specs:
        obj = ellipsoid(name, loc, scale, mat, col, rot)
        parts.append(tag(obj, "hair", "measured-color/inferred-clumps"))
    return parts


# ---------------------------------------------------------------------------
# Cuerpo, ropa y accesorios
# ---------------------------------------------------------------------------

def build_body(mats, body_col, cloth_col) -> list[bpy.types.Object]:
    parts = []
    neck = loft("NECK", [
        (1.180, 0.050, 0.046, 0.0, 0.0),
        (1.235, 0.046, 0.044, 0.0, 0.0),
        (1.295, 0.052, 0.048, 0.0, 0.002),
    ], mats["skin"], body_col)
    parts.append(tag(neck, "neck", "measured-silhouette"))

    chest_skin = ellipsoid("UPPER_CHEST_SKIN", (0.0, -0.070, 1.175),
                           (0.072, 0.028, 0.044), mats["skin"], body_col)
    parts.append(tag(chest_skin, "chest", "inferred-neckline"))

    torso = loft("TORSO_GARMENT", [
        (0.820, 0.100, 0.077, 0.0, 0.0),
        (0.930, 0.108, 0.083, 0.0, 0.0),
        (1.050, 0.124, 0.090, 0.0, 0.0),
        (1.150, 0.138, 0.094, 0.0, 0.0),
        (1.205, 0.118, 0.086, 0.0, 0.0),
    ], mats["garment"], cloth_col)
    parts.append(tag(torso, "torso", "measured-silhouette"))

    hips = loft("HIPS_GARMENT", [
        (0.635, 0.108, 0.083, 0.0, 0.0),
        (0.710, 0.115, 0.087, 0.0, 0.0),
        (0.830, 0.100, 0.077, 0.0, 0.0),
    ], mats["garment_dark"], cloth_col)
    parts.append(tag(hips, "hips", "inferred-below-crop"))

    for side, sign in (("L", -1), ("R", 1)):
        upper = tube(f"UPPER_ARM_{side}", (sign * 0.132, 0.0, 1.180),
                     (sign * 0.158, -0.004, 1.010), 0.038, 0.031,
                     mats["skin"], body_col)
        fore = tube(f"FOREARM_{side}", (sign * 0.158, -0.004, 1.010),
                    (sign * 0.168, -0.012, 0.870), 0.031, 0.023,
                    mats["skin"], body_col)
        hand = ellipsoid(f"HAND_{side}", (sign * 0.169, -0.014, 0.828),
                         (0.031, 0.020, 0.045), mats["skin"], body_col)
        parts += [tag(upper, "upper_arm", "measured-silhouette"),
                  tag(fore, "forearm", "measured-silhouette"),
                  tag(hand, "hand", "measured-silhouette")]

        thigh = tube(f"THIGH_{side}", (sign * 0.056, 0.0, 0.655),
                     (sign * 0.060, -0.004, 0.360), 0.052, 0.039,
                     mats["garment_dark"], cloth_col)
        shin = tube(f"SHIN_{side}", (sign * 0.060, -0.004, 0.360),
                    (sign * 0.060, 0.0, 0.075), 0.039, 0.026,
                    mats["garment_dark"], cloth_col)
        foot = ellipsoid(f"FOOT_{side}", (sign * 0.060, -0.047, 0.042),
                         (0.044, 0.075, 0.026), mats["shoe"], cloth_col)
        parts += [tag(thigh, "thigh", "inferred-below-crop"),
                  tag(shin, "shin", "inferred-below-crop"),
                  tag(foot, "foot", "inferred-below-crop")]

    return parts


# ---------------------------------------------------------------------------
# Rig simple
# ---------------------------------------------------------------------------

def build_rig(col) -> bpy.types.Object:
    arm_data = bpy.data.armatures.new("ARMATURE_CHARACTER")
    rig = bpy.data.objects.new("RIG_CHARACTER", arm_data)
    col.objects.link(rig)
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")

    def bone(name, head, tail, parent=None):
        eb = arm_data.edit_bones.new(name)
        eb.head = head
        eb.tail = tail
        if parent:
            eb.parent = arm_data.edit_bones[parent]
        return eb

    bone("root", (0, 0, 0.0), (0, 0, 0.12))
    bone("hips", (0, 0, 0.82), (0, 0, 0.94), "root")
    bone("spine", (0, 0, 0.94), (0, 0, 1.10), "hips")
    bone("chest", (0, 0, 1.10), (0, 0, 1.22), "spine")
    bone("neck", (0, 0, 1.22), (0, 0, 1.32), "chest")
    bone("head", (0, 0, 1.32), (0, 0, 1.55), "neck")

    for side, sign in (("L", -1), ("R", 1)):
        bone(f"upper_arm.{side}", (sign * 0.132, 0, 1.18),
             (sign * 0.158, -0.004, 1.01), "chest")
        bone(f"forearm.{side}", (sign * 0.158, -0.004, 1.01),
             (sign * 0.168, -0.012, 0.87), f"upper_arm.{side}")
        bone(f"hand.{side}", (sign * 0.168, -0.012, 0.87),
             (sign * 0.169, -0.014, 0.80), f"forearm.{side}")
        bone(f"upper_leg.{side}", (sign * 0.056, 0, 0.655),
             (sign * 0.060, -0.004, 0.36), "hips")
        bone(f"lower_leg.{side}", (sign * 0.060, -0.004, 0.36),
             (sign * 0.060, 0, 0.075), f"upper_leg.{side}")
        bone(f"foot.{side}", (sign * 0.060, 0, 0.075),
             (sign * 0.060, -0.085, 0.045), f"lower_leg.{side}")

    bpy.ops.object.mode_set(mode="OBJECT")
    rig["rig_type"] = "simple-humanoid"
    rig["animation_ready"] = True
    return rig


def bind_all(rig: bpy.types.Object, parts: list[bpy.types.Object]) -> None:
    def group(obj, name, indices, weight=1.0):
        if not indices:
            return
        vg = obj.vertex_groups.get(name) or obj.vertex_groups.new(name=name)
        vg.add(indices, weight, "REPLACE")

    for obj in parts:
        part = obj.get("body_part", "")
        name = obj.name
        if part in {"head", "ear", "nose", "eye", "eyelid", "eyebrow", "mouth", "hair"}:
            targets = ["head"]
        elif part == "neck":
            targets = ["neck"]
        elif part in {"chest", "torso"}:
            targets = ["chest"]
        elif part == "hips":
            targets = ["hips"]
        elif part == "upper_arm":
            targets = ["upper_arm.L" if "_L" in name else "upper_arm.R"]
        elif part == "forearm":
            targets = ["forearm.L" if "_L" in name else "forearm.R"]
        elif part == "hand":
            targets = ["hand.L" if "_L" in name else "hand.R"]
        elif part == "thigh":
            targets = ["upper_leg.L" if "_L" in name else "upper_leg.R"]
        elif part == "shin":
            targets = ["lower_leg.L" if "_L" in name else "lower_leg.R"]
        elif part == "foot":
            targets = ["foot.L" if "_L" in name else "foot.R"]
        else:
            targets = ["root"]

        if obj.type == "CURVE":
            # Las cejas y líneas se convierten a malla para poder skinnearlas al hueso head.
            bpy.ops.object.select_all(action="DESELECT")
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.convert(target="MESH")
            obj = bpy.context.object
        if obj.type == "MESH":
            # glTF requiere que la malla skinneada tenga al armature como padre.
            obj.parent = rig
            obj.matrix_parent_inverse = rig.matrix_world.inverted()
            indices = list(range(len(obj.data.vertices)))
            for target in targets:
                group(obj, target, indices)
            mod = obj.modifiers.new("ARMATURE", "ARMATURE")
            mod.object = rig
            mod.use_vertex_groups = True


# ---------------------------------------------------------------------------
# Cámaras, luces, renders y exportación
# ---------------------------------------------------------------------------

def look_at(obj, target) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def build_review_rig(cam_col, light_col) -> dict[str, bpy.types.Object]:
    specs = {
        "front": ((0.0, -3.2, 1.02), (0.0, 0.0, 0.92), 1.85),
        "left_profile": ((-3.2, 0.0, 1.02), (0.0, 0.0, 0.92), 1.85),
        "right_profile": ((3.2, 0.0, 1.02), (0.0, 0.0, 0.92), 1.85),
        "three_quarter": ((-2.35, -2.35, 1.08), (0.0, 0.0, 0.92), 1.85),
        "back": ((0.0, 3.2, 1.02), (0.0, 0.0, 0.92), 1.85),
        "full": ((0.0, -4.0, 0.90), (0.0, 0.0, 0.86), 1.92),
    }
    cameras = {}
    for key, (loc, target, scale) in specs.items():
        data = bpy.data.cameras.new(f"CAM_{key.upper()}")
        data.type = "ORTHO"
        data.ortho_scale = scale
        cam = bpy.data.objects.new(f"CAM_{key.upper()}", data)
        cam_col.objects.link(cam)
        cam.location = loc
        look_at(cam, target)
        cameras[key] = cam

    lights = [
        ("LIGHT_KEY", (1.8, -2.2, 3.0), 420.0, 0.28),
        ("LIGHT_FILL", (-2.4, -1.4, 1.8), 220.0, 0.42),
        ("LIGHT_RIM", (0.0, 2.6, 2.4), 320.0, 0.30),
    ]
    for name, loc, energy, size in lights:
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.shape = "DISK"
        data.size = size
        obj = bpy.data.objects.new(name, data)
        light_col.objects.link(obj)
        obj.location = loc
        look_at(obj, (0.0, 0.0, 1.0))
    return cameras


def render_views(cameras) -> list[Path]:
    C.ensure_dirs()
    scene = bpy.context.scene
    outputs = []
    for key, camera in cameras.items():
        scene.camera = camera
        path = C.RENDERS_DIR / f"{CHECKPOINT}_{key}.png"
        scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        outputs.append(path)
        print(f"RENDER {path}")
    return outputs


def export_glb(path: Path) -> None:
    kwargs = dict(
        filepath=str(path),
        export_format="GLB",
        use_selection=False,
        export_apply=False,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
    )
    try:
        bpy.ops.export_scene.gltf(**kwargs)
    except TypeError:
        kwargs.pop("export_cameras", None)
        kwargs.pop("export_lights", None)
        bpy.ops.export_scene.gltf(**kwargs)
    print(f"GLB {path}")


def main() -> None:
    head_col, body_col, cloth_col, rig_col, cam_col, light_col = reset_scene()
    mats = build_materials()

    parts = build_head(mats, head_col)
    parts += build_hair(mats, head_col)
    parts += build_body(mats, body_col, cloth_col)
    rig = build_rig(rig_col)
    bind_all(rig, parts)

    cameras = build_review_rig(cam_col, light_col)
    bpy.context.scene.camera = cameras["front"]
    renders = render_views(cameras)

    glb_path = C.EXPORTS_DIR / f"{CHECKPOINT}.glb"
    C.ensure_dirs()
    export_glb(glb_path)

    meta = {
        "checkpoint": CHECKPOINT,
        "based_on": "cp002_character_v1.blend (misma reconstrucción, corrección de parentado de mallas y nombres)",
        "discarded_visual_design": "cp001_blockout",
        "stage": "reconstrucción 3D del avatar original - v1",
        "privacy": {
            "uploaded_to_external_services": False,
            "network_requests": 0,
            "references_embedded_in_blend": False,
        },
        "source_reference": str(C.AVATAR_DIR / "source" / "avatar_complete.jpg"),
        "turnaround_crops": "docs/avatar/local/references/turnaround/view_r{1,2}_c{1,2,3}.png",
        "view_assignment": {
            "r1c1": "frontal (mayor simetría de rostro/Hair center)",
            "r1c2": "tres cuartos hacia la derecha del encuadre",
            "r1c3": "perfil derecho (nariz sobresale a la derecha)",
            "r2c1": "tres cuartos / perfil izquierdo",
            "r2c2": "tres cuartos opuesto",
            "r2c3": "perfil izquierdo / tres cuartos posterior",
        },
        "confidence": {
            "palette": "high",
            "silhouette_head_torso": "high",
            "eye_color_and_position": "medium-high",
            "hair_clump_shape": "medium",
            "lower_body": "low - fuera del encuadre",
            "exact_facial_depth": "low - sin perfil medido",
        },
        "scale": {
            "units": "meters",
            "character_height_m": 1.562,
            "head_height_m": 0.262,
            "face_width_m_approx": 0.246,
            "note": "Escala derivada de la proporción cabeza:torsovisible en el panel frontal; no es una medición antropométrica.",
        },
        "geometry": {
            "objects": len(parts),
            "meshes": sum(1 for o in parts if o.type == "MESH"),
            "curves": sum(1 for o in parts if o.type == "CURVE"),
            "body_modeled": True,
            "clothing_modeled": True,
            "hair_modeled": True,
            "rig_present": True,
        },
        "rig": {
            "type": "simple-humanoid",
            "bones": [b.name for b in rig.data.bones],
            "animation_ready": True,
            "gltf_compatible": True,
        },
        "materials": [m.name for m in bpy.data.materials if m.name.startswith("MAT_")],
        "renders": [str(p) for p in renders],
        "glb": str(glb_path),
        "limitations": [
            "La referencia está recortada a la cintura: piernas y pies son inferidos y neutros.",
            "No hay medidas de perfil; la profundidad facial es una convención visual.",
            "Los mechones de cabello y el escote son aproximaciones de la silueta, no réplicas píxel a píxel.",
            "No se usaron texturas fotográficas ni datos del avatar anterior.",
        ],
    }
    saved = C.save_checkpoint(f"{CHECKPOINT}.blend", meta)
    print(f"CHECKPOINT {saved}")
    print(f"OBJECTS {meta['geometry']['objects']}")
    print(f"BONES {len(meta['rig']['bones'])}")
    print(f"GLB {glb_path}")


if __name__ == "__main__":
    main()
