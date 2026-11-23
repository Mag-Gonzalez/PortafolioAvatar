# Flujo de trabajo local — Fase 1: cabeza y rostro

> **Estado: PROPUESTA TÉCNICA PENDIENTE DE APROBACIÓN (2026-11-23).**
> No se ha creado ningún script de modelado, no se ha generado geometría, no se ha abierto ningún `.blend` de trabajo y no se ha subido nada a internet.
> `uploaded_to_external_services = false` · `generation_started = false` · `platform_selected = null`.

---

## 0. Cambio de estrategia

La ruta A2 con servicios externos queda **cerrada definitivamente**. `docs/avatar/A2_RODIN_TEST_PLAN.md` y `docs/avatar/A2_PLATFORM_COMPARISON.md` se conservan solo como registro histórico de la evaluación; no se ejecutarán. Todo el trabajo de avatar se realiza en este equipo con **Blender 5.3.0** (build `02f0899d78e3`) y herramientas locales gratuitas.

---

## 1. Inspección realizada sobre las copias locales

Trabajo exclusivamente con `docs/avatar/prepared/optimized/*_2048.jpg`. Los originales de `C:\Users\USUARIO\Downloads\fotos\` no se han tocado; sus hashes siguen siendo los del `manifest.json`, y los seis `_2048.jpg` verificados coinciden con sus hashes registrados.

| Copia local | Rol confirmado en `PHOTO_MAP.md` | Brillo / contraste / detalle | Uso en esta fase |
|---|---|---:|---|
| `IMG_4582_2048.jpg` | Tres cuartos principal de rostro y busto | 112 / 69 / 13.0 | **Referencia clave** de identidad |
| `IMG_5306_2048.jpg` | Plano medio frontal / leve giro | 104 / 70 / 25.4 | Simetría, frente y cabello |
| `IMG_5309_2048.jpg` | Tres cuartos suave, expresión neutra | 95 / 65 / 18.5 | Segundo ángulo y volumen |
| `IMG_5103_2048.jpg` | Primer plano de ojos, ceja y vello | 145 / 70 / 21.7 | Detalle de ojos, ceja y bigote/chivera |
| `IMG_4553_2048.jpg` | Tres cuartos / perfil medio en espejo | 132 / 73 / 24.1 | Perfil, corte de ceja y nuca (con cautela) |
| `IMG_5053_2048.jpg` | Cuerpo entero, ropa distinta | 136 / 75 / 19.2 | **Excluida de la fase de rostro**; se reserva para proporciones corporales |

**Limitación declarada:** este modelo no puede interpretar los píxeles de las fotografías. La inspección disponible es **técnica** (resolución, exposición, contraste, detalle de bordes, hashes, orientación) y la asignación **semántica** es la que tú confirmaste en `PHOTO_MAP.md`. Por eso hay tres dudas visuales que necesito que confirmes antes de modelar (§8): el lado exacto del corte de ceja, qué tres cuartos corresponde a cada lado y qué foto muestra las orejas con claridad. No voy a inventar esos detalles.

---

## 2. Mapa foto → rasgo

| Rasgo de la fase 1 | Foto principal | Fotos de apoyo | Criterio y precauciones |
|---|---|---|---|
| Forma general de cabeza y mandíbula | `IMG_4582` | `IMG_5306`, `IMG_5309` | `4582` define el ovalo alargado y la mandíbula; `5306` aporta simetría frontal; `5309` aporta profundidad. |
| Ojos (almendrados, oscuros) | `IMG_5103` | `IMG_4582`, `IMG_5309` | `5103` es el único primer plano y tiene la mejor exposición (145), pero encuadra muy cerrado: sirve para forma y párpados, no para distancia interocular. |
| Cejas y corte de la ceja derecha | `IMG_5103` | `IMG_4582`, `IMG_4553` | `5103` muestra vello y corte; `4582` lo confirma en contexto; `4553` da el ángulo lateral. Ignorar el espejo circular y el reflejo azul. |
| Nariz (mediana, punta redondeada) | `IMG_4582` | `IMG_5309`, `IMG_4553` | `5309` define puente y punta en tres cuartos suave; `4553` ayuda a la proyección lateral, sin copiar el reflejo del espejo. |
| Labios (medianos) | `IMG_4582` | `IMG_5306`, `IMG_5103` | Expresión relajada en `5306`; `5103` solo como detalle de contorno. |
| Orejas (proporcionadas) | `IMG_4553` | `IMG_4582`, `IMG_5309` | `4553` es la única pista de perfil/nuca, pero es un reflejo parcial. **Confirmar contigo** si alguna otra las muestra mejor. |
| Bigote ligero y chivera corta | `IMG_5103` | `IMG_4582` | Vello facial con mejor exposición en `5103`; densidad y longitud se ajustan a mano para no caer en caricatura. |
| Cabello negro, línea de nacimiento y fade | `IMG_5306` | `IMG_4553`, `IMG_5309` | `5306` tiene el mayor detalle de bordes (25.4); `4553` aporta la nuca reflejada; `5309` el volumen superior. |
| Gafas rectangulares metálicas | `IMG_4582` | `IMG_5103`, `IMG_5309`, `IMG_4553` | `4582` fija proporción y montura; `5103` detalle de aro y puente; `4553` ángulo lateral. **El reflejo azul es artefacto**, no color de la montura. |
| Cadena fina con dije (accesorio de la fase) | `IMG_4582` | — | Se modela como geometría separada; no condiciona la forma del rostro. |

`IMG_5053` queda fuera de esta fase: es la única referencia corporal, pero con indumentaria distinta a la definitiva. Se usará más adelante solo para proporciones generales.

---

## 3. Técnica de modelado recomendada

**Enfoque híbrido: blockout paramétrico por script → escultura manual en Blender → detalles como objetos separados.** Es el que mejor equilibra repetibilidad (scripts), parecido (tu revisión visual) y peso de malla (presupuesto controlado).

### Capa 1 — Escenario de referencia (script `00`)
- Unidades en metros; altura de cabeza objetivo ≈ 0,22 m; eje Z arriba, rostro mirando hacia −Y.
- Las seis imágenes se cargan como **planos de referencia** (`bpy.ops.object.empty_image_add` / `load_reference_image`, ambos verificados) en vistas frontal, tres cuartos y perfil, sin copiar los archivos: se enlaza directamente `prepared/optimized/`.
- Cámara y luces de revisión fijas para que todos los checkpoints se comparen bajo la misma iluminación. Motor **Eevee** (verificado como `BLENDER_EEVEE` en esta instalación) para renders rápidos de revisión; Cycles queda como opción posterior si se habilita el addon.

### Capa 2 — Blockout paramétrico (scripts `10`–`20`)
- Malla base de cabeza/mandíbula construida con `bmesh` + `mathutils` + `numpy` (los tres disponibles dentro de Blender 5.3.0) en **quads**, simétrica en X, ~2.000–4.000 caras.
- Los valores de proporción se leen de `config/proportions.json`; nada de "números mágicos" repartidos por el código.
- Ojos, nariz, labios, orejas y cejas se bloquean como volúmenes simples con `shade_smooth`, manteniendo cada rasgo como objeto independiente.

### Capa 3 — Escultura y detalle (scripts `30`, `50`, `60`)
- `voxel_remesh` y `quadriflow_remesh` (verificados) solo como pasos temporales; se conserva siempre la malla de blockout original.
- Bigote, chivera, línea de nacimiento y fade se esculpen/ajustan localmente con materiales oscuros sutiles, sin poros hiperrealistas.
- Se usan `merge_by_distance`, `knife_project` y `uv.unwrap` (verificados) según haga falta; `rigify` queda disponible para una fase posterior de rigging, no se usa ahora.

### Capa 4 — Gafas y accesorio (script `40`)
- Aros rectangulares y puente como curvas de bajo poligonaje convertidas a malla (`bpy.ops.object.convert`, verificado), con material metálico PBR sencillo. Sin reflejo azul.
- Montura y lentes como objetos separados, para poder ocultarlos y revisar la anatomía debajo.

### Presupuesto de geometría (fase de rostro)

| Elemento | Objetivo |
|---|---:|
| Blockout de cabeza | 2–4k quads |
| Malla de trabajo tras remesh | 30–80k tris (solo intermedia) |
| Malla final de rostro (retopologizada/decimada) | 10–20k tris |
| Gafas + cadena | < 5k tris |
| **Total exportable de la fase 1** | **< 60k tris** |

Si un checkpoint supera el presupuesto, se documenta el motivo y se reduce antes de continuar. No se instalará ningún plugin: el importador/exportador glTF/GLB de Blender 5.3.0 es nativo y ya verificado.

---

## 4. Limitaciones del modelado mediante scripts

1. **Los scripts no ven las fotos.** No hay `cv2`, `mediapipe`, `face_recognition`, `dlib`, `scipy` ni `skimage` en el Python del sistema ni en el de Blender; solo `Pillow` en el sistema y `numpy`/`bmesh`/`mathutils` dentro de Blender. No hay detección automática de landmarks faciales. El análisis es técnico y la lectura semántica la aportas tú.
2. **No pueden juzgar parecido, simetría estética ni expresión.** Un script puede garantizar simetría matemática exacta, que precisamente es lo que hace una cara genérica. El ajuste fino es manual y guiado por tus revisiones.
3. **Los primitivos son punto de partida, no resultado.** Esferas y mallas paramétricas no reproducen pliegues de párpado, la hendidura del corte de ceja ni la transición puente-punta nasal sin intervención manual.
4. **No saben distinguir reflejos de color.** Los reflejos azules de `4553`, `4582` y `5103`, el espejo circular y el fondo estampado de `5306` se ignoran por decisión documentada; un script no los filtraría de forma fiable.
5. **No existe vista trasera real.** La nuca y la parte posterior del cráneo se construirán de forma anatómicamente plausible y se revisarán en el render de perfil; no son una reconstrucción fotográfica.
6. **La automatización no sustituye los gates.** Cada checkpoint se entrega para tu aprobación visual; si no hay aprobación, no se ejecuta el siguiente script.

---

## 5. Cómo conseguiremos un parecido facial convincente

1. **Medir en local, sin librerías de visión.** Crearé `tools/landmark_picker.html`, una página **sin red** que abre una foto local y permite marcar ~14 puntos (cantos de ojos, cejas, punta y base nasales, boca, mentón, pómulos, mandíbula, frente y, en perfil, oreja/nuca). Exporta `config/proportions.json`. Si prefieres no usarla, puedo preparar un formulario numérico con los mismos campos.
2. **Anclas de identidad priorizadas.** Se ajustan antes que cualquier detalle: (a) ovalo alargado y mandíbula definida, (b) corte de la ceja derecha, (c) ojos almendrados oscuros, (d) nariz mediana de punta redondeada, (e) bigote ligero + chivera corta, (f) gafas rectangulares metálicas. Si el presupuesto aprieta, se recorta volumen, no identidad.
3. **Comparación bajo las mismas condiciones.** Cada checkpoint incluye renders de frente, tres cuartos y perfil con la misma cámara e iluminación, más una composición lado a lado con las fotos de referencia. Así se detectan desviaciones de proporción antes de esculpir detalle.
4. **Estilización premium controlada.** Proporciones semi-realistas, formas limpias y silueta definida; materiales PBR sutiles; luz de estudio suave en los renders. Se prohíben expresamente la exageración cartoon (ojos enormes, mandíbula tiny, cráneo gigante) y el hiperrealismo de poros/textura de escaneo.
5. **Iteración por capas con checkpoints inmutables.** Nunca se sobrescribe un checkpoint aprobado; cada iteración parte de una copia numerada. Si un cambio empeora el parecido, se vuelve al anterior.
6. **Gates explícitos.** Tus respuestas a §8 son parte del proceso: sin el lado del corte de ceja confirmado, no se modelan cejas; sin la vista de orejas confirmada, se dejan como volumen provisional.

---

## 6. Archivos y scripts que voy a crear

Todo dentro de `docs/avatar/local/`. **Aún no existen**; se crearán solo tras tu aprobación.

```
docs/avatar/local/
├── README.md                       # este documento
├── config/
│   ├── proportions.json            # medidas relativas confirmadas / exportadas por el picker
│   └── feature_sources.json        # este mapa foto → rasgo, en formato legible por scripts
├── tools/
│   └── landmark_picker.html        # página local sin red para marcar puntos y exportar proportions.json
├── scripts/
│   ├── common.py                   # rutas, constantes, materiales y utilidades compartidas
│   ├── 00_setup_scene.py           # unidades, cámaras, luces y planos de referencia
│   ├── 10_blockout_head.py         # cráneo, frente, pómulos, mandíbula y mentón en quads
│   ├── 20_blockout_features.py     # ojos, cejas, nariz, labios y orejas (volúmenes)
│   ├── 30_refine_sculpt.py         # remesh temporal y refinado de formas
│   ├── 40_glasses.py               # gafas rectangulares metálicas + cadena
│   ├── 50_hair.py                  # cabello negro, línea de nacimiento y fade
│   ├── 60_facial_hair.py           # bigote ligero y chivera corta
│   └── 90_checkpoint.py            # guarda .blend + renders 3 ángulos + params.json + hash
├── checkpoints/
│   ├── cp000_references.blend
│   ├── cp001_head_blockout.blend
│   ├── cp002_features.blend
│   ├── cp003_sculpt.blend
│   ├── cp004_glasses.blend
│   ├── cp005_hair.blend
│   ├── cp006_face_complete.blend
│   └── renders/                    # PNG de frente / tres cuartos / perfil por checkpoint
└── exports/
    └── head_v01.glb                # solo si se aprueba la fase; NO se integra todavía en la web
