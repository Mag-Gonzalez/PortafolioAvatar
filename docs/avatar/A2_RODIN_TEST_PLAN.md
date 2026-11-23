# A2 — Plan de prueba controlada con Rodin

> **EN DESUSO (2026-11-23):** el usuario ha decidido construir el avatar completamente en local con Blender 5.3.0. Este documento se conserva solo como registro histórico de la evaluación de A2; **no se ejecutará**. El flujo vigente se define en `docs/avatar/local/README.md` (por crear).

**Fecha:** 2026-11-23  
**Estado:** plan propuesto. **No se ha creado cuenta, comprado plan, subido imagen ni iniciado generación.**  
**Bandera de privacidad intacta:** `uploaded_to_external_services = false` · `generation_started = false`.  
**Objetivo visual:** personaje 3D **estilizado premium**, con identidad reconocible, no hiperrealista y no genérico, con el vestuario definido (gorra negra, camiseta oversized, overol de jean claro, gafas metálicas rectangulares y cadena fina con dije).

---

## 1. Verificación de privacidad — lo que ya está confirmado

| Extremo | Conclusión verificada | Fuente oficial |
|---|---|---|
| ¿Existe un compromiso de no entrenamiento? | **Sí, pero solo para la API.** La *Data Retention Policy* (vigente 2026-08-03) dice literalmente que los *request payloads* —prompts y archivos subidos— y el output **no se usan para entrenar modelos**. | `docs.hyper3d.ai/en/legal/data-retention-policy` |
| ¿Y en la webapp? | **No asumir que aplica.** La política de retención se declara explícitamente *API-specific* y dice que no sustituye a la Privacy Policy. En los Términos generales, Hyper3D se reserva usar *Prompts and Output* para “proveer, mantener y mejorar el servicio y realizar/apoyar investigación”, con revisión automatizada o humana y proveedores externos. No aparece una cláusula equivalente de “no entrenamiento” para la webapp. | `docs.hyper3d.ai/en/legal/data-retention-policy`; `hyper3d.ai/legal/terms` §5 |
| ¿Qué cubre el modo “Private”? | En Rodin, marcar el Output como privado significa que **otros usuarios no tienen acceso** y que Hyper3D “no usará dicho Output salvo para mostrarlo en tu cuenta”. Es una garantía sobre el **resultado**, no sobre las imágenes de entrada. Disponibilidad: Free = hasta 10 activos privados; Creator = ilimitados. | `hyper3d.ai/legal/terms` §5(b); `hyper3d.ai/pricing` |
| ¿Cuánto conserva la API? | **7 días en sistemas activos** y borrado automático al vencer. El output de API no se publica en *public ASSETS* y no se comparte con terceros para fines propios. Excepciones: obligación legal, metadatos de auditoría de seguridad/abuso y copias temporales en backups protegidos. | `docs.hyper3d.ai/en/legal/data-retention-policy` |
| ¿Y la webapp? | La Privacy Policy declara que los datos introducidos se conservan **hasta que los retiras, borras o desactivas la cuenta**; entonces se eliminan o anonimizan, con excepciones legales, financieras y de auditoría. No se encontró un plazo fijo publicado. | `hyper3d.ai/legal/privacy` §4 |
| ¿Quién procesa? | Para el servicio en inglés, **Deemos Corporation**, con dirección en Wilmington, Delaware, es el responsable/controlador. La Privacy Policy prevé acceso de afiliados, proveedores de servicios bajo contrato y transferencias internacionales con salvaguardas. ⚠️ No se publicó una lista de subprocesadores. La *Copyright License*, en cambio, nombra a Deemos Technology (Shanghai) y se rige por ley de la RPC: hay que aclarar qué entidad aplica. | `hyper3d.ai/legal/terms`; `hyper3d.ai/legal/privacy` §3, §9; `hyper3d.ai/legal/copyright-license` |
| ¿Cómo pedir eliminación? | No hay un endpoint público de borrado en la API; la vía documentada es el borrado automático a 7 días. Para solicitudes manuales: `hello@deemos.com` (privacidad) o `hello@help.hyper3d.ai` (soporte). Hay que pedir **confirmación por escrito**, plazo de backups y borrado de la cuenta si se crea. | `hyper3d.ai/legal/privacy` §7, §13; documentación de API |
| ¿Derechos comerciales del resultado de Rodin? | Los Términos §5(b) dicen: *“If you use Rodin to generate Output, we will not limit your use of such Output”*, sujeto a los Términos, la ley y condiciones de terceros. La página de precios indica **“Unlimited export and any use”** desde Creator. No hay garantía de copyrightabilidad ni de no infracción: la responsabilidad sobre los prompts es nuestra. | `hyper3d.ai/legal/terms` §5(b); `hyper3d.ai/pricing` |
| ¿Formato de exportación? | **GLB** es el formato por defecto de la API; también FBX, OBJ, USDZ y STL. | `docs.hyper3d.ai/en/api-specification/rodin-gen2-5`; `docs.hyper3d.ai/en/api-specification/download-results` |
| ¿Compatibilidad con Blender 5.3.0? | **Verificado localmente:** Blender 5.3.0 (build `02f0899d78e3`) expone `bpy.ops.import_scene.gltf` y `bpy.ops.export_scene.gltf`. La importación/exportación GLB es nativa; **no hace falta plugin**. | Comando local `--background --python-expr` ejecutado el 2026-11-23 |

