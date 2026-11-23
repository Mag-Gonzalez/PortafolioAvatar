# Guía de Integración del Avatar 3D (GLB / GLTF)

Este directorio está preparado para recibir tu modelo 3D personalizado. Una vez colocado el archivo con el nombre `avatar.glb`, la escena de Three.js lo detectará automáticamente y lo integrará en el entorno de trabajo con seguimiento de cabeza, sombras suaves y animaciones.

## 1. Archivo esperado

* **Ruta:** `public/models/avatar.glb`
* **Formato:** Formato binario `.glb` (glTF 2.0).

---

## 2. Especificaciones recomendadas para Web (Optimización)

| Parámetro | Recomendación |
| :--- | :--- |
| **Presupuesto de polígonos** | 10.000 a 35.000 triángulos (máx. 50k) |
| **Materiales** | PBR Estándar (BaseColor, Roughness, Metalness, Normal) |
| **Texturas** | 1024x1024 o 2048x2048 empaquetadas en WebP/JPEG dentro del GLB |
| **Escala del modelo** | Altura aproximada de 1.6m a 1.8m (escala 1 unidad = 1 metro) |
| **Orientación** | Frente hacia el eje +Z, cabeza hacia +Y (Y-Up estándar) |
| **Compresión** | Opcional Draco o Meshopt (reduce drásticamente el peso a < 3MB) |

---

## 3. Esqueleto y Rigging (Para animaciones e interacción)

Si deseas que el personaje gire la cabeza siguiendo el cursor del ratón o reproduzca animaciones (como teclear o respirar):

* **Huesos reconocidos automáticamente:**
  * `Head` o `mixamorigHead` (para rotación de la mirada)
  * `Neck` o `mixamorigNeck`
  * `Spine` o `mixamorigSpine`
* **Animaciones:** Cualquier clip de animación guardado dentro del archivo `.glb` (ej. `Idle`, `Typing`) se reproducirá en bucle con mezcla suave (`crossfade`).

---

## 4. Opciones recomendadas para obtener tu avatar

1. **Modelado en Blender / ZBrush (Máxima fidelidad):**
   * Crear el personaje estilizado con tus rasgos físicos (corte fade, gafas sin montura, perilla, polo negro y cadena).
   * Añadir armature humano básico y exportar con `File -> Export -> glTF 2.0 (.glb)`.
2. **Generación 3D a partir de fotos:**
   * **MetaPerson Creator (Avatar SDK):** Genera avatares humanos estilizados y rigged en `.glb` a partir de una selfie.
   * **Meshy.ai / Tripo 3D:** Generación de malla 3D y texturas PBR a partir de imagen.
   * **Mixamo (Adobe):** Para aplicar animaciones de tecleo o respiración gratuitas a cualquier modelo FBX/OBJ y exportarlo como GLB.
3. **Modelos de librerías estilizadas (Sketchfab / CGTrader / Kenney):**
   * Buscar personajes de tipo *"stylized developer low poly"* o *"cartoon programmer"*.

