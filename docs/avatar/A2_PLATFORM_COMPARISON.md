# Evaluación tecnológica A2 — Meshy vs Hyper3D / Rodin

**Fecha:** 2026-11-23  
**Alcance:** investigación documental únicamente. No se crearon cuentas, no se compraron planes, no se subieron fotografías, no se iniciaron generaciones y no se instalaron plugins.  
**Estado de privacidad del material local:** sin cambios (`uploaded_to_external_services = false`, `generation_started = false`).  
**Fuentes:** documentación oficial, help centers y páginas legales de Meshy e Hyper3D. Se distinguishing entre **✅ CONFIRMADO** (texto literal en documentación oficial) y **⚠️ CONSULTAR** (no consta de forma explícita o hay contradicción entre fuentes oficiales).

---

## 1. Resumen ejecutivo

| Criterio | Meshy | Hyper3D / Rodin |
|---|---|---|
| Image-to-3D | ✅ Meshy 7.1, 7 y 6 | ✅ Rodin Gen-2.5 / Gen-1.5 |
| Multi-view | ✅ 1 principal + hasta 3 (izq./tras./der.), **4 máx.** | ✅ hasta **5 imágenes desde cualquier ángulo** (requiere suscripción) |
| Texturas PBR / AI texturing | ✅ | ✅ (HD en Creator; alta resolución en Business) |
| Topología controlada | ✅ Smart Topology (cuads/tris, 100–15.000 caras), **incompatible con Multi-view** | ✅ Smart Low-Poly (Creator), High-Poly Quad (Business), normal baking tras aprobación de geometría |
| Rigging / animación | ✅ auto-rigging y animación | ✅ API de rigging (⚠️ no preserva materiales ni texturas incrustadas) |
| Exportación GLB | ✅ GLB, FBX, OBJ, USDZ, STL, BLEND, 3MF, DXF | ✅ GLB (por defecto en API), FBX, OBJ, USDZ, STL |
| Blender 5.3.0 | ⚠️ plugin probado hasta 5.2.0; importar GLB nativamente | ⚠️ add-on verificado solo en Blender 4.0+; importar GLB nativamente |
| Enfoque humano / rostro | ⚠️ orientado a objetos y personajes; guía oficial admite rostros planos/asimétricos y artefactos en detalles finos | ⚠️ Rodin orientado a objetos/personajes; **ChatAvatar** es la herramienta específica para rostros realistas |
| Uso por defecto para entrenamiento | ⚠️ datos de usuarios no-Enterprise **pueden** usarse para entrenar; opt-out por correo | ⚠️ webapp: no se encontró cláusula explícita de no-entrenamiento para Rodin; **API: prohibido entrenar, 7 días y borrado** |
| Modo privado | ⚠️ no hay un "private mode" nombrado; activos confidenciales en workspace, licencia Private en planes de pago | ✅ toggle **Private** en workspace; Free: hasta 10 activos privados; Creator: ilimitados |
| Derechos comerciales | ✅ planes de pago; Free = CC BY 4.0 | ✅ según plan; ChatAvatar requiere licencia comercial o Business |

**Recomendación adelantada:** si se autoriza una primera prueba, **Hyper3D Rodin vía API con modo privado y descarga inmediata** es la opción que mejor cumple hoy la condición obligatoria de privacidad, porque es la única con un compromiso documentado y explícito de **no entrenamiento + borrado a 7 días** para los archivos subidos. Meshy queda como segunda opción y solo con Enterprise (garantía contractual) o con confirmación por escrito del opt-out. Matiz importante: para fidelidad facial, Rodin no es la herramienta adecuada; habría que evaluar **ChatAvatar** en una prueba separada y con confirmación escrita adicional.

> Nota de cambio: en una evaluación anterior se había inclinado la recomendación por Meshy. La documentación actual revisada cambia ese orden: Meshy permite entrenamiento por defecto para usuarios no-Enterprise, mientras que Hyper3D tiene una política de API explícitamente contraria al entrenamiento.

---

## 2. Meshy

### 2.1 Capacidades Image-to-3D y multi-view

