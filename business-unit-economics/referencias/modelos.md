# Reglas por modelo de negocio

Lo común (contribución, CAC, LTV, payback, LTV:CAC, caja) vive en el motor. Aquí va solo lo propio de cada modelo
y la trampa típica. Los tres casos de la clase se usan como prueba de cada módulo.

## E-commerce (pedidos con recompra) — módulo `ecommerce`
- Contribución por **tipo de pedido**: precio pagado − unidades × costo de producto − costos por pedido (envío que paga la tienda, empaque) − comisión % × lo que paga el cliente. El costo de producto **no** baja con el descuento.
- Primer pedido con descuento: misma cuenta con el precio descontado. ROAS de break-even del primer pedido = precio pagado ÷ contribución (vacío si la contribución ≤ 0).
- Recompra: tabla de pedidos por mes de vida; el LTV suma `pedidos del mes × contribución`. Si hay suscripción, se suma mes a mes con supervivencia `(1 − churn)^(mes − 1)`.
- Mezcla de clientes: LTV = Σ peso × LTV del segmento (por ejemplo 85 % sueltos, 15 % suscriptores). Los pesos deben sumar 1.
- **ROAS real del primer pedido** = clientes nuevos × valor del primer pedido ÷ inversión. Se compara con el ROAS de la plataforma y con el break-even.
- **Trampa típica:** ROAS atribuido por la plataforma (ventana de atribución, retargeting a compradores, recompras). Medir: % de las ventas totales que se atribuye y % de la inversión en retargeting.
- Palancas: pack/ticket más alto, envío gratis desde un monto, más suscriptores, bajar inversión a la parte barata de la curva.
- Caso de prueba: **Tueste** (contribución $15,89; CAC real $54,55; LTV $54,80; ROAS real 0,70 frente a 3,0 reportado).

## Suscripción / SaaS — módulo `suscripcion`
- Margen mensual = precio × margen bruto (si no hay otros costos por cliente, el margen bruto es la contribución).
- LTV con horizonte: Σ_{m=1..H} margen × (1 − churn)^(m − 1). **LTV sin tope** = margen ÷ churn: solo para comparar (supone clientes eternos).
- Prepago anual: cobra `precio anual × margen` en el mes 1, sigue activo 12 meses; una parte renueva en el mes 13 y paga otra vez. Su payback suele ser 1 mes.
- CAC paid = (anuncios + vendedores por escalón + comisión por cliente) ÷ clientes de anuncios. CAC blended = mismos costos ÷ (anuncios + orgánicos). **Para decidir sobre anuncios se usa el paid.**
- Costos por escalón: vendedores = ⌈trials ÷ capacidad⌉ (0 si no hay trials).
- «Costo por registro» = costo de un trial, no de un cliente: CAC paid ÷ costo por registro muestra la distancia.
- Caja atrapada al escalar = costo extra − clientes extra × margen del primer mes.
- **Trampa típica:** LTV:CAC con CAC blended o con LTV sin tope.
- Caso de prueba: **Agendo** (CAC paid $180 frente a blended $105; LTV:CAC 1,40 frente al 2,4 de la lámina).

## Generación de leads — módulo `leadgen`
- Embudo por canal: leads (historial o CPL) × contacto × agenda × visita hecha = visitas pedidas → **capacidad** → visitas hechas × cierre = ventas.
- Capacidad: si las visitas pedidas superan la capacidad, se hacen primero las del canal prioritario (el que más cierra) y el resto se pierde. Contratar suma capacidad desde el mes siguiente y se paga desde el mes de la contratación.
- CAC real de un canal = (inversión + costo por visita × visitas hechas) ÷ ventas. Comisiones que se pagan en todas las ventas van en la contribución, no en el CAC.
- Valor de una visita = cierre × contribución − costo de la visita: decide a qué leads dar la capacidad.
- Venta única: LTV = contribución de una venta. Cobros y pagos diferidos (por ejemplo 50 % al firmar, equipos al firmar, instalación el mes siguiente) mueven la caja aunque no cambian el LTV.
- **Trampa típica:** CPL bajo con cliente caro (el lead barato contesta poco y cierra poco).
- Caso de prueba: **Sol de Casa** (lead de Meta 5 veces más barato, cliente 34 % más caro).

## Modelos mixtos
- Se combinan módulos sobre **una sola** adquisición y **una sola** unidad de cliente: el embudo (leadgen) entrega clientes; la unidad (suscripción, pedidos o venta) dice cuánto deja cada uno. Así no se cuentan dos veces clientes, ingresos ni costos.
- Ejemplos: Tueste = pedidos + suscripción; el gimnasio de ejemplo = embudo con capacidad + membresía mensual.
- Si dos segmentos comparten clientes, se reparten con pesos que suman 1; si dos canales traen clientes, cada canal tiene su propio embudo y los costos compartidos (fee, vendedores) se cuentan una vez en el total.

## Simulación de caja (nivel 3)
- Cada mes llega una cohorte (clientes de anuncios + orgánicos) que se sigue por separado con los vectores de la unidad (cobros, pagos, activos por edad). Edad 1 = mes de llegada.
- Caja final = caja anterior + entradas − salidas; salidas = pagos de las ventas + adquisición (anuncios, fee, escalones, comisiones, visitas) + fijos + contrataciones.
- Reglas comunes: piso de caja, rango de inversión por canal; reglas del caso (promedio mínimo desde un mes, inversión que no baja, máximo de contrataciones).
- El «mejor plan» solo se declara dentro de un espacio evaluado con el mismo modelo y reglas, y se dice cuántos planes se probaron.
