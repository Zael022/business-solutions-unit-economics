# Growth: crecer sin pagar más por cada cliente (Sesión 2)

Viene de la segunda clase (Reforge y Hormozi) y de la Parte 2 de los casos. Funciones en `motor.growth`.

## Conceptos y cuentas
- **Embudo → paso donde más se pierde**: tasa de cada paso al siguiente (`growth.embudo`). Se mira la tasa más baja y también cuántos se pierden; pueden ser pasos distintos (Agendo: la tasa más baja y la mayor cantidad están ambas en compartir el link, 48 %).
- **Ciclo (loop)**: lo que deja un cliente trae al siguiente. Tipos: invitaciones, contenido, ciclo pagado (vuelve tan rápido como vuelve la plata) y contacto casual (el producto se ve mientras otro lo usa: la insignia).
- **Coeficiente viral K** = invitan × invitaciones por persona × aceptan (`growth.k`). Con K < 1 el ciclo tiene techo: con N clientes nuevos al mes por otras vías, los referidos se estabilizan en **N·K/(1−K)** (`growth.referidosPorMes`). Con K ≥ 1 no hay techo y la cuenta queda vacía: desconfiar.
- **No contar invitaciones como clientes ni leads como ventas.** Encuesta de la clase: 100 socios × 20 % × 2 × 25 % = 10 socios, no 40.
- **Balde con agujeros**: activos(m) = activos(m−1) × (1 − baja) + altas; techo = altas ÷ baja (`growth.balde`). A (100 altas, 10 % de baja) termina el año con 718 y B (200, 30 %) con 657: retener gana.
- **Retención y CAC**: con menos cancelación sube el LTV y se puede pagar más por cliente (LTV ÷ 3 como tope de CAC).
- **Activación de atrás para adelante**: hábito → aha → setup. La puesta en marcha lleva al aha con lo mínimo.
- **Las cuatro preguntas del cliente** (Reforge): ¿es para mí?, ¿hace lo que quiero?, ¿me importa ahora?, ¿sé cómo lograrlo?
- **Conversión por grupos**: conversión = Σ (parte del grupo × tasa de pago del grupo) (`growth.conversionPorGrupos`); con la conversión nueva se recalcula el CAC paid con el motor.
- **Regla de plata de las recompensas**: costo por cliente referido = Σ recompensas ÷ entre cuántos se reparten, más los costos de cerrar (visitas). Revisar la **peor combinación** (`growth.peorCombinacion`), no solo la típica. Un descuento cuesta lo que se descuenta; un producto gratis cuesta lo que se paga por él.
- **Matriz de 90 días** (`growth.cuadrante`): eje = cuánto tarda en volver la plata (payback). Vuelve rápido → seguro = siempre activo, incierto = probar. Vuelve lento → puede dar mucho = largo plazo, promete poco = descartar por ahora. Los anuncios no se eliminan: se ubican.
- **Experimento**: «Si hacemos [cambio], entonces [métrica] pasa de [hoy] a [meta], y vigilamos que [contramétrica] no empeore.» Uno, no diez. Con pocos casos (50 familias), grupo de control sin el cambio.
- **North Star** + un número semanal que mide la retención o el ciclo.

## Entregables del reto 2 y cómo los hace el Skill
1. Prototipo móvil que se recorre de punta a punta, empieza por lo que prometió el anuncio, pide solo lo necesario, marca lo simulado y trae un panel del dueño con el embudo. Plantilla: `sesion2/prototipos/fuentes` (base.css, base.js y un archivo por caso; `armar.py` arma la versión para publicar y la autónoma).
2. Ficha de growth de una página: ciclo dibujado, paso con su porcentaje, meta de cuánto a cuánto y qué le cambia al negocio, número semanal, matriz de 90 días, experimento, tabla de recompensas y errores de la IA.
3. Cuentas verificables: `sesion2/cuentas/cuentas.js` (motor) y una hoja con fórmulas.
4. Pruebas: `pruebas/pruebas-growth.js` (cuentas a mano) y `pruebas/verificar_prototipos.js` (recorrido tocando solo botones en un celular simulado).

## Errores típicos a vigilar
Prototipos lindos que no se recorren, rediseñar pantallas sin mirar dónde se pierde la gente, recompensas sin calcular, pedir todo en la primera pantalla, ciclos sin techo, datos inventados sin «simulado», diez experimentos en vez de uno, avisos que tapan botones en el celular.
