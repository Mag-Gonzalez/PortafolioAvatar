# Informe de refinamiento del avatar Antigravity

Fecha: 2026-11-24. Trabajo 100 % local: Blender 5.3.0 + Pillow + Next.js 16.4.6.
No se usó ningún servicio externo ni se subió `docs/avatar/source/avatar_complete.jpg` a ningún sitio.

## 1. Limitación declarada

El modelo no puede interpretar imágenes de forma directa. La comparación se hizo con análisis local de píxeles
(paleta, recortes, mapas ASCII, perfiles de silueta) sobre la referencia y los turnarounds ya generados por
Antigravity. Las conclusiones visuales son por tanto **verificables por píxel**, pero requieren revisión humana final.

## 2. Base y checkpoints

| Checkpoint | Estado | Descripción |
|---|---|---|
| `cp004_character_v3` | Base, **no modificado** | Versión funcional de Antigravity. Sus notas (`gafas`, `chivera`, `collar`, `polo UNTERGOLD`, `jeans`, `plataforma cian`) se trataron como sospechosas y se contrastaron con píxeles locales. |
| `cp005_character_v4` | Nuevo | Elimina accesorios no verificables, estrecha cuello, neutraliza jeans/calzado, ajusta luces y roughness. |
| `cp006_character_v5` | **Final** | Mandíbula ensanchada, cuello/clavículas estrechados, atlas de piel cálido (copia local), mallas skinneadas parentadas al armature. |

Scripts: `13_build_cp005_character_v4.py`, `14_make_atlas_v2.py`, `15_build_cp006_character_v5.py`.
Ningún checkpoint anterior fue sobrescrito; los `.blend1` son copias de seguridad automáticas de Blender.

## 3. Cambios aplicados

- **Silueta**: cuello más estrecho, sienes/mandíbula ajustadas según los perfiles medidos de la referencia.
- **Rostro**: se retiraron las lentes de `cp004`, que cubrían los ojos y degradaban los ojos azules del atlas.
- **Accesorios**: retirados collar de cuentas y plataforma cian; no hay evidencia de píxel que los justifique.
  No se añadió barba, bigote, gafas ni prendas nuevas.
- **Materiales/colores**: `roughness` de piel 0.68, specular 0.28, SSS 0.035; jeans y calzado neutros;
  atlas v2 con piel más cálida y menos azul (copia derivada, jamás el original).
- **glTF**: las mallas con modifier `ARMATURE` ahora están parentadas al `Armature`, con lo que desaparecieron
  las advertencias de parentesco en la exportación.

## 4. Conservado

- `Armature` con **14 huesos** y hueso `Head` (usado por el seguimiento de ratón).
- Animación **`Idle_Animation`**.
- Material `MAT_Avatar_Atlas` y malla `UpperBody` con UV de 4 cuadrantes.
- Cámaras `Cam_front`, `Cam_left_profile`, `Cam_right_profile`, `Cam_three_quarter`, `Cam_back`, `Cam_full`.
- `HeroAvatar` y el diseño del hero quedaron intactos: no se rediseñó el portafolio.

## 5. Validación del GLB final

Archivo: `public/assets/avatar/avatar.glb` (copia de `docs/avatar/local/exports/cp006_character_v5.glb`).

```
magic 0x46546cglTF · versión 2 · 4.157.136 bytes (coincide con el tamaño declarado)
animations = ['Idle_Animation']
skins = 1 · joints = [14]
meshes = 8 · materials = 4 · images = 1
nodo 'Head' presente
```

Integración comprobada en navegador real (`localhost:3003` durante la validación):

- `GET /assets/avatar/avatar.glb` → **200 completado**, sin errores en consola.
- Canvas R3F inicializado con `three.js r187` y dimensiones reales (1120 × 958).
- `AvatarStage` se monta dentro de `.scene-canvas-host` y respeta el fundido GSAP del scroll.
- `npx tsc --noEmit`, `npm run lint` y `npm run build` → correctos.

## 6. Integración React

- `components/sections/IntroAbout.tsx`: importa `AvatarStage` y lo monta dentro de
  `<div className="scene-canvas-host" ref={backdrop} aria-hidden="true">`. Se conserva `ref={backdrop}`
  para la animación GSAP existente.
- `components/three/AvatarScene.tsx`: `MODEL_URL = "/assets/avatar/avatar.glb"`, `SceneSetup` sin sondas
  HTTP y `GLTFCharacter` usando esa ruta. Se eliminó la ruta inexistente `/models/avatar.glb`, que producía
  un 404 en consola.
