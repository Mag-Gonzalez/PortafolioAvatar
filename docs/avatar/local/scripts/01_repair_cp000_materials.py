"""Reparación quirúrgica de cp000: conecta la textura a la salida activa.

No reconstruye cámaras, luces ni planos. Solo reemplaza el árbol de nodos de
los tres materiales de referencia y vuelve a renderizar.

Uso:
  blender --background docs/avatar/local/checkpoints/cp000_references.blend \
    --python docs/avatar/local/scripts/01_repair_cp000_materials.py
"""
from __future__ import annotations

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy
import common as C


def main() -> None:
    meta_path = C.CHECKPOINTS_DIR / "cp000_references.json"
    meta = C.read_json(meta_path) or {}

    repaired = []
    for obj in bpy.data.objects:
        if not obj.get("is_reference"):
            continue
        for slot in obj.material_slots:
            material = slot.material
            if material is None or material.node_tree is None:
                continue
            image_nodes = [n for n in material.node_tree.nodes if n.bl_idname == "ShaderNodeTexImage"]
            if not image_nodes or image_nodes[0].image is None:
                raise RuntimeError(f"Sin imagen de textura en {material.name}")
            image = image_nodes[0].image
            C.build_emission_nodes(material, image)
            active = [n for n in material.node_tree.nodes
                      if n.bl_idname == "ShaderNodeOutputMaterial" and n.is_active_output]
            assert len(active) == 1, f"Salidas activas incorrectas en {material.name}"
            surface = active[0].inputs["Surface"]
            assert surface.links and surface.links[0].from_node.bl_idname == "ShaderNodeEmission"
            repaired.append((obj.name, material.name, image.name))

    if len(repaired) != 3:
        raise RuntimeError(f"Se esperaban 3 materiales reparados; hay {len(repaired)}")

    meta["material_repair"] = {
        "repaired_at_utc": C.utc_now(),
        "cause": "El Output activo seguía conectado al Principled BSDF por defecto; la textura estaba en un Output inactivo.",
        "fix": "Se limpió el árbol de nodos y se dejó una sola salida activa: imagen -> emisión -> superficie.",
        "materials": [{"object": o, "material": m, "image": i} for o, m, i in repaired],
    }
    saved = C.save_checkpoint("cp000_references.blend", meta)
    renders = C.render_views("cp000")
    print(f"REPAIRED {repaired}")
    print(f"SAVED {saved}")
    for render in renders:
        print(f"RENDER {render}")


if __name__ == "__main__":
    main()