### Conclusión de privacidad

**La única modalidad que cumple hoy, con documento público, la condición obligatoria de “no entrenamiento + borrado a 7 días” es la API de Rodin.** La webapp queda descartada para nuestras fotos salvo respuesta escrita en contrario del proveedor.

---

## 2. Lo que todavía requiere respuesta del proveedor (bloqueante)

Antes de cualquier subida hay que enviar estas preguntas a `hello@deemos.com` y `hello@help.hyper3d.ai`, y guardar la respuesta en este mismo documento:

1. **Confirmación de alcance:** ¿la *Data Retention Policy* de 7 días y la prohibición de entrenamiento se aplican a todos los endpoints de generación de `api.hyper3d.com/api/v2/rodin`, incluidas las imágenes enviadas en `multipart/form-data` y los metadatos de la tarea?
2. **Prompts:** la política dice “prompts y archivos subidos”. Confirmar que el campo `prompt` y cualquier etiqueta de vista también quedan excluidos de entrenamiento y de revisión humana no necesaria.
3. **Subprocesadores:** lista de proveedores que pueden tocar los archivos (almacenamiento, inferencia, moderación, analítica) y países de procesamiento. ¿Hay alguno fuera de la UE/EE. UU.?
4. **Borrado manual:** ¿existe forma de borrar inmediatamente una tarea y sus outputs? Si no, confirmar que el borrado a 7 días también cubre backups y en cuánto tiempo desaparecen de ellos.
5. **Webapp (por si se reconsidera):** ¿los archivos subidos a Rodin Workspace se usan para entrenar o fine-tuning? ¿El toggle “Private” afecta solo a visibilidad o también a uso de datos?
6. **Entidad contractual y ley aplicable:** para un usuario en España/UE, ¿la contraparte es Deemos Corporation (Delaware) o Deemos Technology (Shanghai)? ¿Qué ley rige el uso comercial?
7. **Uso comercial de una cara recognizable:** confirmar por escrito que un output de Rodin generado en plan Creator o Business puede publicarse en un portafolio público, tratándose del propio rostro del usuario y con su consentimiento.
8. **Acceso API en Creator:** la documentación indica que Creator incluye *Basic API access* solo para `Gen-2.5-Extreme-Low` y `Gen-2.5-Low`. ¿Es posible contratar un add-on para usar `Gen-2.5-Medium` sin pasar a Business? (Ver §3).

**Regla de gate:** si no hay respuesta escrita a 1, 3, 4 y 7, no se sube nada.

---

## 3. Decisión de plan y modalidad (pendiente de tu elección)

| Opción | Modalidad | Privacidad | Calidad esperada | Coste |
|---|---|---|---|---|
| **A — Recomendada** | API con plan **Business** (Full API access), `Gen-2.5-Medium` | Garantía documentada de no entrenamiento y 7 días | Suficiente para evaluar identidad y estilo | $120/mes o $1.152/año ($96/mes) |
| B | API con plan **Creator** (Basic access), solo `Gen-2.5-Low` / `Extreme-Low` | Misma garantía de API | Probablemente insuficiente para juzgar parecido facial | $30/mes o $288/año ⚠️ el help center dice $280/año: verificar |
| C | Webapp Rodin, `Medium`, vista previa gratis hasta confirmar | **No verificada** para entrenamiento | Buena | Desde $0, pero no cumple la condición de privacidad |