- `app/globals.css`: estilos mínimos para `.scene-canvas` / `.scene-fallback` (el canvas antes colapsaba a 0 px).

## 7. Entregables

- `docs/avatar/local/checkpoints/cp005_character_v4.blend` + `.json`
- `docs/avatar/local/checkpoints/cp006_character_v5.blend` + `.json` **(final)**
- `docs/avatar/local/checkpoints/renders/cp006_character_v5_{front,left_profile,right_profile,three_quarter,back,full}.png`
- `docs/avatar/local/checkpoints/renders/cp006_character_v5_comparison.png`
- `docs/avatar/local/checkpoints/renders/cp006_character_v5_portfolio_about.png` (captura dentro del portafolio)
- `docs/avatar/local/exports/cp006_character_v5.glb` y `public/assets/avatar/avatar.glb`

## 8. Diferencias pendientes y decisiones

- Piel en el recorte frontal: `cp006` = **(194, 167, 158)** frente a referencia = **(206, 164, 148)**.
  Se valió un `cp007` con más calor, pero se descartó: el atlas ya fue corregido una vez y un nuevo incremento
  riesgo sobre-saturar y dejaría obsoleta la captura del portafolio. Queda como ajuste opcional futuro.
- El metro de ojos azules en renders es menor que en la referencia (143 vs 649 px en el recorte medido),
 因為 la iluminación de la escena web no es idéntica a la de los renders de Blender.
- Piernas y calzado se mantienen neutros porque la referencia está recortada por la cintura.
- Los archivos de referencia, checkpoints, exports y `public/assets/avatar/` siguen excluidos por `.gitignore`.

## 9. Estado Git

No se hizo commit: el árbol ya tenía cambios previos del usuario. Los cambios nuevos de este trabajo son
`components/three/AvatarScene.tsx`, `components/sections/IntroAbout.tsx`, `app/globals.css` y los scripts
`13`–`15`. Los binarios y derivados privados permanecen ignorados.

## 10. Corrección de presentación en la web

El doble personaje no estaba en el GLB: `IntroAbout.tsx` montaba a la vez `HeroAvatar` (PNG) en
`.intro-avatar-mount` y `AvatarStage` (GLB) en `.scene-canvas-host`. Además, las tres tarjetas se situaban
sobre el centro del lienzo y se solapaban con él en 20.160 + 27.300 + 54.900 px².

Cambios aplicados, sin editar geometría, materiales, rig ni animación:

- `IntroAbout.tsx`: eliminado el montaje del PNG y su GSAP asociado; queda una sola instancia del GLB.
- `AvatarScene.tsx`: cámara recentrada (`fov` 36/38, `z` 3.7/4.1), escala 1.34 escritorio / 1.22 móvil,
  posición y sombra de contacto ajustadas al tamaño real del modelo (~1.63 u de alto) e iluminación de
  estudio más clara en rostro y silueta.
- `app/globals.css`: canvas limitado al 60 % derecho en escritorio y al 52 % superior en móvil; paneles
  reubicados en la columna izquierda y en una banda inferior compacta, respectivamente.
- `lib/sceneState.ts`: `rotationY` de -0.5 a -0.32 para un tres cuartos más frontal.

Mediciones verificadas en navegador local:

| Vista | Antes | Después |
|---|---|---|
| Escritorio 1440×900 | 1 canvas 1425×900 + 1 PNG 447×590; solape 102.360 px² | 1 canvas 855×900 en x=570; 0 PNG; solape **0 px²**; progreso 51 % |
| Móvil 390×844 | paneles centrados sobre la escena | canvas 390×439; paneles desde y=607; solape **0 px²**; progreso 59 % |

Capturas nuevas: `renders/cp007_presentation_desktop.png` y `renders/cp007_presentation_mobile.png`
(con sus `_metrics.json` y `_console.json`). El prefijo `cp007` identifica solo esta secuencia de capturas;
**no existe un checkpoint cp007 ni un GLB sustituto**: el sitio sigue cargando
`public/assets/avatar/avatar.glb` de `cp006` (4.157.136 bytes, SHA-256 `25E9140E…A816C49E`).

`npx tsc --noEmit`, `npm run lint` y `npm run build` vuelven a pasar. La consola no registra errores de
aplicación; solo advertencias de rendimiento del controlador WebGL al capturar con SwiftShader.
