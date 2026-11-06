# Tueste

**Modelo:** mixto: ecommerce (pedidos sueltos con recompra) + suscripción mensual  
**Decisión:** ¿Diego firma la propuesta de la agencia (duplicar a $16.000 con 30 % de descuento en el primer pedido) o qué hace en su lugar?  
**Fuente:** Caso A - Tueste.pdf (FC Studio)

## 1. Datos

Están todos los datos que usa el modelo.

Supuestos (no son datos del caso):

- Pedidos sueltos que pasan al pack de 3 bolsas: 0 (supuesto propio; Idea de Diego (sección 6); el 50 % de la propuesta es supuesto propio)

## 2. Escenarios

| Indicador | Hoy ($8.000) | Agencia ($16.000 y −30 %) | Propuesta: $4.000 + pack |
|---|---:|---:|---:|
| Clientes de anuncios | 165,0 | 235,0 | 100,0 |
| CAC de anuncios | $48,48 | $68,09 | $40,00 |
| CAC real (paid) | $54,55 | $72,34 | $50,00 |
| CAC blended | $42,45 | $60,28 | $34,01 |
| LTV (12 meses, sobre contribución) | $54,80 | $46,52 | $70,39 |
| LTV:CAC | 1,00 amarillo | 0,64 rojo | 1,41 amarillo |
| Payback (meses) | 12 | no recupera | 7 |
| CAC marginal frente a la referencia | — | $114,29 | $61,54 |
| ROAS real del primer pedido | 0,70 | 0,37 | 0,85 |
| ROAS de break-even del primer pedido | 2,14 | 3,87 | 1,67 |

## 3. Métricas que pueden engañar

- ROAS de la plataforma 3,0 frente a ROAS real del primer pedido 0,70 (break-even 2,14). La plataforma se atribuye 85,7 % de las ventas totales y 30,0 % de la inversión es retargeting.
- Payback 12 meses; el primer mes no paga el CAC: hay que financiar la adquisición.

## 4. Simulación de caja

| Plan | Caja mínima (mes) | Caja final | Activos al final | Clientes nuevos | Cumple |
|---|---:|---:|---:|---:|---|
| Plan 1 · $8.000 fijos (hoy) | $24.448 (6) | $79.596 | 316,6 | 3.960,0 | sí |
| Plan 2 · Agencia: $16.000 fijos | −$35.879 (16) | −$26.217 | 421,1 | 5.640,0 | no: La caja baja del piso en el mes 4 |
| Plan 3 · $4.000 fijos, sin otros cambios | $34.764 (1) | $95.566 | 219,5 | 2.400,0 | sí |
| Plan 4 · Pack desde el mes 1; $4.000 meses 1-3 y $8.000 después | $35.528 (1) | $147.770 | 312,9 | 3.765,0 | sí |
| Plan 5 · Pack desde el mes 1 y $8.000 fijos | $30.847 (3) | $154.362 | 316,6 | 3.960,0 | sí |

Mes 1 de «Plan 1 · $8.000 fijos (hoy)»: Meta $8.000 → 165,00 → 165,00 clientes; clientes nuevos 212,00; entradas $12.265; salidas $15.500; caja final $31.765.

Búsqueda: 682 planes evaluados con el mismo modelo y reglas. Mejor encontrado: meta: $8000 · cambios {"pack":1} → caja mínima $30.847 (mes 3), caja final $154.362, cumple. No es un óptimo global: es el mejor dentro de ese espacio.

## 5. Recomendación

**No aceptar la propuesta. Arreglar antes de escalar.**

- Hoy cada cliente devuelve 1.00 veces lo que cuesta (LTV 54.80 / CAC 54.55); payback 12.
- La propuesta «Agencia ($16.000 y −30 %)»: baja el LTV:CAC de 1.00 a 0.64; cada cliente cuesta más de lo que deja; cada cliente extra cuesta 114.29 y deja 46.52; la caja rompe el piso en el mes 4.
- La alternativa «Propuesta: $4.000 + pack» lleva el LTV:CAC de 1.00 a 1.41 y el payback de 12 a 7 meses.
- Entre los planes comparados, el mejor que cumple las reglas es «Plan 5 · Pack desde el mes 1 y $8.000 fijos».

**Riesgos:** El historial es de meses sin promociones; el descuento podría no traer más clientes (supuesto 3, optimista). Que menos de la mitad elija el pack, o que los clientes de 2 bolsas compren menos al pagar el envío (supuesto propio). Los clientes que llegan antes de activar el pack se modelan sin pack (criterio conservador).

