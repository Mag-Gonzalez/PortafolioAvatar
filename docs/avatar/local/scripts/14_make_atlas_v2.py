"""Genera una copia local del atlas con piel ligeramente más cálida.

No modifica el atlas original ni ninguna referencia. Salida gitignored.
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "local/references/turnaround/character_texture_atlas.png"
DST = ROOT / "local/references/turnaround/character_texture_atlas_v2.png"


def main():
    im = Image.open(SRC).convert("RGB")
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b = px[x, y]
            # Máscara conservadora de piel: cálida, suficientemente brillante y no azul de fondo.
            if r > 95 and r > g + 12 and g >= b - 4 and not (b > r + 25):
                nr = min(255, int(round(r * 1.065 + 3)))
                ng = min(255, int(round(g * 1.005)))
                nb = max(0, int(round(b * 0.935 - 2)))
                px[x, y] = (nr, ng, nb)
    im.save(DST)
    print("ATLAS V2 OK", DST)


if __name__ == "__main__":
    main()
