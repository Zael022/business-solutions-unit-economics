# Cómo escribir el perfil de una empresa (JSON)

Un perfil describe una empresa; el motor no se toca. Plantillas: `perfiles/plantilla-ecommerce.json`,
`plantilla-suscripcion.json`, `plantilla-leadgen.json`. Ejemplos completos: `tueste.json`, `agendo.json`,
`sol-de-casa.json` y `ejemplo-gimnasio.json` (modelo mixto).

## Campos
| Campo | Qué es |
|---|---|
| `id`, `nombre`, `subtitulo`, `fuente`, `modelo`, `decision` | Identificación y la decisión del dueño |
| `especializaciones` | Lista de módulos: `ecommerce`, `suscripcion`, `leadgen` (se pueden combinar) |
| `parametros` | Lista de datos editables (ver abajo) |
| `unidad` | Lo que deja un cliente: `horizonte` del LTV y `segmentos` con su `peso` |
| `adquisicion` | Canales, embudo, capacidad, fee, escalones, comisiones, orgánicos y `referencia` para el CAC marginal |
| `escenarios` | `{id, nombre, rol, cambios}`; `rol` = `hoy`, `propuesta` (la recibida), `alternativa` (la propia) o `extra` |
| `cambios` | Palancas que el simulador puede activar desde un mes: `{id, nombre, valores}` |
| `simulacion` | `meses`, `cajaInicial`, `piso`, `costosFijos`, `base` (contribución que decae) o `cohortesIniciales`, `capacidadPorContratacion`, `costoContratacion`, `rangos`, `reglas`, `objetivo` |
| `planes` | Planes del nivel 3: `inversiones` por canal (número, `"$param"`, lista de 24 o `{"tramos": [[mes, monto], ...]}`), `contrataciones` (meses), `cambios` (`{id: mesDesde}`), `rol` |
| `busqueda` | Espacio para «Buscar el mejor plan»: `valores` y `cambioEn` por canal, `contrataciones`, `cambios` |
| `riesgos`, `trampa` | Textos que acompañan la recomendación |

## Parámetros
```json
{"id": "precio", "etiqueta": "Precio mensual", "unidad": "$", "valor": 25, "origen": "dato",
 "fuente": "Sección 1", "grupo": "Precios", "control": true, "min": 10, "max": 50, "paso": 1}
```
- `unidad`: `$`, `%` (como fracción: 0,14), `x`, `n`, `lista`, `historial` (`[[inversión, resultado], ...]`), `texto`.
- `origen`: `dato` (del caso), `supuesto` (permitido por el caso), `supuesto propio` (justificado en `fuente`). Lo calculado no va aquí.
- `valor: null` = **dato faltante**: la calculadora lo marca y no calcula lo que depende de él.
- `control: true` lo muestra como deslizador.

## Expresiones
Cualquier número puede ser `"$parametro"` o una expresión con `+ − * / ( )`, comparaciones, `? :`, `min()` y `max()`:
`"$precio*$bolsas*(1-$desc_sub)"`, `"($pack>0?0:$envio)+$caja"`. No se permite otra cosa.

## Segmentos de la unidad
| `tipo` | Campos |
|---|---|
| `pedidos` | `pedidos` (tipos con `peso`, `precio`, `unidades`, `costoUnidad`, `costosPorPedido`, `comisionPct`, `descuentoPrimer`), `frecuencia` (pedidos por mes de vida), `frecuenciaDespues`, `pedidosEn12` (opcional) |
| `suscripcion` | `precio`, `contribMes`, `churn` |
| `prepago` | `contribPeriodo`, `meses`, `renovacion` |
| `venta` | `precio`, `cobros` y `pagos` por mes de vida (mes 1 = el de la venta) |

## Canales
```json
{"id": "meta", "nombre": "Meta", "inversion": "$inv_meta", "historial": "$hist_meta", "modo": "$modo_meta",
 "costoUnitario": "$cpl_agencia", "factor": "$m_factor", "unidadTope": "Leads",
 "etapas": [{"nombre": "Contactados", "tasa": "$m_contacto"}, {"nombre": "Visitas pedidas", "tasa": "$m_visita"},
            {"nombre": "Visitas pedidas", "capacidad": true}, {"nombre": "Ventas", "tasa": "$m_cierre"}]}
```
- Historial con interpolación lineal y el punto ($0, 0); fuera del último dato **no se extrapola** (se usa el último y se avisa).
- `modo: "constante"` usa `costoUnitario` (CPL o costo por registro constante, como lo cuenta una agencia).
- La etapa `capacidad: true` marca dónde se aplica `adquisicion.capacidad` (`base`, `costoUnidad`, `prioridad`).

## Comprobar un perfil nuevo
1. `node motor/analizar.js perfil.json --buscar` → informe en Markdown (faltantes, escenarios, trampas, caja, recomendación).
2. `node motor/construir.js perfil.json calculadora.html` → calculadora autónoma.
3. Verificar a mano una fila (por ejemplo, el CAC real y el mes 1 del simulador) antes de recomendar.