- ✅ **Image to 3D** disponible en Meshy 7.1, 7 y 6. Formatos de entrada: `.png`, `.jpg`, `.jpeg`, `.webp`, máx. 20 MB.
- ✅ **Multi-view** es una opción de Image to 3D en Meshy 7.1: imagen principal + hasta tres vistas adicionales (izquierda, detrás, derecha). La API acepta 1–4 imágenes; la primera actúa como vista frontal.
- ✅ La documentación recomienda que estilo, proporciones y color de fondo sean **completamente consistentes** entre Front/Back/Left/Right.
- ⚠️ **Multi-view y Smart Topology no se pueden activar a la vez**: son pipelines separados dentro de Image-to-3D.
- ✅ Existe generación multi-imagen por API (`multi-image-to-3d`) y flujo de generación de vistas multiples con AI Image Generator.

### 2.2 Calidad en humanos, rostro y ropa

- ✅ La guía oficial de solución de problemas de personajes indica que la calidad depende de la nitidez y el ángulo de la referencia; una imagen frontal bien iluminada da mejores resultados que una angulada, borrosa o estilizada.
- ✅ Recomienda **Multi-view (frente + lados + detrás)** para reducir ambigüedad y mejorar precisión facial.
- ✅ Recomienda generar en **A-Pose o T-Pose**, o usar el control de pose por articulaciones del workspace, porque las herramientas de rigging se construyen alrededor de esas poses.
- ✅ Admite explícitamente que pueden aparecer **rostros planos, asimétricos o sin detalle fino**, y que dedos individuales, rasgos faciales intrincados y accesorios son las zonas más propensas a artefactos.
- ⚠️ No se encontró documentación oficial que garantice conservación de identidad facial (fidelidad biométrica) ni generación de prendas de vestir complejas y editables por separado. La ropa parece resolverse como parte de la malla/textura de la referencia.

**Implicación para nuestro caso:** nuestras fotos son tres cuartos, espejo, primer plano y un único cuerpo entero con ropa distinta a la final. No hay vistas front/lateral/detrás consistentes ni pose A/T. Esperar una base facial fiel de Meshy sería optimista; como mucho sirve como volumen inicial a esculpir en Blender.

### 2.3 Texturas, topología y exportación

- ✅ Smart Topology: malla limpia con edge flow optimizado y menor poligonado, 100–15.000 caras, cuads o tris.
- ✅ Remesh / AI Retopology para reconstruir topología en cuads o tris manteniendo la textura.
- ✅ AI Texturing / Retexture (10 créditos en 2K/4K, 15 en 8K).
- ✅ Exporta **GLB, FBX, OBJ, USDZ, STL, BLEND, 3MF y DXF**. GLB integra texturas en un solo archivo.
- ✅ Plugin de Blender: requiere 4.2+, probado con 4.2.6, 5.0.1, 5.1.0 y **5.2.0**. DCC Core: Blender 4.5–5.2.
- ⚠️ **Blender 5.3.0 no aparece en la lista de versiones probadas**. No es un bloqueo: la importación nativa de GLB de Blender no depende del plugin. No instalaremos el plugin.

### 2.4 Planes, precios y límites

| Plan | Precio | Créditos | Restricciones principales |
|---|---|---|---|
| Free | $0 | 100/mes (reset 1º UTC, no acumula) | 10 descargas/mes, solo Meshy 6 Lite, licencia CC BY 4.0, sin API, sin recargas, cola prioritaria baja |
| Pro | $20/mes | 1.000/mes | API, descargas ilimitadas, comerciales/Private, reintentos gratis, cola 10× |
| Premium | $40/mes | 3.000/mes | ídem + más reintentos y prioridad |
| Ultra | **$100/mes** (help center actual) | ⚠️ 8.000–10.000 según fuente | ídem, máxima prioridad |
| Studio | $70/mes base | 5.500 compartidos (paquetes hasta 5× = 28.000 por $350) | $10/asiento extra |
| Enterprise | a medida | a medida | SSO, contrato, garantías de datos |