Notas:

- El coste real de la generación es pequeño: **0,5 créditos** por generación base Gen-2.5, +0,5 si `Extreme-High`, +2,0 si `texture_mode=extreme-high`. El coste relevante es la **suscripción**, no la generación.
- En la webapp, `Medium` y niveles inferiores permiten previsualizar sin cargo y solo cobran al confirmar; en API se cobra al enviar (0,5 créditos).
- Creator incluye multi-imagen, export ilimitado, “any use” y activos privados ilimitados; Business añade Full API, texturas de alta resolución y High-Poly Quads.
- ⚠️ Hay una discrepancia menor en el precio anual de Creator entre la página de precios ($288) y el help center ($280). Verificar en checkout.

**Recomendación:** Opción A. Si el coste de Business no se justifica para una sola prueba, la alternativa honesta es la Opción B asumiendo que el resultado solo servirá como “smoke test” técnico, no como evaluación de parecido.

---

## 4. Inventario exacto de datos que se enviarían (solo si se autoriza)

**Archivos (3):**

| Archivo | Rol | Tamaño aproximado | Uso en la prueba |
|---|---|---:|---|
| `prepared/optimized/IMG_4582_2048.jpg` | Tres cuartos principal de rostro y busto | ~774 KB | Referencia clave de identidad |
| `prepared/optimized/IMG_5306_2048.jpg` | Plano medio frontal / leve giro | ~1,13 MB | Simetría y frente |
| `prepared/optimized/IMG_5309_2048.jpg` | Plano medio tres cuartos suave | ~1,01 MB | Segundo ángulo facial |

Total ≈ **2,5 MB**. Ya están sin EXIF/GPS y con orientación normalizada. Sus nombres (`IMG_####`) no contienen datos personales. **No se enviarían** los originales, el manifiesto, el contact sheet ni las copias `cleaned/`.

**Texto y metadatos:** el prompt (§6), los parámetros de generación (`tier`, `quality`, `mesh_mode`, `texture_mode`, formato GLB), la clave de API, el correo de la cuenta y los metadatos técnicos de la petición (IP, logs, dispositivo) que la Privacy Policy ya declara que recopila.

**Datos que NO se enviarán:** nombre real, apellidos, ubicación, teléfono, correo en el prompt, enlaces al portafolio, documentos ni ningún otro archivo.

---

## 5. Fotografías necesarias y redundantes

### Incluir en la prueba A

1. **`IMG_4582_2048.jpg`** — imprescindible. Es la referencia clave de mandíbula, ceja con corte, gafas y cadena.
2. **`IMG_5306_2048.jpg`** — imprescindible. Aporta la única aproximación a vista frontal y simetría.
3. **`IMG_5309_2048.jpg`** — útil. Segundo tres cuartos con expresión neutra; ayuda a desambiguar nariz y órbitas.

### Excluir de la prueba A

| Archivo | Motivo |
|---|---|
| `IMG_5103_2048.jpg` | Primer plano extremo de ojos/gafas, con reflejo azul. Aporta textura, no geometría; puede sobreajustar los lentes y generar artefactos. |
| `IMG_4553_2048.jpg` | Espejo circular, reflejo de nuca y reflejo azul en lentes. Introduce evidencia conflictiva: el documento oficial de Rodin recomienda “remove conflicting evidence”. |
| `IMG_5053_2048.jpg` | Única referencia corporal, pero con ropa distinta a la final. En una prueba centrada en rostro y estilo, mezclarla puede transferir indumentaria equivocada. Se reserva para la variante B. |

### Variante B (opcional, solo si A supera el gate)

Añadir `IMG_5053_2048.jpg` como cuarta imagen para evaluar proporciones corporales, con prompt de cuerpo completo. Riesgo asumido: ropa conflictiva. No se ejecuta en la primera prueba.

> Limitación conocida: no existe ninguna vista trasera real. El modelo tendrá que inventar la espalda; eso es aceptable porque la limpieza final se hará en Blender.

---

## 6. Prompt de generación

Se enviará en inglés. Prioriza identidad → estilo → vestuario, en ese orden, para que la ausencia del outfit final no degrade el parecido.

