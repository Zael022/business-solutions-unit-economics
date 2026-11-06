---
name: business-unit-economics
description: Analiza si un negocio puede pagar lo que cuesta conseguir clientes (unit economics y performance marketing) y cómo crecer sin pagar más por cada uno (ciclos, referidos, activación). Genera calculadoras, simulador de caja a 24 meses, cuentas de growth y prototipos verificados para e-commerce, suscripción/SaaS, generación de leads o mezclas.
---

# Unit economics de un negocio

Objetivo: decir con números si conviene escalar, arreglar o pausar la inversión en adquisición, y entregar una
calculadora que el dueño pueda usar. La IA calcula; la decisión se defiende con cuentas verificables.

## Archivos del skill
- `motor/motor.js`: motor compartido (Node y navegador). No se edita para un caso nuevo.
- `motor/analizar.js perfil.json [--buscar]`: informe Markdown (datos faltantes, escenarios, trampas, caja, recomendación).
- `motor/construir.js perfil.json salida.html`: calculadora autónoma (un archivo, sin internet). `--universal` arma la versión con plantillas.
- `perfiles/`: plantillas en blanco (`plantilla-ecommerce`, `plantilla-suscripcion`, `plantilla-leadgen`), los tres casos de la clase y un ejemplo mixto.
- `referencias/conceptos.md` (teoría de la clase y errores de la transcripción), `referencias/modelos.md` (reglas por modelo), `referencias/perfil.md` (formato del perfil).
- `pruebas/`: pruebas del motor, del módulo growth, comparación con Excel, con las calculadoras y recorrido de los prototipos.
- `referencias/growth.md`: ciclos, coeficiente viral, recompensas, activación, matriz de 90 días y experimentos (Sesión 2).

Si la carpeta `motor/` no está disponible, aplicá el mismo método a mano (fórmulas abajo y en `referencias/`), con una hoja de cálculo donde todo salga de una pestaña de supuestos.

## Proceso para un caso nuevo
1. **Identificar**: negocio, modelo (pedidos con recompra, suscripción, venta única por leads, o mezcla), la decisión del dueño y la propuesta que recibió.
2. **Extraer**: cada dato con unidad, período y fuente (sección del documento). Marcar `dato`, `supuesto` (permitido por el caso) o `supuesto propio` (justificado). Dato que falta = `null`; no se inventa. Las cifras salen del documento del caso; las transcripciones dan conceptos.
3. **Diagnosticar**: buscar el número que parece bueno y engaña (ver tabla). Escribir dónde se cree que está la trampa antes de calcular.
4. **Modelar**: copiar la plantilla que corresponda (o un caso parecido) a `perfil.json`, completar parámetros, unidad, adquisición, escenarios (`hoy`, `propuesta`, `alternativa`), cambios, simulación, planes y espacio de búsqueda. Para mezclas, una sola adquisición y una sola unidad con segmentos ponderados (nada se cuenta dos veces).
5. **Verificar**: correr `node motor/analizar.js perfil.json --buscar`. Rehacer a mano al menos una métrica (CAC real) y el mes 1 del simulador; si no coincide, revisar el perfil antes de seguir. Revisar avisos (fuera del historial, pesos que no suman 1, sin clientes).
6. **Escenarios**: hoy, propuesta recibida y al menos una alternativa propia con el mismo modelo. En el nivel de caja, al menos cuatro planes y la búsqueda; el mejor plan se declara «mejor encontrado entre N planes».
7. **Recomendar**: escalar, arreglar o pausar, con la trampa nombrada con un número, dos cambios con su efecto en LTV:CAC y payback, riesgos y qué tendría que pasar para escalar.
8. **Entregar**: `node motor/construir.js perfil.json calculadora.html`, el informe y una conclusión en palabras simples.

Pedí datos solo si sin ellos no se puede decidir; si falta algo secundario, usá un supuesto permitido, marcalo y mostrá cuánto mueve el resultado.