- ✅ Costes por tarea: Image to 3D con textura **30 créditos (Standard) / 15 (Smart Topology)**; sin textura 20 / 5; una generación completa en 7.1/6 = 20 créditos; Ultra Mode 7 = 25.
- ✅ Promociones vigentes detectadas: 50% de descuento el primer mes para suscriptores nuevos Pro/Premium/Ultra; promoción de temporada de hasta 50% en planes anuales Pro/Premium entre 2026-11-23 y 2026-12-02.
- ⚠️ **Contradicción entre fuentes oficiales** sobre Ultra ($100 con 8.000 o 10.000 créditos; otra página dice $50 con 8.000). Verificar en la página de precios y en checkout antes de cualquier decisión.

### 2.5 Privacidad, entrenamiento, modo privado, retención y licencias

- ✅ Almacenamiento en **AWS (Estados Unidos)**; certificaciones ISO/IEC 27001:2022 y SOC 2; declaración de cumplimiento GDPR.
- ✅ Texto literal de la FAQ oficial: los clientes **no-Enterprise** ("todos los que contratan directamente en la web, sea plan individual o de equipo") pueden tener sus datos anonimizados usados para entrenamiento futuro "según lo requiera el desarrollo".
- ✅ **Clientes Enterprise: sus datos no se usan para entrenamiento**, prohibido explícitamente en los Términos y garantizado contractualmente.
- ✅ Opt-out real para no-Enterprise: enviar correo a `support@meshy.ai` con asunto **"Request to opt out of Meshy data training."** e incluir el email de la cuenta. ⚠️ Es un proceso manual por correo, no un interruptor en la interfaz; habría que obtener confirmación por escrito antes de subir nada.
- ⚠️ No hay un "modo privado" con ese nombre. Los activos se describen como confidenciales en el workspace; los planes de pago dan licencia **Private**, mientras que Free da **CC BY 4.0**. Solo se pueden mover a workspaces compartidos activos con licencia Private. La Community es pública: no publicar.
- ✅ Retención: archivos subidos y generados permanecen en el workspace **hasta que se eliminan**. Los activos generados por API se conservan solo unos días (⚠️ una fuente indica 3 días; otra artículo habla de un periodo sin cifrar) y las URLs de descarga caducan. Descargar de inmediato.
- ✅ Licencia comercial en todos los planes de pago; Free = CC BY 4.0 con atribución. El usuario conserva la propiedad del resultado pero es responsable de los derechos de las imágenes de referencia.

---

## 3. Hyper3D / Rodin

### 3.1 Capacidades Image-to-3D y multi-view

- ✅ **Rodin Gen-2.5** es el modelo más capaz, con niveles de "Thinking Effort" de Extreme-Low a Extreme-High. **Gen-1.5** es más rápido, con modos Default, Focal, Zero y Speedy.
- ✅ Image to 3D desde una imagen o **hasta 5 vistas consistentes desde cualquier ángulo**, sin exigir posiciones fijas de frente/lado/detrás. Se pueden asignar etiquetas de dirección.
- ✅ En la API Gen-1/1.5 existen los modos `fuse` (combinar rasgos de varias imágenes) y `concat` (tratar las imágenes como capturas multi-view de un mismo objeto).
- ✅ **Pay-by-result**: se puede revisar la vista previa antes de confirmar el gasto de créditos.
- ⚠️ La función multi-imagen **requiere suscripción** (no está disponible en el flujo gratuito).

### 3.2 Calidad en humanos, rostro y ropa

- ⚠️ El propio ecosistema Hyper3D separa claramente los productos: **Rodin** se describe como generador de *assets* 3D (objetos, productos, personajes genéricos); **ChatAvatar** es la herramienta especializada en **rostros humanos realistas** a partir de texto o retrato, con mallas corporales acordes, materiales PBR y capacidades faciales.
- ✅ La documentación de ayuda indica que el multi-view es especialmente útil para "productos asimétricos, personajes, vehículos y objetos con detalles laterales, traseros, superiores o inferiores importantes".
- ✅ Hyper3D ofrece rigging automático editable por prompt para humanos, animales y criaturas, incluso dedos individuales (changelog oficial).
- ⚠️ No se encontró documentación oficial que garantice conservación de identidad facial ni generación de la prenda final (gorra, camiseta oversized y overol de jean claro) como prendas separadas y editables. La ropa del resultado seguirá la referencia; como nuestras fotos no incluyen ese vestuario, habría que reconstruirlo en Blender.
- ⚠️ ChatAvatar requiere **licencia comercial o plan Business** para uso comercial, y sus condiciones de privacidad/output son distintas a las de Rodin.