```

Convenciones: los scripts solo leen `prepared/optimized/`; ningún script escribe en `prepared/`, en los originales ni fuera de `docs/avatar/local/`. Cada script es idempotente sobre su checkpoint de entrada y produce uno nuevo. Los `.blend` se guardan con `bpy.ops.wm.save_as_mainfile` (verificado). La integración en `components/sections/IntroAbout.tsx` (`id="scene-canvas-host"`) queda **fuera de esta fase** y solo se hará con un resultado aprobado.

---

## 7. Sub-etapas y puntos de revisión

| Checkpoint | Contenido | Lo que revisarás |
|---|---|---|
| `cp000_references` | Escena, luces, cámara y planos de referencia | Alineación de las fotos con la escala de cabeza y entre sí |
| `cp001_head_blockout` | Cráneo, frente, pómulos, mandíbula, mentón | Ovalo, mandíbula y proporciones generales |
| `cp002_features` | Ojos, cejas, nariz, labios y orejas | Distancia interocular, corte de ceja, punta nasal, boca |
| `cp003_sculpt` | Formas refinadas | Transiciones, párpados, pliegues, sin picos ni hundimientos |
| `cp004_glasses` | Gafas y cadena | Rectangulares, finas, alineadas, sin reflejo azul |
| `cp005_hair` | Cabello, línea de nacimiento, fade | Volumen, línea de cabello y nuca plausible |
| `cp006_face_complete` | Bigote y chivera + ajuste final | Vello ligero y conjunto reconocible, no caricatura |

Después de `cp006` se decide si se exporta `head_v01.glb`. **No se modela el cuerpo, la gorra, la camiseta ni el overol en esta fase.**

---

## 8. Decisiones que necesito de ti antes de ejecutar

1. **Corte de ceja:** el brief dice "ceja derecha", pero ¿te refieres a tu ceja derecha anatómica (la que aparece a la izquierda en una foto frontal)? ¿Qué foto lo muestra mejor, `IMG_5103` o `IMG_4582`?
2. **Tres cuartos:** ¿`IMG_4582` es tu tres cuartos derecho o izquierdo? ¿Y `IMG_5309`? Lo necesito para orientar correctamente el blockout y no especular el lado del corte.
3. **Orejas:** ¿ alguna de las seis fotos las muestra con claridad? Si no, las dejaré provisionales hasta que me lo confirmes.
4. **Método de medición:** ¿prefieres el `landmark_picker.html` local (recomendado, ~14 clics por foto) o un formulario numérico de proporciones?
5. **Aprobación de esta propuesta:** estructura de archivos, técnica híbrida, presupuesto de malla y secuencia de checkpoints.

---

## 9. Estado

- ✅ Entorno verificado: Blender 5.3.0 con `numpy`, `bmesh`, `mathutils`, `io_scene_gltf2`, `rigify`, `BLENDER_EEVEE`; operadores de remesh, smooth, unwrap, convert y guardado disponibles. Sin plugins externos.
- ✅ Seis `_2048.jpg` verificados contra `manifest.json`; originales intactos.
- ✅ Mapa foto → rasgo aprobado respetando `PHOTO_MAP.md`: corte en ceja derecha anatómica, orejas desde `IMG_4553`, medición con picker local.
- ✅ **cp000 ejecutado**: `checkpoints/cp000_references.blend`, tres renders PNG, lámina de contacto y manifiesto JSON. `modeling_started = false`: todavía no existe geometría del avatar.
- ✅ **Diagnóstico y reparación de cp000 (2026-11-23):** los materiales tenían el `Output` activo conectado al Principled blanco y la textura en un `Output` inactivo; se limpió el árbol de nodos y se dejó una sola salida `imagen → emisión → superficie`. Renders y lámina regenerados. Verificación por proyección de cámara: correlación 0,977 / 0,989 / 0,977 con las tres fotos; los tres tiles de la lámina coinciden exactamente con sus renders. Originales, `prepared/` y banderas de privacidad verificados sin cambios.
- ✅ **cp000_presentation (2026-11-23):** nuevo checkpoint sin sobrescribir el anterior. `ortho_scale` 0,34 → 0,46 y `shift = 0` en las tres cámaras, para mostrar la fotografía completa sin recorte ni lens shift; planos, rotaciones y archivos de imagen intactos. La tercera vista se llama ahora **OBLICUA** (`CAM_OBLIQUE`, `REF_OBLIQUE_4553`, render `_oblique.png`, etiqueta `OBLICUA`). No existe perfil verdadero: los landmarks y ratios de perfil del picker quedan **pendientes**, sin inventar datos. La escala de planos/marcos es presentacional, no anatómica; `manifest.json` ya lo registra.
- ⏳ Revisión visual de la lámina `cp000_presentation_contact_sheet.png` por Miguel Ángel: **pendiente**.
- ⏳ `config/proportions.json` generado con el picker: **pendiente**; mientras tanto los planos usan 0,40 m por defecto. Solo se usarán landmarks frontales hasta que exista un perfil real.
- 🔒 Ninguna foto, recorte, textura ni dato salió de este equipo. No se crearon cuentas ni se iniciaron generaciones.