```text
Primary goal: preserve the exact facial identity of the person in the reference photos.
This is a stylized premium 3D character, not a hyperrealistic scan and not a generic avatar.
Semi-realistic proportions, clean sculpted forms, refined premium finish, subtle PBR materials,
soft studio lighting, tasteful stylization, crisp silhouette, no toy-like or cartoon exaggeration.

Faithful likeness to preserve: oval elongated face, defined jawline, dark eyebrows with a small
cut/gap on one side, dark almond-shaped eyes, medium nose with rounded tip, medium lips,
short neat goatee and light mustache, short fade on sides and nape with volume on top.

Wardrobe (secondary, may be rebuilt later): black cap, oversized t-shirt, light-wash denim
overalls, thin rectangular metal-frame glasses, thin chain with a small pendant.

Neutral relaxed expression, facing slightly forward, clean simple background, full subject
visible, no cropping.

Avoid: blue screen reflections in the lenses, mirror or circular mirror, patterned background,
text, logos, extra limbs, fused fingers, distorted eyes, exaggerated cartoon proportions,
photorealistic skin pores, baked lighting.
```

**Notas de uso:**

- En la API Gen-2.5, la **primera imagen se usa para generar el material**; por eso `IMG_4582_2048.jpg` va primero.
- En la API Gen-2.5 no hay un campo documentado para etiquetas de dirección de vista (solo aparece en el workspace y en Gen-1/1.5); no inventaremos etiquetas. Si se usara la webapp, se etiquetarían como `Front`, `Front Right` y `Front Left`, previa confirmación visual del lado del corte de ceja.
- El prompt es una guía, no un control estricto: la fidelidad vendrá sobre todo de las imágenes.

---

## 7. Parámetros de la prueba A

| Parámetro | Valor | Motivo |
|---|---|---|
| Endpoint | `POST https://api.hyper3d.com/api/v2/rodin` | Único con garantía de privacidad |
| `tier` | `Gen-2.5-Medium` | Equilibrio estructura/detalle; requiere Full API access |
| `images` | 3 archivos `_2048.jpg`, en el orden indicado | Mínimo útil; menos exposición y menos evidencia conflictiva |
| `prompt` | El de §6 | Identidad primero |
| `mesh_mode` | `Raw` | Necesario para Fast mode y para esculpir después |
| `quality` | `medium` | Coherente con el tier |
| `texture_mode` | `medium` (default del tier) | Sin coste extra; evita 6K/12K |
| `uhd_texture` | `false` | Evita 4K/8K innecesarios en una prueba |
| `addons` | `[]` | Sin BANG, Smart UV ni 12K |
| `geometry_file_format` | `glb` | Fast mode + importación directa en Blender |
| `geometry_instruct_mode` | omitir | La opción `faithful` está marcada como experimental |
| Resultados | 1, sin batch 5×/10× | Prueba pequeña y controlada |
| Redos | 0 iniciales | Solo si el gate lo autoriza |
| Coste estimado | 0,5 créditos | Según documentación oficial de Gen-2.5 |

Se cumplen las condiciones de *Fast mode*: tier distinto de Extreme-High, formato GLB, `mesh_mode=Raw` y `quality_override <= 20000`.

---

## 8. Criterios de evaluación

Ponderación sobre 100. Se evaluará con el modelo rotado en Blender y comparado lado a lado con las tres referencias.

| Criterio | Peso | Qué se comprueba |
|---|---:|---|
| Parecido con Miguel | 30 | Mandíbula ovalada/alargada, corte de ceja, ojos almendrados oscuros, punta nasal redondeada, labios, perilla/chivera y bigote |
| Calidad del rostro | 15 | Simetría, ojos no hundidos ni fusionados, expresión neutra, sin rostro plano o asimétrico |
| Cabello y fade | 10 | Fade lateral/nuca, volumen superior, línea de cabello coherente bajo la gorra |
| Gafas | 10 | Rectangulares, montura metálica fina, alineadas con los ojos, sin reflejo azul ni fusión con la piel |
| Ropa y accesorios | 10 | Gorra negra, camiseta oversized, overol de jean claro, cadena fina con dije; distinguibles y separables |
| Geometría | 10 | Silueta limpia, sin agujeros ni picos, espalda plausible, transiciones correctas, topología retopologizable |
| Texturas y materiales | 10 | Mapas PBR coherentes (color, normal, roughness, metallic), sin luz horneada, UV sin solapamientos graves |
| Rigging / animación | 5 | Simetría útil, posibilidad de A/T-pose, partes separables (ojos, gafas, cadena) |