**Implicación para nuestro caso:** Rodin tendría mejor adaptación que Meshy a nuestro set de fotos desigual (5 ángulos libres en vez de 4 slots fijos), pero tampoco es un escáner de identidad. Para el rostro, ChatAvatar es conceptually más adecuado, aunque obligaría a una evaluación de privacidad separada.

### 3.3 Texturas, topología y exportación

- ✅ Tras aprobar la geometría se eligen número de caras, topología, normal baking y opciones de material/textura.
- ✅ Creator incluye Smart Low-Poly, texturas HD y personalizadas. Business añade texturas de alta resolución y **opciones High-Poly Quad**.
- ✅ Exportación en **GLB (por defecto en API), FBX, OBJ, USDZ, STL**.
- ✅ API de rigging con formatos OBJ, GLB, STL, FBX, USD, USDA, USDZ, USDC. ⚠️ **No preserva materiales ni texturas incrustadas**.
- ✅ Add-on de Blender: requiere Blender 4.0+ y Chrome 116+; **versiones distintas no verificadas** (5.3.0 queda fuera de lo verificado). No instalaremos el add-on; basta el importador GLB nativo.

### 3.4 Planes, precios y límites

| Plan | Precio | Características principales |
|---|---|---|
| Free | $0 | Exploración básica Image/Text-to-3D, hasta **10 activos privados**, publicación en galería pública, pay-by-result. Créditos directos a $1,50/credito |
| Trial | 7 días | Button "7-Day Trial" en la web |
| Creator | $30/mes o $280/año ($24/mes equiv.) | Multi-imagen, Smart Low-Poly, texturas HD/custom, más reintentos, exports ilimitados, **activos privados ilimitados**. Estimación oficial: ~60 modelos con ajustes estándar |
| Business | $120/mes o $1.152/año ($96/mes equiv.) | Todo lo anterior + API completa, más reintentos, texturas alta resolución, High-Poly Quad, modelos destacados y beneficios comerciales de ChatAvatar. Estimación: ~416 modelos |
| Enterprise | a medida | Administración de equipo, despliegue on-premise, LoRA/fine-tuning, descuentos por volumen, soporte |
| Créditos directos | $1,50/crédito | Separados de los créditos de suscripción |

- ✅ Rodin Gen-2 en API aparece **desde 0,5 créditos por generación**; Gen-2.5 y opciones HD/custom varían el coste.
- ✅ Tareas concurrentes: 5 en el nivel API documentado; prioridad estándar, personalizable en niveles superiores.
- ✅ Workspace: 1 resultado por defecto; **5× y 10× son opciones de plan Business**. Más resultados = más créditos.
- ⚠️ El importe exacto por tarea depende del modelo, calidad y textura; las estimaciones de "60/416 modelos" son orientativas, no garantías.
- ⚠️ Los precios anuales se cobran íntegros por adelantado. Verificar impuestos, divisa y fecha de renovación en checkout.

### 3.5 Privacidad, entrenamiento, modo privado, retención y licencias

- ✅ **Política de retención de API (vigente 2026-08-03), aplicable a prompts y archivos subidos y a sus resultados:**
  - retenidos **7 días** en sistemas activos y luego eliminados;
  - **no se usan para entrenar modelos**;
  - el output de API **no se publica en ASSETS públicos**;
  - **no se comparte con otros usuarios ni con terceros para fines propios**;
  - excepciones: obligación legal, metadatos de auditoría de seguridad/abuso y copias de seguridad protegidas.
