"""cp001_blockout — blockout de la cabeza del avatar (etapa 3).

Parte de ``cp000_presentation.blend``, usa las medidas frontales reales de
``config/proportions.json`` y crea solo la cabeza: volumen facial, mandíbula,
orejas, nariz, ojos, cejas, labios, vello facial, cabello y gafas básicas.
No crea cuerpo, ropa ni texturas fotográficas. El perfil sigue pendiente: la
profundidad es una convención estilizada, no una medida.

Uso:
  blender --background docs/avatar/local/checkpoints/cp000_presentation.blend \
    --python docs/avatar/local/scripts/07_build_cp001_blockout.py
"""
from __future__ import annotations

import math
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy
from mathutils import Vector

import common as C

CHECKPOINT = "cp001_blockout"
HEAD_CAMERA_SCALE = 0.32  # encuadre de cabeza; cp000 conserva 0,46
SEGMENTS = 32


def midpoint(a: list[float], b: list[float]) -> tuple[float, float]:
    return ((a[0] + b[0]) / 2.0, (a[1] + b[1]) / 2.0)


def make_material(name: str, color: tuple[float, float, float], roughness: float = 0.65,
                  metallic: float = 0.0) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = (*color, 1.0)
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*color, 1.0)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return material


def add_ellipsoid(name: str, location: tuple[float, float, float],
                  scale: tuple[float, float, float], material: bpy.types.Material) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def add_curve(name: str, points: list[tuple[float, float, float]],
              material: bpy.types.Material, bevel: float = 0.0015,
              cyclic: bool = False) -> bpy.types.Object:
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = bevel
    curve.bevel_resolution = 2
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for index, (x, y, z) in enumerate(points):
        spline.points[index].co = (x, y, z, 1.0)
    spline.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def add_head_mesh(rings: list[tuple[float, float, float, float]],
                  material: bpy.types.Material) -> bpy.types.Object:
    vertices: list[tuple[float, float, float]] = []
    faces: list[tuple[int, ...]] = []
    for z, x_radius, y_radius, x_center in rings:
        for segment in range(SEGMENTS):
            angle = 2.0 * math.pi * segment / SEGMENTS
            vertices.append((
                x_center + x_radius * math.cos(angle),
                y_radius * math.sin(angle),
                z,
            ))
    for ring in range(len(rings) - 1):
        for segment in range(SEGMENTS):
            nxt = (segment + 1) % SEGMENTS
            faces.append((
                ring * SEGMENTS + segment,
                ring * SEGMENTS + nxt,
                (ring + 1) * SEGMENTS + nxt,
                (ring + 1) * SEGMENTS + segment,
            ))
    faces.append(tuple(reversed(range(SEGMENTS))))
    last = (len(rings) - 1) * SEGMENTS
    faces.append(tuple(last + segment for segment in range(SEGMENTS)))

    mesh = bpy.data.meshes.new("MESH_HEAD_BLOCKOUT")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("HEAD_BLOCKOUT", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def rescale_references(height_m: float) -> None:
    """Calibra los planos a la altura medida; no modifica las imágenes."""
    for obj in bpy.data.objects:
        if not obj.get("is_reference"):
            continue
        image = None
        for material in obj.data.materials:
            if not material.use_nodes:
                continue
            for node in material.node_tree.nodes:
                if node.type == "TEX_IMAGE" and node.image:
                    image = node.image
                    break
        if image is None:
            continue
        width_m = height_m * image.size[0] / image.size[1]
        obj.scale = (width_m / 2.0, height_m / 2.0, 1.0)
        obj["reference_height_m"] = height_m
        obj["reference_scale_note"] = "calibrado desde proportions.json; no es medida anatómica del plano"


def render_head_views() -> list[Path]:
    C.ensure_dirs()
    scene = bpy.context.scene
    references = [obj for obj in bpy.data.objects if obj.get("is_reference")]
    outputs: list[Path] = []
    for obj in references:
        obj.hide_render = True
    for view_key, camera_name in (("front", "CAM_FRONT"), ("threequarter", "CAM_THREEQUARTER")):
        camera = bpy.data.objects[camera_name]
        camera.data.type = "ORTHO"
        camera.data.ortho_scale = HEAD_CAMERA_SCALE
        camera.data.shift_x = 0.0
        camera.data.shift_y = 0.0
        scene.camera = camera
        path = C.RENDERS_DIR / f"{CHECKPOINT}_{view_key}.png"
        scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        outputs.append(path)
    for obj in references:
        obj.hide_render = False
    return outputs


def main() -> None:
    proportions = C.load_proportions()
    if not proportions:
        raise RuntimeError("Falta docs/avatar/local/config/proportions.json")
    if proportions.get("measurement_status", {}).get("front") != "medida":
        raise RuntimeError(" proportions.json no tiene la vista frontal medida")

    front = proportions["views"]["front"]
    points = front["points"]
    image_width, image_height = front["image_size"]
    hairline = points["linea_cabello_centro"]
    chin = points["menton"]
    nose = points["nariz_punta"]
    mouth = points["boca_centro"]
    jaw_left = points["mandibula_izq"]
    jaw_right = points["mandibula_der"]
    left_eye = midpoint(points["ojo_izq_interno"], points["ojo_izq_externo"])
    right_eye = midpoint(points["ojo_der_interno"], points["ojo_der_externo"])

    vertical_px = abs(chin[1] - hairline[1])
    pixel_scale = C.FACE_HEIGHT_M / vertical_px
    mid_y = (hairline[1] + chin[1]) / 2.0
    mid_x = (left_eye[0] + right_eye[0]) / 2.0

    def to_world(point: list[float]) -> tuple[float, float]:
        """Devuelve (x, z). La profundidad no viene de la foto."""
        return ((point[0] - mid_x) * pixel_scale,
                (mid_y - point[1]) * pixel_scale)

    chin_x, chin_z = to_world(chin)
    nose_x, nose_z = to_world(nose)
    mouth_x, mouth_z = to_world(mouth)
    hair_x, hair_z = to_world(hairline)
    left_x, left_z = to_world(left_eye)
    right_x, right_z = to_world(right_eye)
    jaw_l_x, jaw_l_z = to_world(jaw_left)
    jaw_r_x, jaw_r_z = to_world(jaw_right)
    jaw_x = (jaw_l_x + jaw_r_x) / 2.0
    jaw_z = (jaw_l_z + jaw_r_z) / 2.0
    jaw_half = abs(jaw_r_x - jaw_l_x) / 2.0

    reference_height, height_source = C.reference_height(proportions)
    rescale_references(reference_height)

    skin = make_material("MAT_SKIN", (0.72, 0.51, 0.40), 0.72)
    hair = make_material("MAT_HAIR", (0.025, 0.024, 0.030), 0.55)
    eye = make_material("MAT_EYE", (0.018, 0.018, 0.022), 0.35)
    brow = make_material("MAT_BROW", (0.045, 0.032, 0.030), 0.70)
    lip = make_material("MAT_LIP", (0.52, 0.31, 0.29), 0.68)
    stubble = make_material("MAT_STUBBLE", (0.10, 0.085, 0.085), 0.85)
    metal = make_material("MAT_GLASSES", (0.58, 0.61, 0.65), 0.28, 0.85)

    rings = [
        (chin_z - 0.018, 0.006, 0.008, chin_x),
        (chin_z, 0.026, 0.030, chin_x),
        (jaw_z - 0.014, jaw_half * 0.86, 0.052, jaw_x * 0.90),
        (jaw_z, jaw_half, 0.062, jaw_x),
        (-0.012, 0.079, 0.074, nose_x * 0.80),
        (0.018, 0.082, 0.080, nose_x * 0.55),
        (nose_z, 0.081, 0.083, nose_x),
        (left_z + 0.005, 0.078, 0.081, 0.0),
        (hair_z, 0.075, 0.078, hair_x),
        (0.112, 0.070, 0.072, hair_x),
        (0.132, 0.050, 0.054, hair_x),
        (0.142, 0.010, 0.012, hair_x),
    ]
    add_head_mesh(rings, skin)
    add_ellipsoid("JAW_CHIN", (chin_x, -0.052, chin_z + 0.004), (0.030, 0.026, 0.018), skin)

    for side, x, z in (("L", left_x, left_z), ("R", right_x, right_z)):
        add_ellipsoid(f"EYE_{side}", (x, -0.086, z), (0.021, 0.006, 0.0085), eye)
        brow_z = z + 0.023
        brow_x0, brow_x1 = x - 0.023, x + 0.023
        # La ceja anatómicamente derecha es la del lado -X en este encuadre.
        if side == "L":
            add_curve(f"BROW_{side}_A", [(brow_x0, -0.088, brow_z),
                                         (brow_x0 + 0.013, -0.089, brow_z + 0.002)], brow, 0.0024)
            add_curve(f"BROW_{side}_B", [(brow_x0 + 0.020, -0.089, brow_z + 0.002),
                                         (brow_x1, -0.088, brow_z)], brow, 0.0024)
        else:
            add_curve(f"BROW_{side}", [(brow_x0, -0.088, brow_z),
                                       (x, -0.090, brow_z + 0.003),
                                       (brow_x1, -0.088, brow_z)], brow, 0.0024)

    add_ellipsoid("NOSE_BRIDGE", (nose_x * 0.85, -0.086, nose_z + 0.016),
                  (0.012, 0.010, 0.020), skin)
    add_ellipsoid("NOSE_TIP", (nose_x, -0.092, nose_z), (0.017, 0.018, 0.020), skin)

    add_ellipsoid("LIP_UPPER", (mouth_x, -0.088, mouth_z + 0.004), (0.024, 0.006, 0.004), lip)
    add_ellipsoid("LIP_LOWER", (mouth_x, -0.088, mouth_z - 0.004), (0.023, 0.006, 0.0045), lip)
    add_ellipsoid("MOUSTACHE_L", (mouth_x - 0.018, -0.090, mouth_z + 0.011),
                  (0.019, 0.005, 0.0035), stubble)
    add_ellipsoid("MOUSTACHE_R", (mouth_x + 0.018, -0.090, mouth_z + 0.011),
                  (0.019, 0.005, 0.0035), stubble)
    add_ellipsoid("GOATEE", (mouth_x, -0.086, mouth_z - 0.021), (0.016, 0.006, 0.012), stubble)

    for side, sign in (("L", -1), ("R", 1)):
        add_ellipsoid(f"EAR_{side}", (sign * 0.085, 0.005, 0.042),
                      (0.012, 0.018, 0.030), skin)
        add_ellipsoid(f"EAR_INNER_{side}", (sign * 0.089, -0.010, 0.042),
                      (0.006, 0.009, 0.016), lip)

    add_ellipsoid("HAIR_VOLUME", (hair_x, 0.004, 0.111), (0.077, 0.084, 0.045), hair)
    for side, sign in (("L", -1), ("R", 1)):
        add_ellipsoid(f"HAIR_FADE_{side}", (sign * 0.076, 0.006, 0.079),
                      (0.010, 0.062, 0.026), hair)

    for side, x, z, eye_inner, eye_outer in (
        ("L", left_x, left_z, left_eye[0], points["ojo_izq_externo"][0]),
        ("R", right_x, right_z, right_eye[0], points["ojo_der_externo"][0]),
    ):
        half_w = 0.028
        half_h = 0.017
        glass_y = -0.097
        corners = [
            (x - half_w, glass_y, z - half_h),
            (x + half_w, glass_y, z - half_h),
            (x + half_w, glass_y, z + half_h),
            (x - half_w, glass_y, z + half_h),
        ]
        add_curve(f"GLASSES_FRAME_{side}", corners, metal, 0.0016, True)
        outer_x = (eye_outer - mid_x) * pixel_scale
        add_curve(f"GLASSES_TEMPLE_{side}",
                  [(x + (-half_w if side == "L" else half_w), glass_y, z + half_h * 0.5),
                   (outer_x + (-0.012 if side == "L" else 0.012), -0.060, z + half_h * 0.5),
                   (outer_x + (-0.020 if side == "L" else 0.020), 0.000, z + half_h * 0.5)],
                  metal, 0.0012)
    left_inner_x = (points["ojo_izq_interno"][0] - mid_x) * pixel_scale
    right_inner_x = (points["ojo_der_interno"][0] - mid_x) * pixel_scale
    add_curve("GLASSES_BRIDGE",
              [(left_inner_x, -0.098, (left_z + right_z) / 2.0),
               (right_inner_x, -0.098, (left_z + right_z) / 2.0)],
              metal, 0.0014)

    for camera_name in ("CAM_FRONT", "CAM_THREEQUARTER"):
        camera = bpy.data.objects[camera_name]
        camera.data.ortho_scale = HEAD_CAMERA_SCALE
        camera.data.shift_x = 0.0
        camera.data.shift_y = 0.0
    bpy.context.scene.camera = bpy.data.objects["CAM_FRONT"]

    renders = render_head_views()

    proportions_path = C.CONFIG_DIR / "proportions.json"
    meta = C.read_json(C.CHECKPOINTS_DIR / "cp000_presentation.json") or {}
    meta.update({
        "checkpoint": CHECKPOINT,
        "based_on": "cp000_presentation.blend",
        "stage": "3 - blockout de la cabeza",
        "purpose": "Blockout estilizado de la cabeza; sin cuerpo, ropa ni texturas fotográficas.",
        "modeling_started": True,
        "body_modeled": False,
        "clothing_modeled": False,
        "proportions_source": "docs/avatar/local/config/proportions.json",
        "proportions_sha256": C.sha256(proportions_path),
        "scale": {
            "face_height_m": C.FACE_HEIGHT_M,
            "pixel_to_meter": pixel_scale,
            "vertical_reference_px": vertical_px,
            "image_size": [image_width, image_height],
            "reference_plane_height_m": reference_height,
            "reference_height_source": height_source,
            "camera_ortho_scale": HEAD_CAMERA_SCALE,
            "note": "La escala se deriva solo de línea de cabello -> mentón. La profundidad es estilizada: no existe perfil verdadero.",
        },
        "measured_landmarks_used": {
            "linea_cabello_centro": hairline,
            "menton": chin,
            "nariz_punta": nose,
            "boca_centro": mouth,
            "mandibula_izq": jaw_left,
            "mandibula_der": jaw_right,
            "ojo_izq": left_eye,
            "ojo_der": right_eye,
        },
        "profile": {
            "available": False,
            "status": "pendiente",
            "note": "No se inventaron coordenadas ni proporciones de perfil. La profundidad del blockout es una decisión estilizada.",
        },
        "features": {
            "face": "óvalo alargado con mandíbula definida",
            "eyes": "almendrados y oscuros",
            "eyebrows": "oscuras; corte en la ceja anatómicamente derecha (lado -X del encuadre)",
            "nose": "mediana, punta redondeada",
            "lips": "medianas",
            "facial_hair": "bigote ligero y chivera corta",
            "hair": "negro, laterales rebajados y volumen superior",
            "glasses": "rectangulares metálicas delgadas, sin reflejo azul",
        },
        "renders": [str(path) for path in renders],
    })

    saved = C.save_checkpoint(f"{CHECKPOINT}.blend", meta)
    print(f"CHECKPOINT {saved}")
    for render in renders:
        print(f"RENDER {render}")
    print(f"PIXEL_TO_METER {pixel_scale:.8f}")
    print(f"FACE_HEIGHT_M {C.FACE_HEIGHT_M}")
    print(f"REFERENCE_HEIGHT_M {reference_height:.4f}")
    print(f"JAW_WIDTH_M {jaw_half * 2:.4f}")
    print(f"PROFILE_AVAILABLE {meta['profile']['available']}")
    print(f"BODY_MODELED {meta['body_modeled']}")


if __name__ == "__main__":
    main()
