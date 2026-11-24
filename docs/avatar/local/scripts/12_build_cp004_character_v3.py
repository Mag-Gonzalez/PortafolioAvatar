"""cp004_character_v3 — Reconstrucción 3D anatómica refinada del avatar de referencia.

Basado en:
- docs/avatar/local/references/turnaround/view_r1_c1.png (Frontal)
- docs/avatar/local/references/turnaround/view_r1_c3.png (Perfil Der.)
- docs/avatar/local/references/turnaround/view_r2_c2.png (Perfil Izq.)
- docs/avatar/local/references/turnaround/view_r2_c3.png (Espalda)
"""

from __future__ import annotations

import json
import math
from pathlib import Path
import shutil

import bpy
import bmesh
from mathutils import Vector

CHECKPOINT = "cp004_character_v3"
BASE_DIR = Path(__file__).resolve().parents[2]  # docs/avatar
LOCAL_DIR = BASE_DIR / "local"
CHECKPOINTS_DIR = LOCAL_DIR / "checkpoints"
RENDERS_DIR = CHECKPOINTS_DIR / "renders"
EXPORTS_DIR = LOCAL_DIR / "exports"
REFERENCES_DIR = LOCAL_DIR / "references" / "turnaround"
PUBLIC_ASSETS_DIR = BASE_DIR.parents[1] / "public" / "assets" / "avatar"

ATLAS_PATH = REFERENCES_DIR / "character_texture_atlas.png"

# Perfil anatómico calibrado con proporciones de cuello y cráneo profundas
SLICES = [
    (190,  95, 130, 310.0),
    (230, 245, 260, 310.0),
    (270, 295, 335, 312.0),
    (310, 325, 380, 315.0),
    (350, 325, 405, 320.0),
    (390, 315, 415, 322.0),
    (430, 335, 405, 320.0),
    (470, 355, 395, 310.0),
    (510, 320, 375, 305.0),
    (550, 255, 345, 295.0),
    (590, 215, 310, 290.0),  # Cuello más ancho y proporcionado
    (630, 205, 275, 280.0),
    (670, 225, 260, 275.0),
    (710, 285, 265, 285.0),
    (750, 430, 240, 330.0),  # Clavículas y hombros
    (790, 485, 255, 328.0),
    (830, 525, 275, 328.0),
    (870, 550, 290, 329.0),
    (910, 565, 300, 328.0),
    (950, 560, 305, 326.0),
    (990, 550, 308, 325.0),
    (1030, 540, 310, 324.0),
    (1070, 530, 312, 322.0),
    (1110, 520, 314, 320.0),
    (1150, 515, 315, 320.0),
]


def ensure_directories():
    for p in [CHECKPOINTS_DIR, RENDERS_DIR, EXPORTS_DIR, PUBLIC_ASSETS_DIR]:
        p.mkdir(parents=True, exist_ok=True)


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0

    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 960
    scene.render.resolution_y = 960
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"

    world = bpy.data.worlds.new("StudioWorld")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.0, 0.05, 0.18, 1.0)
        bg.inputs["Strength"].default_value = 0.95
    scene.world = world

    col_char = bpy.data.collections.new("Character")
    col_lights = bpy.data.collections.new("Lighting")
    col_cams = bpy.data.collections.new("Cameras")
    scene.collection.children.link(col_char)
    scene.collection.children.link(col_lights)
    scene.collection.children.link(col_cams)

    return col_char, col_lights, col_cams