- ⚠️ Esta política cubre **solo la API**, no sustituye a la Privacy Policy de la webapp. En la webapp, la Privacy Policy define los textos/imágenes subidos como "Prompts Data" ( dato personal ) y declara usos amplios: operación, analítica, "advance and enhance our Services with new or improved functionality" y "build predictive models". **No se encontró una cláusula explícita que prohíba entrenar con fotos subidas a Rodin webapp.** Requiere consulta directa por escrito.
- ✅ Existe un toggle **Private** en el workspace: "habilita Private cuando el resultado no deba ser público y tu cuenta tenga generaciones privadas disponibles". Free = hasta 10 activos privados + galería pública; Creator = privados ilimitados. ⚠️ El toggle controla **visibilidad**, y no equivale por sí solo a una garantía de no-entrenamiento en webapp.
- ✅ Los Términos permiten marcar como privado el output de **ChatAvatar** ("ningún otro usuario tendrá acceso salvo compartido, y no usaremos dicho Output salvo para mostrarlo en tu cuenta"). Es una garantía sobre el *output* de ChatAvatar, no sobre las fotos de entrada de Rodin.
- ✅ Retención general (Privacy Policy): los datos introducidos se conservan hasta retirarlos, eliminarlos o desactivar la cuenta; entonces se eliminan o anonimizan, con excepciones legales, financieras y de auditoría. Borrado/cierre: `hello@deemos.com`.
- ⚠️ Estructura legal: la Privacy Policy identifica a **Deemos Corporation (Delaware)** como responsable para el servicio en inglés, mientras que la Copyright License identifica a **Deemos Technology (Shanghai) Co., Ltd.** y se rige por la legislación de la RPC. La política avisa de transferencias internacionales. Conviene aclarar qué entidad sería la contraparte contractual en nuestro caso.
- ✅ Licencia: los Términos permiten exportar contenido para uso privado o comercial **según el plan**. La Copyright License concede licencia mundial, no exclusiva e intransferible para vender, redistribuir, modificar, publicar o sublicenciar el contenido comprado; **no transfiere el título**; prohíbe crear un servicio competidor y entrenar modelos competidores; las versiones de IA no son reembolsables.

---

## 4. ¿Pueden producir una base humana suficientemente fiel a Miguel?

**Conclusión: no de forma directa.** Ninguna de las dos plataformas se presenta en su documentación como un sistema de reconstrucción facial identitaria, y ambas admiten límites en rasgos finos.

Factores que juegan en nuestra contra con el material actual:

1. **Sin vistas canónicas.** Meshy espera frente/espalda/izquierda/derecha; Rodin admite ángulos libres, pero todas las fotos son tres cuartos, espejo o primer plano. No hay una vista posterior real.
2. **Sin pose A/T.** Meshy la recomienda explícitamente para rigging; la única foto de cuerpo entero (`IMG_5053.jpeg`) está de pie con ropa distinta y no sirve como plantura canónica.
3. **Artefactos en la entrada.** Reflejos azules de pantalla en los lentes (`IMG_4553`, `IMG_4582`, `IMG_5103`), espejo circular y nuca parcial en `IMG_4553`, fondo estampado en `IMG_5306`. Los reflejos deben tratarse como artefactos, no como color real.
4. **Detalles finos problemáticos.** Cejas con corte, gafas metálicas rectangulares y la cadena fina con dije están exactamente en la categoría que Meshy marca como propensa a artefactos.
5. **Vestuario ausente.** Gorra negra, camiseta oversized y overol de jean claro no aparecen en ninguna foto; habrá que modelarlos en Blender.

Por tanto, el rol realista de estas herramientas es **generar un volumen inicial / base topológica**, no entregar el avatar final. El trabajo de fidelidad (mandíbula, nariz, perilla/chivera, bigote, fade, gafas, cadena y vestuario) debe hacerse localmente en **Blender 5.3.0**, como ya estaba previsto. ChatAvatar es la única opción de las dos que se especializa en rostros, pero introduce una evaluación de privacidad y licenciamiento distinta.

---

## 5. Checklist que habría que enviar al proveedor antes de cualquier subida

**A Hyper3D (para Rodin webapp y, por separado, ChatAvatar):**
1. ¿Las imágenes subidas a Rodin en el workspace web (no solo API) quedan excluidas de entrenamiento o fine-tuning de modelos propios o de terceros? ¿Por escrito?
2. ¿El toggle "Private" afecta solo a la visibilidad o también al uso de los datos para entrenamiento?
3. ¿Cuál es el plazo de borrado de archivos subidos y outputs en webapp? ¿Existe opción de borrado manual inmediato y confirmación?
4. ¿Bajo qué entidad contractual (Delaware vs Shanghái) se presta el servicio y qué transferencias internacionales se realizan?
5. ¿Los activos generados con plan Creator son exportables con licencia comercial plena para un portafolio público?
6. Si se usa ChatAvatar: ¿la marca "private" cubre también la imagen de retrato de entrada?

