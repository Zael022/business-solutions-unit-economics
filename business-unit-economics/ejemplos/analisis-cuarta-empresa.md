# Pulso (ejemplo de una cuarta empresa)

**Modelo:** mixto: lead generation (embudo y capacidad) + suscripción mensual  
**Decisión:** ¿Pulso triplica la inversión en Meta para llenar el gimnasio nuevo?  
**Fuente:** Datos de ejemplo escritos para mostrar cómo entra un caso nuevo; no vienen de ningún PDF

## 1. Datos

Están todos los datos que usa el modelo.

## 2. Escenarios

| Indicador | Hoy ($3.000) | Triplicar ($9.000) | $3.000 y mejor cierre (40 %) |
|---|---:|---:|---:|
| Clientes de anuncios | 33,1 | 42,0 | 37,8 |
| CAC de anuncios | $90,70 | $214,29 | $79,37 |
| CAC real (paid) | $113,56 | $237,14 | $99,37 |
| CAC blended | $78,13 | $174,74 | $71,14 |
| LTV (12 meses, sobre contribución) | $284,55 | $284,55 | $284,55 |
| LTV:CAC | 2,51 amarillo | 1,20 amarillo | 2,86 amarillo |
| Payback (meses) | 4 | 9 | 3 |
| CAC marginal frente a la referencia | — | $695,13 | — |
| LTV:CAC blended | 3,64 | 1,63 | 4,00 |
| LTV sin tope (solo comparar) | $450,00 | $450,00 | $450,00 |
| Visitas pedidas / capacidad | 94,5 / 120 | 172,2 / 120 | 94,5 / 120 |
| Meta: CPL / CAC real / LTV:CAC | $6,67 / $113,56 / 2,51 | $10,98 / $237,14 / 1,20 | $6,67 / $99,37 / 2,86 |

## 3. Métricas que pueden engañar

- CAC blended $78,13 (LTV:CAC 3,64) frente a CAC paid $113,56 (LTV:CAC 2,51). Costo por leads (arriba del embudo) $6,67: el CAC paid es 17,0 veces eso. LTV sin tope $450,00 frente a LTV a 12 meses $284,55.
- Triplicar ($9.000): se piden 172,2 y caben 120; se pierden 52,2. Más inversión no trae más clientes si no hay capacidad.
- Payback 4 meses; el primer mes no paga el CAC: hay que financiar la adquisición.

## 4. Simulación de caja

| Plan | Caja mínima (mes) | Caja final | Activos al final | Clientes nuevos | Cumple |
|---|---:|---:|---:|---:|---|
| Plan 1 · $3.000 fijos (hoy) | $10.570 (4) | $64.962 | 571,1 | 793,8 | sí |
| Plan 2 · Triplicar: $9.000 fijos | −$35.395 (15) | −$27.487 | 667,6 | 1.008,0 | no: La caja baja del piso en el mes 2 |
| Plan 3 · $4.500 y mejor cierre desde el mes 1 | $8.714 (4) | $118.460 | 732,4 | 1.152,0 | sí |
| Plan 4 · $6.000, mejor cierre y un entrenador en el mes 2 | −$901,78 (5) | $112.364 | 845,9 | 1.389,6 | no: La caja baja del piso en el mes 3 |

Mes 1 de «Plan 1 · $3.000 fijos (hoy)»: Meta $3.000 → 450,00 → 33,07 clientes; clientes nuevos 48,07; entradas $14.316; salidas $16.256; caja final $13.060.

Búsqueda: 546 planes evaluados con el mismo modelo y reglas. Mejor encontrado: meta: $4500 · cambios {"cierre":1} → caja mínima $8.714 (mes 4), caja final $118.460, cumple. No es un óptimo global: es el mejor dentro de ese espacio.

## 5. Recomendación

**No aceptar la propuesta. Arreglar antes de escalar.**

- Hoy cada cliente devuelve 2.51 veces lo que cuesta (LTV 284.55 / CAC 113.56); payback 4.
- La propuesta «Triplicar ($9.000)»: baja el LTV:CAC de 2.51 a 1.20; cada cliente extra cuesta 695.13 y deja 284.55; la caja rompe el piso en el mes 2.
- La alternativa «$3.000 y mejor cierre (40 %)» lleva el LTV:CAC de 2.51 a 2.86 y el payback de 4 a 3 meses.
- Entre los planes comparados, el mejor que cumple las reglas es «Plan 3 · $4.500 y mejor cierre desde el mes 1».

**Riesgos:** Todos los datos de este perfil son un ejemplo de entrada, no un caso real.

