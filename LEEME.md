# Unit economics: Skill, motor, calculadoras y casos A, B y C

Rossman Doan Rivera Cano · Business Solutions · Prof. Steven Ledezma

## Qué hay
| Carpeta | Contenido |
|---|---|
| `business-unit-economics/` | **El Skill**: `SKILL.md`, `referencias/` (teoría de la clase, reglas por modelo y formato del perfil), `motor/` (motor compartido, constructor de calculadoras y analizador), `perfiles/` (3 casos, 3 plantillas y un ejemplo de cuarta empresa), `pruebas/` y `ejemplos/` |
| `calculadoras/` | Cuatro calculadoras HTML de un solo archivo, sin instalar nada y sin internet: universal, Tueste, Agendo y Sol de Casa (nivel 2 + simulador del nivel 3) |
| `hojas/` | Hojas de Excel de los tres casos (niveles 1 y 3) y en `fuentes/` los scripts que las generan |
| `sesion2/` | **Sesión 2 (growth)**: prototipos móviles de los tres casos, fichas de growth de una página, hoja de cuentas y guion de la demo. Ver `sesion2/LEEME.md` |
| `recomendaciones/` | Recomendación de una página + planes, pitch, supuestos y errores de la IA (PDF), con el script que los genera |

## Cómo se usa
- **Instalar el Skill**: guardarlo desde la tarjeta de propuesta en Claude, o subir la carpeta `business-unit-economics` comprimida en la sección de Skills de Claude (la carpeta completa trae el motor; la tarjeta guarda las instrucciones).
- **Activarlo**: pedir «usá business-unit-economics con este caso» y adjuntar el documento del caso.
- **Caso nuevo**: copiar una plantilla de `perfiles/`, completar los datos (lo que falta se deja en `null`) y correr
  `node motor/analizar.js perfil.json --buscar` (informe) y `node motor/construir.js perfil.json calculadora.html` (calculadora).
  También se puede hacer sin código en `calculadora-universal.html` → pestaña «Perfil de la empresa» (plantillas, editor JSON, descargar y abrir perfiles).
- **Calculadoras**: abrir el `.html` con doble clic. Pestañas: tablero (nivel 2), simulador de 24 meses (nivel 3), datos y supuestos.
- **Hojas en Google Sheets**: Drive → Nuevo → Subir archivo → abrir con Hojas de cálculo de Google. Celdas amarillas con texto azul = supuestos editables.
- **Ejemplos**: `ejemplos/analisis-tueste.md` (un caso original analizado por el Skill) y `ejemplos/analisis-cuarta-empresa.md` (cómo entra una empresa nueva, con datos ficticios de ejemplo).

## Auditoría del ZIP anterior y correcciones
| Componente | Decisión | Motivo |
|---|---|---|
| Hojas de Excel (A, B, C) | Reutilizadas y corregidas | Las cifras coinciden con el PDF y el modelo de referencia. Se corrigió: la revisión de reglas del nivel 3 no miraba los rangos de inversión (A, B, C) ni el máximo de 2 técnicos (C); el payback en caja de C usaba otra convención (ahora mes 1 = mes de la firma → payback mes 2). Se agregó el plan 5 de C y la pestaña «Recomendación» |
| Mejor plan de Sol de Casa | Corregido | La búsqueda con caminos de dos tramos encontró un plan mejor ($681.010 frente a $649.095) |
| Tableros HTML (Chart.js por CDN) | Reemplazados | Dependían de internet y duplicaban fórmulas; ahora salen del motor compartido |
| Recomendaciones PDF | Corregidas | Plan 5 de C, redacción de la caja de C y errores reales de la IA en los tres casos |

## Pruebas ejecutadas (resultados en `business-unit-economics/pruebas/`)
| Prueba | Qué verifica | Resultado |
|---|---|---|
| `pruebas-motor.js` | Controles pedidos (15,89 · 70 clientes y CAC $180 · $1.625), todas las métricas contra cuentas a mano, mes 1, marginal, capacidad, contratación, piso, prepagos, cobros diferidos, reglas, extremos (inversión 0, conversión 0, margen negativo, datos vacíos, fuera del historial, expresión inválida) y coherencia de la recomendación | 143 pasan, 0 fallan |
| `verificar_excel.py` | Motor = Excel (Resultados, 24 meses de caja de cada plan, mes 1), las hojas recalculan al cambiar un supuesto y se mueven igual que el motor, y motor = modelo de referencia en Python | 556 pasan, 0 fallan (tolerancia 0,1 %) |
| `verificar_html.js` | Las calculadoras muestran lo mismo que el motor (< 1 %), se actualizan al mover controles, el botón vuelve a los datos, la búsqueda coincide y no piden nada a internet | 138 pasan, 0 fallan |

## Sesión 2
El Skill suma el módulo `growth` del motor (embudos, coeficiente viral, recompensas contra la regla de plata, conversión por grupos, balde de retención y matriz de 90 días), `referencias/growth.md` y dos pruebas nuevas: `pruebas-growth.js` (55 pasan, 0 fallan) y `verificar_prototipos.js` (9 pasan, 0 fallan).

## Lo que falta hacer a ustedes
- Rehacer a mano la fila de la pestaña «Verificación» (columna amarilla «Su cuenta»).
- Escribir el ejemplo propio de «En qué se equivocó o nos confundió la IA» (hay espacio en el PDF y en la pestaña «Recomendación»).
- Los supuestos propios (50 % elige el pack; 40 % plan anual y precio de $29; técnico rindiendo desde el primer mes en el nivel 1) hay que defenderlos como supuestos, no como datos.