**A Meshy (solo si se decide finalmente por ella):**
1. Confirmación por escrito de la recepción y aplicación del opt-out `"Request to opt out of Meshy data training."` al correo de la cuenta.
2. Alternativamente, condiciones y precio de Enterprise con la cláusula de no-entrenamiento incluida en el contrato.
3. Confirmar precio y créditos reales del plan Ultra y si la promoción aplica al modo Multi-view.
4. Confirmar plazo exacto de retención de archivos subidos en workspace y de activos de API (3 días vs "periodo" genérico).
5. Confirmar que generar en Community está desactivado y que la licencia del resultado será Private.

---

## 6. Recomendación final

**Primera prueba recomendada: Hyper3D Rodin, exclusivamente vía API, con `Private`, descarga inmediata y borrado confirmado a los 7 días.**

Razones, en orden de peso:

1. **Privacidad verificable por documento público.** Es la única de las dos con una política específica que dice, literalmente, que los archivos subidos *no se usan para entrenar*, *no se publican* y *se borran a los 7 días*. En Meshy, el usuario no-Enterprise necesita además un correo de opt-out que depende de respuesta humana.
2. **Mejor encaje con nuestro material.** Hasta 5 vistas desde cualquier ángulo se adaptan mejor a seis fotos dispares que los 4 slots fijos de Meshy (que además exigen consistencia estricta de fondo e iluminación).
3. **Coste de entrada controlado.** Pay-by-result permite ver la vista previa antes de pagar, y los créditos directos están publicados ($1,50/crédito). No obliga a comprar una suscripción anual para una prueba única, aunque la multi-imagen sí requiere suscripción: habría que confirmar el coste mínimo exacto antes de decidir.
4. **Salida compatible.** GLB por defecto, importable en Blender 5.3.0 sin plugins externos.

**Condiciones obligatorias antes de ejecutar esa prueba:**
- Autorización explícita e independiente del usuario (esta recomendación no la concede).
- Revisar la respuesta de Hyper3D al checklist anterior si la prueba se hace en webapp en vez de API.
- Subir **solo** copias optimizadas ya aprobadas (`docs/avatar/prepared/optimized/`), nunca los originales ni el manifiesto con metadatos.
- Actualizar `docs/avatar/manifest.json` y `docs/avatar/PHOTO_MAP.md` en el momento de cualquier subida, con fecha, plataforma, archivos exactos y nuevo estado de privacidad.

**Segunda opción:** Meshy solo con Enterprise (garantía contractual de no entrenamiento) o con el opt-out confirmado por escrito. Es técnicamente atractiva por Smart Topology, el rango de formatos y las guías de personajes, pero su modelo de datos por defecto encaja peor con nuestra condición de privacidad, y Multi-view y Smart Topology son mutuamente excluyentes.

**No recomendado como primera prueba:** ChatAvatar. Es la herramienta más prometedora para el rostro, pero es un producto distinto, con licencia comercial propia y sin una declaración pública equivalente sobre el uso de retratos subidos para entrenamiento. Debe evaluarse por separado, después de Rodin, y solo con confirmación escrita.

---

## 7. Fuentes oficiales consultadas