## Fórmulas que no se negocian
- Contribución = precio pagado − costos variables (producto, envío, empaque, comisión). Nunca ventas ni margen bruto si hay otros costos por pedido. Sueldos, alquiler y anuncios no entran.
- ROAS de break-even = 1 ÷ margen de contribución (precio ÷ contribución). Sin margen positivo no existe.
- CAC de anuncios = anuncios ÷ clientes **nuevos**. CAC real (paid) = anuncios + agencia + vendedores + comisiones por cliente + visitas/degustaciones ÷ clientes de anuncios. CAC blended solo para mostrar la diferencia.
- CAC marginal = costo extra ÷ clientes extra frente a la inversión de referencia.
- LTV = contribución acumulada en el horizonte del caso, con supervivencia por cohorte y en el mes en que se cobra. LTV sin tope (margen ÷ churn) solo para comparar.
- Payback = primer mes en que la caja acumulada del cliente (desde −CAC; mes 1 = mes de llegada) llega a cero.
- Semáforo LTV:CAC: < 1 rojo, 1–3 amarillo, ≥ 3 verde.
- Historial inversión → resultado: interpolación lineal con ($0, 0); fuera del último punto no se extrapola.
- Nunca mostrar NaN, infinito o un CAC con cero clientes: queda vacío con su explicación.

## Trampas que hay que buscar
| Señal | Pregunta | Cuenta que la desarma |
|---|---|---|
| ROAS alto de la plataforma | ¿Atribuye recompras, retargeting o ventas que igual pasaban? | ROAS real del primer pedido de clientes nuevos frente al break-even |
| LTV:CAC sano en un reporte | ¿Usa CAC blended o LTV sin tope? | LTV:CAC con CAC paid y LTV con horizonte |
| CPL o costo por registro bajo | ¿Cuánto cuesta un cliente que paga? | CAC real por canal con todo el embudo y visitas |
| «Duplicar/triplicar trae el doble/triple» | ¿Qué dice el historial? | CAC marginal del tramo y capacidad |
| Más leads | ¿Caben en la capacidad? | Visitas pedidas frente a capacidad y valor de una visita |
| Descuento | ¿Sube el ticket o adelanta caja? | Contribución del primer pedido con descuento y su break-even |
| Ventas suben y el banco baja | ¿Cuándo entra y sale la plata? | Simulación de caja mes a mes con el piso |

## Qué entrega la calculadora
Controles con nombre y unidad, botón para volver a los datos del caso, KPIs en vivo con semáforo, la trampa en un
gráfico, curva de caja de un cliente, LTV frente a CAC con líneas 1:1 y 3:1, respuesta a la inversión y CAC marginal
por tramo, embudo y capacidad (leads), escenarios lado a lado, recomendación razonada, simulador de 24 meses con
plan editable, revisión escrita del mes 1, comparación de planes, búsqueda del mejor plan y tabla de datos y supuestos
con los faltantes marcados.

## Growth: crecer sin pagar más por cada cliente
Cuando el caso pide crecer sin depender de los anuncios (referidos, puesta en marcha, contenido, contacto casual). Detalle en `referencias/growth.md`; funciones en `motor.growth`.
1. **Paso donde más se pierde**: tasa de cada paso al siguiente y cuántos se pierden; pueden ser pasos distintos. Atacar ese paso, no rediseñar todo.
2. **El ciclo**: de dónde sale cada cliente nuevo y cómo trae al siguiente. K = invitan × invitaciones × aceptan; con K < 1 los referidos se estabilizan en N·K/(1−K). Nunca contar invitaciones como clientes ni leads como ventas; un ciclo sin techo es una señal de error.
3. **Regla de plata**: costo por cliente del ciclo = recompensas (repartidas entre los clientes que las ganan) + costos de cerrar (visitas). Probar la peor combinación contra el tope del caso.
4. **Activación** de atrás para adelante: hábito → aha → setup mínimo; la conversión nueva se lleva al CAC paid con el motor.
5. **Retención**: el balde (altas fijas, baja mensual) tiene techo altas ÷ baja; retener vale más que duplicar altas.
6. **Matriz de 90 días** con el payback de cada canal: rápido y seguro = siempre activo; rápido e incierto = probar; lento y grande = largo plazo; lento y chico = descartar. Los anuncios se ubican, no se borran.
7. **Un experimento** con métrica (de cuánto a cuánto) y contramétrica; con pocos casos, grupo de control.
8. **Prototipo**: arranca por lo que prometió el anuncio, pide solo lo necesario en cada pantalla, pasa las cuatro preguntas (¿es para mí?, ¿hace lo que quiero?, ¿me importa ahora?, ¿sé cómo lograrlo?), marca «simulado» lo inventado, trae un panel del dueño con el embudo y se prueba tocando solo los botones en un celular.

## Antes de entregar
- `node pruebas/pruebas-motor.js` sin fallas (y `verificar_excel.py` / `verificar_html.js` si hay hojas o calculadoras de los casos).
- La recomendación sale de los números del mismo modelo (no de una versión anterior).
- Anotar al menos un error o confusión real de la IA encontrado en el proceso (qué dijo, por qué estaba mal, cómo se corrigió). No inventarlo.