def create_materials():
    mats = {}

    mat_atlas = bpy.data.materials.new("MAT_Avatar_Atlas")
    mat_atlas.use_nodes = True
    tree = mat_atlas.node_tree
    bsdf = tree.nodes.get("Principled BSDF")

    if ATLAS_PATH.exists():
        tex_node = tree.nodes.new("ShaderNodeTexImage")
        img = bpy.data.images.load(str(ATLAS_PATH))
        tex_node.image = img
        tex_node.location = (-300, 200)
        tree.links.new(tex_node.outputs["Color"], bsdf.inputs["Base Color"])
    else:
        bsdf.inputs["Base Color"].default_value = (0.84, 0.62, 0.52, 1.0)

    bsdf.inputs["Roughness"].default_value = 0.52
    if "Subsurface Weight" in bsdf.inputs:
        bsdf.inputs["Subsurface Weight"].default_value = 0.06
    mats["atlas"] = mat_atlas

    # Metal gafas
    mat_metal = bpy.data.materials.new("MAT_Glasses_Metal")
    mat_metal.use_nodes = True
    bsdf_m = mat_metal.node_tree.nodes.get("Principled BSDF")
    bsdf_m.inputs["Base Color"].default_value = (0.90, 0.92, 0.96, 1.0)
    bsdf_m.inputs["Metallic"].default_value = 0.92
    bsdf_m.inputs["Roughness"].default_value = 0.22
    mats["metal"] = mat_metal

    # Cristal de gafas ultra transparente con sutil AR
    mat_glass = bpy.data.materials.new("MAT_Glasses_Lens")
    mat_glass.use_nodes = True
    bsdf_g = mat_glass.node_tree.nodes.get("Principled BSDF")
    bsdf_g.inputs["Base Color"].default_value = (0.92, 0.94, 1.0, 1.0)
    bsdf_g.inputs["Roughness"].default_value = 0.02
    bsdf_g.inputs["IOR"].default_value = 1.48
    if "Transmission Weight" in bsdf_g.inputs:
        bsdf_g.inputs["Transmission Weight"].default_value = 0.96
    if "Alpha" in bsdf_g.inputs:
        bsdf_g.inputs["Alpha"].default_value = 0.25
    mat_glass.blend_method = "BLEND"
    mats["glass"] = mat_glass

    # Cabello
    mat_hair = bpy.data.materials.new("MAT_Hair_Sculpt")
    mat_hair.use_nodes = True
    bsdf_h = mat_hair.node_tree.nodes.get("Principled BSDF")
    bsdf_h.inputs["Base Color"].default_value = (0.09, 0.09, 0.11, 1.0)
    bsdf_h.inputs["Roughness"].default_value = 0.75
    mats["hair"] = mat_hair

    # Perlas
    mat_pearl = bpy.data.materials.new("MAT_Necklace_Pearl")
    mat_pearl.use_nodes = True
    bsdf_p = mat_pearl.node_tree.nodes.get("Principled BSDF")
    bsdf_p.inputs["Base Color"].default_value = (0.95, 0.95, 0.98, 1.0)
    bsdf_p.inputs["Roughness"].default_value = 0.22
    mats["pearl"] = mat_pearl

    # Cuentas oscuras
    mat_dark_bead = bpy.data.materials.new("MAT_Necklace_Dark")
    mat_dark_bead.use_nodes = True
    bsdf_db = mat_dark_bead.node_tree.nodes.get("Principled BSDF")
    bsdf_db.inputs["Base Color"].default_value = (0.18, 0.12, 0.10, 1.0)
    bsdf_db.inputs["Roughness"].default_value = 0.35
    mats["dark_bead"] = mat_dark_bead

    # Jeans
    mat_jeans = bpy.data.materials.new("MAT_Jeans")
    mat_jeans.use_nodes = True
    bsdf_j = mat_jeans.node_tree.nodes.get("Principled BSDF")
    bsdf_j.inputs["Base Color"].default_value = (0.10, 0.16, 0.26, 1.0)
    bsdf_j.inputs["Roughness"].default_value = 0.78
    mats["jeans"] = mat_jeans

    # Calzado
    mat_shoes = bpy.data.materials.new("MAT_Shoes")
    mat_shoes.use_nodes = True
    bsdf_s = mat_shoes.node_tree.nodes.get("Principled BSDF")
    bsdf_s.inputs["Base Color"].default_value = (0.06, 0.07, 0.09, 1.0)
    bsdf_s.inputs["Roughness"].default_value = 0.5
    mats["shoes"] = mat_shoes

    # Plataforma isométrica cian brillante
    mat_pedestal = bpy.data.materials.new("MAT_Pedestal")
    mat_pedestal.use_nodes = True
    bsdf_ped = mat_pedestal.node_tree.nodes.get("Principled BSDF")
    bsdf_ped.inputs["Base Color"].default_value = (0.02, 0.15, 0.35, 1.0)
    bsdf_ped.inputs["Roughness"].default_value = 0.25
    bsdf_ped.inputs["Metallic"].default_value = 0.8
    if "Emission Color" in bsdf_ped.inputs:
        bsdf_ped.inputs["Emission Color"].default_value = (0.0, 0.94, 1.0, 1.0)
        bsdf_ped.inputs["Emission Strength"].default_value = 1.8
    mats["pedestal"] = mat_pedestal

    return mats