- Meshy — Pricing and credits: https://docs.meshy.ai/en/webapp/pricing
- Meshy — Planes: https://help.meshy.ai/en/articles/12062933-meshy-pricing-plans-free-pro-studio-enterprise
- Meshy — Coste por tarea: https://help.meshy.ai/en/articles/10000507-how-many-credits-does-each-generation-task-cost
- Meshy — Free plan: https://help.meshy.ai/en/articles/15696428-what-is-included-on-the-free-plan
- Meshy — Data use & AI training FAQ: https://help.meshy.ai/en/articles/15724182-is-meshy-safe-and-private-data-and-training-faq
- Meshy — Is My Asset Safe: https://help.meshy.ai/en/articles/9991999-is-my-asset-safe
- Meshy — Confidential files: https://help.meshy.ai/en/articles/16103171-how-to-handle-proprietary-or-sensitive-files-in-meshy
- Meshy — API asset retention: https://help.meshy.ai/en/articles/15643844-how-long-does-meshy-keep-api-generated-assets
- Meshy — Image to 3D / Multi-view: https://docs.meshy.ai/en/webapp/image-to-3d , https://help.meshy.ai/en/articles/12634481-how-to-use-multi-view
- Meshy — Character pose/face/hand issues: https://help.meshy.ai/en/articles/16102152-fix-character-pose-face-and-hand-issues-in-meshy
- Meshy — Export formats: https://docs.meshy.ai/en/webapp/guides/platform/export-formats
- Meshy — Blender plugin: https://docs.meshy.ai/en/webapp/plugins/blender/introduction
- Hyper3D — Planes y precios: https://hyper3d.ai/help/articles/how-much-do-hyper3d-plans-cost , https://hyper3d.ai/pricing
- Hyper3D — Rodin settings / Private / batch: https://hyper3d.ai/help/articles/choose-rodin-model-and-generation-settings
- Hyper3D — Image to 3D, hasta 5 vistas: https://hyper3d.ai/help/articles/create-3d-models-from-images-with-rodin , https://hyper3d.ai/features/image-to-3d
- Hyper3D — Data Retention Policy (API): https://docs.hyper3d.ai/en/legal/data-retention-policy
- Hyper3D — Privacy Policy: https://hyper3d.ai/legal/privacy
- Hyper3D — Terms of Service: https://hyper3d.ai/legal/terms
- Hyper3D — Copyright License: https://hyper3d.ai/legal/copyright-license
- Hyper3D — Blender add-on: https://docs.hyper3d.ai/en/addons/blender-addon
- Hyper3D — Export en API: https://docs.hyper3d.ai/en/api-specification/rodin-agentic , https://hyper3d.ai/features/api
- Hyper3D — ChatAvatar: https://hyper3d.ai/features/chatavatar , https://hyper3d.ai/help/articles/create-3d-avatars-with-chatavatar

---

## 8. Adenda de verificación (2026-11-23)

Tras la decisión de avanzar con Rodin, se amplió la revisión y se documentó el plan operativo en **`docs/avatar/A2_RODIN_TEST_PLAN.md`**. Puntos que actualizan el apartado 5 anterior:

- ✅ La garantía de **no entrenamiento, no publicación y borrado a 7 días** está confirmada solo para la **API** (`Data Retention Policy`, vigente 2026-08-03). La webapp queda descartada para nuestras fotos: sus términos generales permiten usar *Prompts and Output* para mejorar el servicio y apoyar investigación, sin una cláusula equivalente de no entrenamiento.
- ✅ Los Términos §5(b) confirman que el uso del output de **Rodin** no se limita (sujeto a los Términos y la ley) y que el Output marcado como privado solo se muestra en la cuenta del usuario. La página de precios indica “Unlimited export and any use” desde Creator.
- ✅ Coste de generación API: 0,5 créditos para Gen-2.5 base; +0,5 para Extreme-High; +2,0 para `texture_mode=extreme-high`. El coste relevante es la suscripción, no la generación.
- ⚠️ **Restricción importante detectada:** Creator incluye *Basic API access*, que solo permite `Gen-2.5-Extreme-Low` y `Gen-2.5-Low`. Para usar `Gen-2.5-Medium` (necesario para evaluar parecido) hace falta **Full API access**, incluido en Business ($120/mes o $1.152/año). Queda pendiente preguntar al proveedor si existe un add-on de API para Creator.
- ✅ Verificado localmente que Blender 5.3.0 expone el importador y exportador nativo glTF/GLB; no se instalará ningún plugin.
- ⚠️ Pendiente de respuesta escrita del proveedor: alcance exacto de la política en la API, subprocesadores, borrado manual y backups, entidad contractual aplicable en la UE, y confirmación de uso comercial con una cara reconocible.

Estado sin cambios: ninguna cuenta creada, ninguna foto subida, ninguna generación iniciada.
