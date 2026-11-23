# PHOTO_MAP — asignación confirmada

Estado: **roles asignados por Miguel Ángel el 2026-11-23** tras revisar `contact-sheet-prepared.jpg`.

> Privacidad (sin cambios): ninguna imagen, recorte, textura ni modelo ha salido de este equipo.
> `uploaded_to_external_services = false` · `generation_started = false`.
> No se ha iniciado Meshy, Hyper3D ni ninguna otra plataforma de generación 3D.

## Asignación de roles por fotografía

| Archivo | Vista / rol asignado | Observaciones |
| --- | --- | --- |
| `IMG_4553.jpeg` | Vista tres cuartos / perfil medio en espejo | Referencia de ángulo lateral, corte en ceja derecha y reflejo parcial de nuca/cabello. Tiene reflejo azul en lentes y fondo con espejo circular. |
| `IMG_4582.jpeg` | Vista tres cuartos principal de rostro y busto | **Referencia clave** de rasgos faciales, mandíbula, ceja derecha, gafas rectangulares y cadena fina. Leve reflejo azul en lentes. |
| `IMG_5053.jpeg` | Cuerpo entero de pie | Única referencia de proporción corporal general y postura. Toma lejana con vestimenta distinta al outfit final del avatar. |
| `IMG_5103.jpeg` | Primer plano cercano de rostro/ojos/gafas | Apoyo para detalle facial, ceja derecha y vello facial. Encuadre muy cerrado y con reflejo azul en lentes. |
| `IMG_5306.jpeg` | Plano medio frontal / leve giro | Apoyo para simetría frontal del rostro y expresión relajada. Postura reclinada y fondo con estampado. |
| `IMG_5309.jpeg` | Plano medio tres cuartos suave / expresión neutra | Apoyo complementario para rasgos faciales, proporción de gafas y postura. |

## Notas técnicas

- **Vestuario final ausente:** ninguna de las seis fotografías incluye el vestuario final definitivo del avatar (gorra negra, camiseta oversized y overol de jean claro). La indumentaria deberá construirse en la etapa 3D y no puede inferirse directamente de estas tomas; `IMG_5053.jpeg` en particular usa una vestimenta distinta.
- **Reflejos en lentes:** hay reflejos de pantalla de tono azul en varias tomas (`IMG_4553.jpeg`, `IMG_4582.jpeg`, `IMG_5103.jpeg`). Deben tratarse como artefactos a limpiar en la fase de escultura/texturizado, no como color real de las gafas rectangulares metálicas.
- **Espejo y fondo:** `IMG_4553.jpeg` contiene un espejo circular y un reflejo parcial de nuca/cabello; `IMG_5306.jpeg` tiene fondo con estampado. No son elementos del avatar.
- **Esculpido y limpieza final:** se realizará localmente en **Blender 5.3.0** (verificado: build `02f0899d78e3`). Hasta ahora no se ha generado ni importado ningún modelo 3D.
- Derivados preparados: `cleaned/` mantiene la orientación corregida y carece de EXIF/GPS; `optimized/` conserva la misma relación de aspecto en tamaños 2048 y 1024 px.

## Archivos disponibles para la revisión

| Original | Limpio (sin EXIF/GPS) | 2048 px | 1024 px |
| --- | --- | --- | --- |
| `IMG_4553.jpeg` | `IMG_4553.jpg` | `IMG_4553_2048.jpg` | `IMG_4553_1024.jpg` |
| `IMG_4582.jpeg` | `IMG_4582.jpg` | `IMG_4582_2048.jpg` | `IMG_4582_1024.jpg` |
| `IMG_5053.jpeg` | `IMG_5053.jpg` | `IMG_5053_2048.jpg` | `IMG_5053_1024.jpg` |
| `IMG_5103.jpeg` | `IMG_5103.jpg` | `IMG_5103_2048.jpg` | `IMG_5103_1024.jpg` |
| `IMG_5306.jpeg` | `IMG_5306.jpg` | `IMG_5306_2048.jpg` | `IMG_5306_1024.jpg` |
| `IMG_5309.jpeg` | `IMG_5309.jpg` | `IMG_5309_2048.jpg` | `IMG_5309_1024.jpg` |

## Rasgos a conservar (recordatorio del brief)

- Rostro ovalado/alargado, mandíbula definida.
- Cejas oscuras con corte, ojos oscuros almendrados, nariz mediana de punta redondeada.
- Labios medios, perilla/chivera corta y bigote ligero.
- Fade lateral/nuca con volumen, gafas rectangulares metálicas.
- Cadena fina con dije, gorra negra, camiseta amplia y overol de mezclilla claro.

## Próximo paso

- **Estrategia A2 cerrada definitivamente (2026-11-23):** no se usará ningún servicio externo para procesar estas fotos. El flujo vigente es local con Blender 5.3.0 y está descrito en `docs/avatar/local/README.md`.
- La fase 1 se limita a cabeza y rostro; las asignaciones de esta tabla se respetan sin modificar los originales.
- El plan local está **pendiente de aprobación**; no se ha creado geometría ni abierto ningún `.blend` de trabajo.
- Todo el material permanece exclusivamente en este equipo y `manifest.json` conserva `uploaded_to_external_services = false` y `generation_started = false`.