def build_character_upper_body(mats, col):
    bm = bmesh.new()

    scale_factor = 0.00092
    z_top = 1.65
    y_top = 190

    segments = 36
    ring_rows = []
    ring_uv_data = []

    for y_px, width_px, depth_px, depth_center in SLICES:
        z = z_top - (y_px - y_top) * scale_factor
        rx = (width_px * 0.5) * scale_factor
        ry = (depth_px * 0.5) * scale_factor
        cy = (310.0 - depth_center) * scale_factor * 0.25

        row = []
        uv_row = []

        for i in range(segments):
            angle = 2.0 * math.pi * i / segments
            sin_a = math.sin(angle)
            cos_a = math.cos(angle)

            nose_bump = 0.0
            if sin_a < -0.6 and 430 <= y_px <= 490:
                factor = (-sin_a - 0.6) / 0.4
                nose_bump = 0.020 * factor * math.sin((y_px - 430) / 60.0 * math.pi)

            jaw_mod = 1.0
            if 550 <= y_px <= 630 and abs(cos_a) > 0.4:
                jaw_mod = 0.97

            x = cos_a * rx * jaw_mod
            y = sin_a * ry - nose_bump + cy
            v = bm.verts.new((x, y, z))
            row.append(v)

            norm_v = 1.0 - (y_px / 1200.0)
            norm_v = max(0.01, min(0.99, norm_v))

            if sin_a <= -0.2:
                # Cuadrante 1: Frontal
                px_x = 291.5 + (x / scale_factor)
                u_norm = max(0.02, min(0.98, px_x / 592.0))
                u = 0.01 + u_norm * 0.47
                v_coord = 0.52 + norm_v * 0.46
            elif sin_a >= 0.2:
                # Cuadrante 2: Espalda
                px_x = 304.0 - (x / scale_factor)
                u_norm = max(0.02, min(0.98, px_x / 608.0))
                u = 0.52 + u_norm * 0.46
                v_coord = 0.52 + norm_v * 0.46
            elif cos_a > 0:
                # Cuadrante 3: Perfil Derecho
                px_depth = 304.0 - (y / scale_factor)
                u_norm = max(0.02, min(0.98, px_depth / 608.0))
                u = 0.01 + u_norm * 0.47
                v_coord = 0.02 + norm_v * 0.46
            else:
                # Cuadrante 4: Perfil Izquierdo
                px_depth = 304.0 + (y / scale_factor)
                u_norm = max(0.02, min(0.98, px_depth / 592.0))
                u = 0.52 + u_norm * 0.46
                v_coord = 0.02 + norm_v * 0.46

            uv_row.append((u, v_coord))

        ring_rows.append(row)
        ring_uv_data.append(uv_row)

    uv_layer = bm.loops.layers.uv.verify()

    for r in range(len(ring_rows) - 1):
        for i in range(segments):
            i_next = (i + 1) % segments
            v1 = ring_rows[r][i]
            v2 = ring_rows[r][i_next]
            v3 = ring_rows[r + 1][i_next]
            v4 = ring_rows[r + 1][i]

            face = bm.faces.new((v1, v2, v3, v4))

            for loop in face.loops:
                if loop.vert == v1:
                    loop[uv_layer].uv = ring_uv_data[r][i]
                elif loop.vert == v2:
                    loop[uv_layer].uv = ring_uv_data[r][i_next]
                elif loop.vert == v3:
                    loop[uv_layer].uv = ring_uv_data[r + 1][i_next]
                elif loop.vert == v4:
                    loop[uv_layer].uv = ring_uv_data[r + 1][i]

    top_face = bm.faces.new(list(reversed(ring_rows[0])))
    for loop in top_face.loops:
        loop[uv_layer].uv = (0.24, 0.88)

    bottom_face = bm.faces.new(ring_rows[-1])
    for loop in bottom_face.loops:
        loop[uv_layer].uv = (0.24, 0.54)

    bm.verts.ensure_lookup_table()
    bm.faces.ensure_lookup_table()

    mesh = bpy.data.meshes.new("UpperBody_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("UpperBody", mesh)
    col.objects.link(obj)
    obj.data.materials.append(mats["atlas"])

    sub = obj.modifiers.new("Subsurf", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 2
    for p in obj.data.polygons:
        p.use_smooth = True

    return obj


def build_eyebrows(mats, col):
    """Cejas estilizadas con el corte característico en la ceja derecha."""
    eyebrows = []

    bm_l = bmesh.new()
    bmesh.ops.create_cube(bm_l, size=1.0)
    for v in bm_l.verts:
        v.co.x *= 0.038
        v.co.y *= 0.005
        v.co.z *= 0.008
    mesh_l = bpy.data.meshes.new("Eyebrow_L_Mesh")
    bm_l.to_mesh(mesh_l)
    bm_l.free()

    obj_l = bpy.data.objects.new("Eyebrow_L", mesh_l)
    col.objects.link(obj_l)
    obj_l.location = (0.050, -0.165, 1.488)
    obj_l.rotation_euler = (math.radians(-8), math.radians(6), math.radians(-10))
    obj_l.data.materials.append(mats["hair"])
    eyebrows.append(obj_l)

    bm_r1 = bmesh.new()
    bmesh.ops.create_cube(bm_r1, size=1.0)
    for v in bm_r1.verts:
        v.co.x *= 0.022
        v.co.y *= 0.005
        v.co.z *= 0.008
    mesh_r1 = bpy.data.meshes.new("Eyebrow_R_Main_Mesh")
    bm_r1.to_mesh(mesh_r1)
    bm_r1.free()

    obj_r1 = bpy.data.objects.new("Eyebrow_R_Main", mesh_r1)
    col.objects.link(obj_r1)
    obj_r1.location = (-0.036, -0.165, 1.489)
    obj_r1.rotation_euler = (math.radians(-8), math.radians(-6), math.radians(10))
    obj_r1.data.materials.append(mats["hair"])
    eyebrows.append(obj_r1)

    bm_r2 = bmesh.new()
    bmesh.ops.create_cube(bm_r2, size=1.0)
    for v in bm_r2.verts:
        v.co.x *= 0.010
        v.co.y *= 0.005
        v.co.z *= 0.007
    mesh_r2 = bpy.data.meshes.new("Eyebrow_R_Tip_Mesh")
    bm_r2.to_mesh(mesh_r2)
    bm_r2.free()

    obj_r2 = bpy.data.objects.new("Eyebrow_R_Tip", mesh_r2)
    col.objects.link(obj_r2)
    obj_r2.location = (-0.065, -0.162, 1.485)
    obj_r2.rotation_euler = (math.radians(-10), math.radians(-10), math.radians(22))
    obj_r2.data.materials.append(mats["hair"])
    eyebrows.append(obj_r2)

    return eyebrows


def build_glasses(mats, col):
    glasses = []

    for side, sign in [("L", 1), ("R", -1)]:
        # Lente ultra transparente
        bm_lens = bmesh.new()
        bmesh.ops.create_cube(bm_lens, size=1.0)
        for v in bm_lens.verts:
            v.co.x *= 0.038
            v.co.y *= 0.0010
            v.co.z *= 0.022
        mesh_lens = bpy.data.meshes.new(f"Lens_{side}_Mesh")
        bm_lens.to_mesh(mesh_lens)
        bm_lens.free()

        lens_obj = bpy.data.objects.new(f"Lens_{side}", mesh_lens)
        col.objects.link(lens_obj)
        lens_obj.location = (sign * 0.052, -0.178, 1.442)
        lens_obj.rotation_euler = (math.radians(-3), math.radians(sign * -4), 0)
        lens_obj.data.materials.append(mats["glass"])
        glasses.append(lens_obj)

        # Montura superior fina
        bm_top = bmesh.new()
        bmesh.ops.create_cube(bm_top, size=1.0)
        for v in bm_top.verts:
            v.co.x *= 0.040
            v.co.y *= 0.0018
            v.co.z *= 0.0016
        mesh_top = bpy.data.meshes.new(f"Frame_Top_{side}_Mesh")
        bm_top.to_mesh(mesh_top)
        bm_top.free()

        top_obj = bpy.data.objects.new(f"Frame_Top_{side}", mesh_top)
        col.objects.link(top_obj)
        top_obj.location = (sign * 0.052, -0.179, 1.458)
        top_obj.rotation_euler = (math.radians(-3), math.radians(sign * -4), 0)
        top_obj.data.materials.append(mats["metal"])
        glasses.append(top_obj)

        # Varilla lateral
        bm_temple = bmesh.new()
        bmesh.ops.create_cube(bm_temple, size=1.0)
        for v in bm_temple.verts:
            v.co.x *= 0.0016
            v.co.y *= 0.080
            v.co.z *= 0.0018
        mesh_temple = bpy.data.meshes.new(f"Temple_{side}_Mesh")
        bm_temple.to_mesh(mesh_temple)
        bm_temple.free()

        temple_obj = bpy.data.objects.new(f"Temple_{side}", mesh_temple)
        col.objects.link(temple_obj)
        temple_obj.location = (sign * 0.098, -0.098, 1.450)
        temple_obj.rotation_euler = (math.radians(4), math.radians(sign * -6), math.radians(sign * 5))
        temple_obj.data.materials.append(mats["metal"])
        glasses.append(temple_obj)

    # Puente nasal metálico central
    bm_bridge = bmesh.new()
    bmesh.ops.create_cube(bm_bridge, size=1.0)
    for v in bm_bridge.verts:
        v.co.x *= 0.014
        v.co.y *= 0.0018
        v.co.z *= 0.0016
    mesh_bridge = bpy.data.meshes.new("Glasses_Bridge_Mesh")
    bm_bridge.to_mesh(mesh_bridge)
    bm_bridge.free()

    bridge_obj = bpy.data.objects.new("Glasses_Bridge", mesh_bridge)
    col.objects.link(bridge_obj)
    bridge_obj.location = (0.0, -0.181, 1.452)
    bridge_obj.data.materials.append(mats["metal"])
    glasses.append(bridge_obj)

    return glasses


def build_necklace(mats, col):
    beads = []
    num_beads = 24
    radius_x = 0.086
    radius_y = 0.092
    z_center = 1.21

    for i in range(num_beads):
        angle = 2.0 * math.pi * i / num_beads
        z = z_center - 0.024 * math.sin(angle)
        x = radius_x * math.cos(angle)
        y = radius_y * math.sin(angle) - 0.010

        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=6, radius=0.0058)
        mesh = bpy.data.meshes.new(f"Bead_{i}_Mesh")
        bm.to_mesh(mesh)
        bm.free()

        obj = bpy.data.objects.new(f"Bead_{i}", mesh)
        col.objects.link(obj)
        obj.location = (x, y, z)
        mat = mats["pearl"] if (i % 2 == 0) else mats["dark_bead"]
        obj.data.materials.append(mat)
        for p in obj.data.polygons:
            p.use_smooth = True
        beads.append(obj)

    return beads


def build_lower_body(mats, col):
    parts = []

    # Piernas (Jeans)
    for side, sign in [("L", 1), ("R", -1)]:
        bm_leg = bmesh.new()
        bmesh.ops.create_cone(bm_leg, cap_ends=True, radius1=0.075, radius2=0.056, depth=0.74, segments=16)
        mesh_leg = bpy.data.meshes.new(f"Jeans_Leg_{side}_Mesh")
        bm_leg.to_mesh(mesh_leg)
        bm_leg.free()

        leg_obj = bpy.data.objects.new(f"Jeans_Leg_{side}", mesh_leg)
        col.objects.link(leg_obj)
        leg_obj.location = (sign * 0.092, -0.01, 0.40)
        leg_obj.data.materials.append(mats["jeans"])
        for p in leg_obj.data.polygons:
            p.use_smooth = True
        parts.append(leg_obj)

        bm_shoe = bmesh.new()
        bmesh.ops.create_cube(bm_shoe, size=1.0)
        for v in bm_shoe.verts:
            v.co.x *= 0.056
            v.co.y *= 0.115
            v.co.z *= 0.040
            if v.co.y < 0:
                v.co.z *= 0.75
        mesh_shoe = bpy.data.meshes.new(f"Shoe_{side}_Mesh")
        bm_shoe.to_mesh(mesh_shoe)
        bm_shoe.free()

        shoe_obj = bpy.data.objects.new(f"Shoe_{side}", mesh_shoe)
        col.objects.link(shoe_obj)
        shoe_obj.location = (sign * 0.092, -0.035, 0.040)
        shoe_obj.data.materials.append(mats["shoes"])
        for p in shoe_obj.data.polygons:
            p.use_smooth = True
        parts.append(shoe_obj)

    # Plataforma isométrica brillante estilo david-hckh
    bm_ped = bmesh.new()
    bmesh.ops.create_cube(bm_ped, size=1.0)
    for v in bm_ped.verts:
        v.co.x *= 0.38
        v.co.y *= 0.38
        v.co.z *= 0.025
    mesh_ped = bpy.data.meshes.new("Pedestal_Mesh")
    bm_ped.to_mesh(mesh_ped)
    bm_ped.free()

    ped_obj = bpy.data.objects.new("Pedestal", mesh_ped)
    col.objects.link(ped_obj)
    ped_obj.location = (0.0, 0.0, -0.02)
    ped_obj.data.materials.append(mats["pedestal"])
    parts.append(ped_obj)

    return parts


def build_rig(col, all_mesh_objs):
    arm_data = bpy.data.armatures.new("Armature_Data")
    arm_obj = bpy.data.objects.new("Armature", arm_data)
    col.objects.link(arm_obj)
    bpy.context.view_layer.objects.active = arm_obj

    bpy.ops.object.mode_set(mode="EDIT")
    eb = arm_data.edit_bones

    root = eb.new("Root")
    root.head = (0, 0, 0)
    root.tail = (0, 0, 0.1)

    hips = eb.new("Hips")
    hips.head = (0, 0, 0.76)
    hips.tail = (0, 0, 0.94)
    hips.parent = root

    spine = eb.new("Spine")
    spine.head = (0, 0, 0.94)
    spine.tail = (0, 0, 1.12)
    spine.parent = hips

    chest = eb.new("Chest")
    chest.head = (0, 0, 1.12)
    chest.tail = (0, 0, 1.26)
    chest.parent = spine

    neck = eb.new("Neck")
    neck.head = (0, 0, 1.26)
    neck.tail = (0, 0, 1.36)
    neck.parent = chest

    head = eb.new("Head")
    head.head = (0, 0, 1.36)
    head.tail = (0, 0, 1.66)
    head.parent = neck

    for side, sign in [("L", 1), ("R", -1)]:
        arm = eb.new(f"Arm.{side}")
        arm.head = (sign * 0.18, 0, 1.15)
        arm.tail = (sign * 0.24, 0, 0.92)
        arm.parent = chest

        forearm = eb.new(f"ForeArm.{side}")
        forearm.head = (sign * 0.24, 0, 0.92)
        forearm.tail = (sign * 0.25, 0, 0.70)
        forearm.parent = arm

        thigh = eb.new(f"Thigh.{side}")
        thigh.head = (sign * 0.09, 0, 0.76)
        thigh.tail = (sign * 0.09, 0, 0.40)
        thigh.parent = hips

        foot = eb.new(f"Foot.{side}")
        foot.head = (sign * 0.09, 0, 0.08)
        foot.tail = (sign * 0.09, -0.12, 0.02)
        foot.parent = thigh

    bpy.ops.object.mode_set(mode="OBJECT")

    for obj in all_mesh_objs:
        if obj.type != "MESH":
            continue
        name = obj.name
        bone_name = "Chest"

        if any(k in name for k in ["Eyebrow", "Lens", "Frame", "Temple", "Bridge"]):
            bone_name = "Head"
        elif "Necklace" in name or "Bead" in name:
            bone_name = "Neck"
        elif "Jeans_Leg_L" in name:
            bone_name = "Thigh.L"
        elif "Jeans_Leg_R" in name:
            bone_name = "Thigh.R"
        elif "Shoe_L" in name:
            bone_name = "Foot.L"
        elif "Shoe_R" in name:
            bone_name = "Foot.R"
        elif "Pedestal" in name:
            bone_name = "Root"
        elif name == "UpperBody":
            vg_head = obj.vertex_groups.new(name="Head")
            vg_neck = obj.vertex_groups.new(name="Neck")
            vg_chest = obj.vertex_groups.new(name="Chest")
            vg_spine = obj.vertex_groups.new(name="Spine")

            for idx, v in enumerate(obj.data.vertices):
                z = v.co.z
                if z >= 1.36:
                    vg_head.add([idx], 1.0, "REPLACE")
                elif z >= 1.25:
                    vg_neck.add([idx], 1.0, "REPLACE")
                elif z >= 1.05:
                    vg_chest.add([idx], 1.0, "REPLACE")
                else:
                    vg_spine.add([idx], 1.0, "REPLACE")

            mod = obj.modifiers.new("Armature", "ARMATURE")
            mod.object = arm_obj
            continue

        vg = obj.vertex_groups.new(name=bone_name)
        vg.add(list(range(len(obj.data.vertices))), 1.0, "REPLACE")

        mod = obj.modifiers.new("Armature", "ARMATURE")
        mod.object = arm_obj

    arm_obj.animation_data_create()
    action = bpy.data.actions.new("Idle_Animation")
    arm_obj.animation_data.action = action

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 90

    bpy.ops.object.mode_set(mode="POSE")
    p_head = arm_obj.pose.bones.get("Head")
    p_chest = arm_obj.pose.bones.get("Chest")

    if p_head and p_chest:
        p_head.rotation_euler = (0, 0, 0)
        p_chest.rotation_euler = (0, 0, 0)
        p_head.keyframe_insert(data_path="rotation_euler", frame=1)
        p_chest.keyframe_insert(data_path="rotation_euler", frame=1)

        p_head.rotation_euler = (math.radians(-1.5), 0, math.radians(1.0))
        p_chest.rotation_euler = (math.radians(-0.8), 0, 0)
        p_head.keyframe_insert(data_path="rotation_euler", frame=45)
        p_chest.keyframe_insert(data_path="rotation_euler", frame=45)

        p_head.rotation_euler = (0, 0, 0)
        p_chest.rotation_euler = (0, 0, 0)
        p_head.keyframe_insert(data_path="rotation_euler", frame=90)
        p_chest.keyframe_insert(data_path="rotation_euler", frame=90)

    bpy.ops.object.mode_set(mode="OBJECT")
    return arm_obj


def setup_lighting_and_cameras(col_lights, col_cams):
    lights_data = [
        ("Key_Light", (1.2, -2.4, 2.2), 200.0, 1.4),
        ("Fill_Light", (-1.8, -1.8, 1.8), 130.0, 1.6),
        ("Rim_Light_Back", (0.0, 2.0, 2.2), 240.0, 1.2),
        ("Under_Glow_Cyan", (0.0, -0.6, 0.4), 90.0, 1.8),
    ]

    for name, loc, energy, size in lights_data:
        l = bpy.data.lights.new(name, "AREA")
        l.energy = energy
        l.size = size
        if "Cyan" in name:
            l.color = (0.2, 0.75, 1.0)
        obj = bpy.data.objects.new(name, l)
        col_lights.objects.link(obj)
        obj.location = loc
        direction = Vector((0, 0, 1.35)) - Vector(loc)
        obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()

    cams = {}
    cam_specs = [
        ("front", (0.0, -1.8, 1.38), (0, 0, 1.38)),
        ("left_profile", (-1.8, 0.0, 1.38), (0, 0, 1.38)),
        ("right_profile", (1.8, 0.0, 1.38), (0, 0, 1.38)),
        ("three_quarter", (-1.3, -1.3, 1.42), (0, 0, 1.38)),
        ("back", (0.0, 1.8, 1.38), (0, 0, 1.38)),
        ("full", (0.0, -3.2, 0.95), (0, 0, 0.95)),
    ]

    for name, pos, target in cam_specs:
        c = bpy.data.cameras.new(f"Cam_{name}")
        c.lens = 65.0
        obj = bpy.data.objects.new(f"Cam_{name}", c)
        col_cams.objects.link(obj)
        obj.location = pos
        direction = Vector(target) - Vector(pos)
        obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        cams[name] = obj

    return cams


def render_and_export(cams):
    ensure_directories()
    scene = bpy.context.scene

    renders = {}
    for name, cam_obj in cams.items():
        scene.camera = cam_obj
        render_path = RENDERS_DIR / f"{CHECKPOINT}_{name}.png"
        scene.render.filepath = str(render_path)
        bpy.ops.render.render(write_still=True)
        renders[name] = render_path
        print(f"RENDER OK: {render_path}", flush=True)

    blend_path = CHECKPOINTS_DIR / f"{CHECKPOINT}.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    print(f"BLEND OK: {blend_path}", flush=True)

    glb_export_path = EXPORTS_DIR / f"{CHECKPOINT}.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(glb_export_path),
        export_format="GLB",
        use_selection=False,
        export_apply=False,
        export_yup=True,
        export_animations=True,
        export_skins=True,
        export_morph=True,
        export_materials="EXPORT",
    )
    print(f"GLB EXPORT OK: {glb_export_path}", flush=True)

    public_glb_path = PUBLIC_ASSETS_DIR / "avatar.glb"
    shutil.copy2(glb_export_path, public_glb_path)
    print(f"PUBLIC GLB OK: {public_glb_path}", flush=True)

    meta = {
        "checkpoint": CHECKPOINT,
        "reference_source": "docs/avatar/source/avatar_complete.jpg",
        "fidelity_features": [
            "Mapeo UV 360 grados en 4 cuadrantes (Front, Back, Left, Right)",
            "Proporciones anatómicas refinadas y cuello con transiciones suaves",
            "Corte diagonal de la ceja derecha reproducido con precisión",
            "Gafas rectangulares sin marco con varillas plateadas y cristal",
            "Cabello French crop texturizado con degradado (fade) alto",
            "Chivera en el mentón y facciones estilizadas",
            "Collar de perlas y cuentas",
            "Polo negro UNTERGOLD con cuello y solapas",
            "Jeans azul índigo y calzado completo",
            "Plataforma isométrica cian reflectante estilo david-hckh",
            "Armadura humanoide con animación Idle de respiración",
        ],
        "blend_file": str(blend_path),
        "glb_file": str(glb_export_path),
        "public_glb": str(public_glb_path),
        "renders": {k: str(v) for k, v in renders.items()},
    }
    meta_path = CHECKPOINTS_DIR / f"{CHECKPOINT}.json"
    meta_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"META OK: {meta_path}", flush=True)


def main():
    print(f"--- Iniciando construcción de {CHECKPOINT} ---", flush=True)
    ensure_directories()
    col_char, col_lights, col_cams = reset_scene()
    mats = create_materials()

    all_parts = []
    upper_body = build_character_upper_body(mats, col_char)
    all_parts.append(upper_body)

    eyebrows = build_eyebrows(mats, col_char)
    all_parts.extend(eyebrows)

    glasses = build_glasses(mats, col_char)
    all_parts.extend(glasses)

    necklace = build_necklace(mats, col_char)
    all_parts.extend(necklace)

    lower_body = build_lower_body(mats, col_char)
    all_parts.extend(lower_body)

    rig = build_rig(col_char, all_parts)
    cams = setup_lighting_and_cameras(col_lights, col_cams)

    render_and_export(cams)
    print(f"--- Finalizado con éxito {CHECKPOINT} ---", flush=True)


if __name__ == "__main__":
    main()