### Umbrales de decisión

- **Aceptar como base:** ≥ 75/100 **y** ≥ 20/30 en parecido **y** ningún fallo crítico.
- **Un redo permitido:** 60–74/100 con parecido ≥ 18/30 y geometría sana. Cambiar una sola variable: sustituir la imagen más débil o ajustar el prompt de vestuario.
- **Rechazar:** < 60/100, o parecido < 18/30, o cualquier fallo crítico.

**Fallos críticos (rechazo inmediato):**

- Identidad reemplazada por un rostro genérico.
- Rasgos duplicados o especulares (dos cortes de ceja, ojos desalineados).
- Gafas fundidas con la piel o convertidas en reflejo azul.
- Agujeros, superficies retorcidas o miembros extras.
- Texturas con luz de estudio horneada que impida reiluminar en Blender.

Después de aceptar, el modelo sigue siendo **una base**: la escultura final, el vestuario definitivo y el rigging se hacen localmente en Blender 5.3.0.

---

## 9. Formato de exportación y ruta de integración

1. **Descargar el GLB inmediatamente** tras `Done`; las URLs de descarga caducan.
2. **Máster local:** conservar el GLB original sin comprimir en `docs/avatar/assets/` con su hash. Es la fuente de verdad para escultura.
3. **Blender 5.3.0:** importar con el importador nativo glTF 2.0 (verificado). Comprobar escala, orientación, nombres de materiales y mapas PBR.
4. **Limpieza y rigging en Blender:** reconstruir rostro, cabello, gafas, cadena y vestuario. ⚠️ La API de rigging de Hyper3D **no preserva materiales ni texturas incrustadas**, así que el rigging se hace localmente.
5. **Copia web:** exportar un segundo GLB optimizado desde Blender. El proyecto ya usa `@react-three/fiber` 9.8.2, `@react-three/drei` 10.7.9 y `three` 0.187.0, así que `useGLTF` consume GLB directamente. Comprimir con Draco/KTX2 solo si el tamaño lo exige, manteniendo siempre el máster sin comprimir.
6. **Integración:** el futuro canvas será **único**, `id="scene-canvas-host"` dentro de `.intro__sticky`. No se montará un canvas provisional ni se integrará la base sin aprobación.

---

## 10. Checklist de ejecución (solo tras tu autorización)

1. [ ] Respuestas escritas del proveedor a las preguntas 1, 3, 4 y 7 del §2, archivadas aquí.
2. [ ] Decisión de modalidad: Opción A (Business/API/Medium) confirmada por ti.
3. [ ] Creación de cuenta y clave de API por tu parte (el asistente no crea cuentas).
4. [ ] Verificación local de hashes de los tres archivos contra `manifest.json`.
5. [ ] Copia de los tres archivos a una carpeta de staging local; envío únicamente de esos tres archivos.
6. [ ] Envío de la solicitud con los parámetros del §7 y guardado de `uuid`, `subscription_key` y coste devuelto (`consumed`).
7. [ ] Polling con backoff; descarga inmediata del GLB al terminar.
8. [ ] Verificación local: hash del GLB, apertura en Blender 5.3.0 y captura de tres ángulos para evaluar.
9. [ ] Eliminación remota: confirmar borrado automático a 7 días o solicitar borrado manual con acuse de recibo.
10. [ ] Actualización de `docs/avatar/manifest.json` y `PHOTO_MAP.md` con fecha, plataforma, archivos enviados y nuevo estado de privacidad.
11. [ ] Aplicación del rubric del §8 y decisión de gate.

---

## 11. Estado actual

- ✅ Privacidad verificada para API; webapp descartada por falta de garantía equivalente.
- ✅ Datos e imágenes a enviar delimitados.
- ✅ Derechos comerciales revisados; pendiente confirmación escrita específica.
- ✅ Formato GLB y compatibilidad con Blender 5.3.0 verificados localmente.
- ✅ Prueba, prompt, selección fotográfica y criterios definidos.
- ⏳ Preguntas al proveedor: **enviar sin incluir ninguna foto**.
- ⏳ Decisión de plan: **pendiente de tu elección**.
- ⏳ Autorización explícita para subir: **pendiente**.
- 🔒 `uploaded_to_external_services = false` · `generation_started = false`.
