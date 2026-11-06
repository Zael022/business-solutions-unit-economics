#!/usr/bin/env node
/* Pruebas del motor contra cuentas hechas a mano con los datos de los PDF (sin usar el motor para el esperado).
 * Uso: node pruebas/pruebas-motor.js   → imprime PASA/FALLA y termina con código 1 si algo falla. */
const path = require('path'), fs = require('fs');
const R = path.join(__dirname, '..');
const UE = require(path.join(R, 'motor', 'motor.js'));
const P = (n) => JSON.parse(fs.readFileSync(path.join(R, 'perfiles', n + '.json'), 'utf8'));
const A = P('tueste'), B = P('agendo'), C = P('sol-de-casa');
let ok = 0, mal = 0; const fallas = [];
function cerca(nombre, real, esperado, tol = 1e-6) {
  const pasa = real !== null && real !== undefined && Math.abs(real - esperado) <= tol * Math.max(1, Math.abs(esperado));
  pasa ? ok++ : (mal++, fallas.push(nombre));
  console.log(`${pasa ? 'PASA ' : 'FALLA'} ${nombre}: motor=${real === null || real === undefined ? real : +Number(real).toFixed(6)} esperado=${+Number(esperado).toFixed(6)}`);
}
function es(nombre, cond, detalle = '') { cond ? ok++ : (mal++, fallas.push(nombre)); console.log(`${cond ? 'PASA ' : 'FALLA'} ${nombre}${detalle ? ': ' + detalle : ''}`); }
function sinInvalidos(o, ruta = '') { // ningún NaN ni Infinito en un resultado
  if (typeof o === 'number') return isFinite(o) ? [] : [ruta];
  if (o && typeof o === 'object') return Object.keys(o).flatMap((k) => (k === 'def' || k === 'p' ? [] : sinInvalidos(o[k], ruta + '.' + k)));
  return [];
}
const esc = (pf, cambios) => UE.escenario(pf, cambios);
const sim = (pf, d) => UE.simular(pf, UE.plan(pf, d));
const cohorte = (n) => console.log('\n## ' + n);

/* ------------------------------------------------ controles básicos pedidos */
cohorte('Controles básicos');
let a = esc(A, {}), b = esc(B, {}), c = esc(C, {});
cerca('Tueste · contribución de un pedido de 2 bolsas de $34', a.ecommerce.tiposPedido[0].contrib, 34 - 2 * 5.44 - 4.5 - 0.045 * 34 - 1.2);
cerca('Tueste · contribución = 15,89', a.ecommerce.tiposPedido[0].contrib, 15.89);
cerca('Agendo · 500 trials × 14 % = 70 clientes de anuncios', b.A.pagados, 70);
cerca('Agendo · CAC paid = (10.000 + 1.200 + 70 × 20) ÷ 70 = 180', b.A.cacReal, 180);
cerca('Sol de Casa · contribución = 6.500 × 28 % − 3 % × 6.500 = 1.625', c.leadgen.contribVenta, 1625);

/* ------------------------------------------------ Tueste, nivel 1 */
cohorte('Tueste · nivel 1');
const cSub = 30.6 - 10.88 - 4.5 - 0.045 * 30.6 - 1.2;
cerca('Contribución del pedido de suscripción', a.ecommerce.suscripcion.contrib, cSub);
cerca('ROAS de break-even del pedido suelto (1 ÷ margen)', a.ecommerce.roasBE, 34 / 15.89);
cerca('ROAS de break-even de la suscripción', a.ecommerce.suscripcion.roasBE, 30.6 / cSub);
cerca('CAC de anuncios 8.000 ÷ 165', a.A.cacAnuncios, 8000 / 165);
cerca('CAC real (8.000 + 1.000) ÷ 165', a.A.cacReal, 9000 / 165);
cerca('ROAS real del primer pedido 165 × 34 ÷ 8.000', a.ecommerce.roasRealPrimerPedido, 165 * 34 / 8000);
cerca('Parte de las ventas que Meta se atribuye 24.000 ÷ 28.000', a.ecommerce.trampa.parteAtribuida, 24000 / 28000);
const ltvSub = cSub * (1 - Math.pow(0.91, 12)) / 0.09, ltvSuelto = 15.89 * 3;
cerca('LTV del suscriptor (12 meses, 0,91 cada mes)', a.ecommerce.ltvPorSegmento[1].ltv, ltvSub);
cerca('LTV del cliente suelto (3 pedidos × 15,89)', a.ecommerce.ltvPorSegmento[0].ltv, ltvSuelto);
cerca('LTV promedio 0,85 × suelto + 0,15 × suscriptor', a.ltv, 0.85 * ltvSuelto + 0.15 * ltvSub);
cerca('LTV:CAC hoy', a.ltvCac, (0.85 * ltvSuelto + 0.15 * ltvSub) / (9000 / 165));
cerca('Payback hoy = mes 12 (la curva cruza el cero recién en el mes 12)', a.payback, 12);
let ag = esc(A, { inv_meta: 16000, descuento: 0.3 });
cerca('Agencia · contribución del primer pedido con 30 % de descuento', ag.ecommerce.contribPrimerPedido, 23.8 - 10.88 - 4.5 - 0.045 * 23.8 - 1.2);
cerca('Agencia · ROAS de break-even con descuento', ag.ecommerce.roasBEPrimerPedido, 23.8 / (23.8 - 10.88 - 4.5 - 0.045 * 23.8 - 1.2));
cerca('Agencia · CAC marginal de anuncios (16.000 − 8.000) ÷ (235 − 165)', ag.marginal.cacAnuncios, 8000 / 70);
es('Agencia · cada cliente extra NO deja plata', ag.marginal.dejaPlata === false);
es('Agencia · no recupera el CAC en 12 meses', ag.payback === null);
cerca('CAC marginal de octubre (8.000 → 12.000) = 4.000 ÷ 45', esc(A, { inv_meta: 12000 }).marginal.cacAnuncios, 4000 / 45);
cerca('Interpolación: $6.000 → 132,5 clientes (entre 100 y 165)', UE.interp(6000, A.parametros.find((p) => p.id === 'hist_meta').valor).v, 132.5);
cerca('Interpolación: $2.000 → 50 clientes (recta desde cero)', UE.interp(2000, A.parametros.find((p) => p.id === 'hist_meta').valor).v, 50);
let pk = esc(A, { inv_meta: 4000, pack: 0.5 });
const c2p = 34 - 10.88 - 0 - 0.045 * 34 - 1.2, c3 = 48 - 3 * 5.44 - 4.5 - 0.045 * 48 - 1.4;
cerca('Pack · contribución del pedido de 2 bolsas que paga su envío', pk.ecommerce.tiposPedido[0].contrib, c2p);
cerca('Pack · contribución del pack de 3 bolsas', pk.ecommerce.tiposPedido[1].contrib, c3);
cerca('Pack · contribución promedio con 50 % de pack', pk.ecommerce.contribPedido, 0.5 * c2p + 0.5 * c3);
cerca('Propuesta · CAC real (4.000 + 1.000) ÷ 100', pk.A.cacReal, 50);
es('Propuesta · payback 7 meses', pk.payback === 7, 'motor=' + pk.payback);
es('Control «pedidos en 12 meses» = 3 deja la tabla igual', Math.abs(esc(A, { pedidos12: 3 }).ltv - a.ltv) < 1e-9);
cerca('Control «pedidos en 12 meses» = 4 suma un pedido de 15,89 al LTV del suelto', esc(A, { pedidos12: 4 }).ecommerce.ltvPorSegmento[0].ltv, 15.89 * 4);

/* ------------------------------------------------ Tueste, nivel 3 */
cohorte('Tueste · nivel 3');
let s1 = sim(A, A.planes[0]), f1 = s1.filas[0];
const nuevo1 = 212 * 0.85 * 15.89 + 212 * 0.15 * cSub;
cerca('Mes 1 · clientes nuevos 165 + 47', f1.nuevos, 212);
cerca('Mes 1 · contribución de los clientes actuales', f1.baseDecae, 9000);
cerca('Mes 1 · contribución del grupo nuevo', f1.contribNuevos, nuevo1);
cerca('Mes 1 · salidas 8.000 + 1.000 + 6.500', f1.salidas, 15500);
cerca('Mes 1 · caja final', f1.caja, 35000 + 9000 + nuevo1 - 15500);
cerca('Mes 2 · contribución de los clientes actuales baja 3 %', s1.filas[1].baseDecae, 9000 * 0.97);
cerca('Mes 2 · grupo del mes 1 compra 0,15 pedidos sueltos y sigue el 91 % de suscriptores', s1.filas[1].contribNuevos, nuevo1 + 212 * 0.85 * 0.15 * 15.89 + 212 * 0.15 * cSub * 0.91);
const s2 = sim(A, A.planes[1]);
es('Agencia ($16.000 fijos) rompe el piso de $5.000 en el mes 4', s2.primerMesBajoPiso === 4, 'motor=' + s2.primerMesBajoPiso);
es('Agencia no cumple las reglas', !s2.cumple);
const r0 = sim(A, { nombre: 'x', inversiones: { meta: { tramos: [[1, 20000], [13, 0]] } } });
es('Regla: desde el mes 13 la inversión no baja del promedio 1-12', r0.fallas.some((x) => /mes 13/.test(x)));
es('Regla: rango de $0 a $20.000', sim(A, { nombre: 'x', inversiones: { meta: 25000 } }).fallas.some((x) => /rango/.test(x)));
es('Sin inversión no se paga el fee', sim(A, { nombre: 'x', inversiones: { meta: 0 } }).filas[0].adquisicion === 0);

/* ------------------------------------------------ Agendo */
cohorte('Agendo · nivel 1');
const ltv24 = 19.5 * (1 - Math.pow(0.94, 24)) / 0.06;
cerca('CAC blended 12.600 ÷ 120', b.A.cacBlended, 105);
cerca('LTV a 24 meses (19,5 × (1 − 0,94²⁴) ÷ 0,06)', b.ltv, ltv24);
cerca('LTV sin tope 19,5 ÷ 0,06', b.suscripcion.ltvSinTope, 325);
cerca('LTV:CAC paid', b.ltvCac, ltv24 / 180);
cerca('LTV:CAC blended (el «2,4» de la lámina)', b.ltvCacBlended, ltv24 / 105);
cerca('LTV a 24 meses del plan anual 187,2 + 0,7 × 187,2', b.suscripcion.ltvPrepago, 187.2 * 1.7);
es('Payback del cliente mensual = 14 meses', b.payback === 14, 'motor=' + b.payback);
es('Payback del cliente anual = 1 mes (paga 12 meses por adelantado)', b.suscripcion.paybackPrepago === 1);
let v = esc(B, { inv: 30000 });
cerca('Valeria · trials con $30.000 según el historial', v.A.canales[0].tope, 900);
es('Valeria · 2 vendedoras (900 ÷ 500, hacia arriba)', v.suscripcion.vendedoras === 2);
cerca('Valeria · CAC marginal (34.920 − 12.600) ÷ (126 − 70)', v.marginal.cac, 22320 / 56);
cerca('Valeria · caja atrapada al mes 22.320 − 56 × 19,5', v.suscripcion.cajaAtrapadaMes, 22320 - 56 * 19.5);
let vc = esc(B, { inv: 30000, modo: 'constante' });
cerca('Valeria con CAC constante · 1.500 trials', vc.A.canales[0].tope, 1500);
cerca('Valeria con CAC constante · CAC paid 37.800 ÷ 210', vc.A.cacReal, 180);
es('Sin trials no hay vendedoras (0 trials → 0)', esc(B, { inv: 0 }).suscripcion.vendedoras === 0);
cohorte('Agendo · nivel 3 (prepagos y renovaciones)');
const sb = sim(B, B.planes[0]), g1 = sb.filas[0];
cerca('Mes 1 · trials', g1.tope, 500);
cerca('Mes 1 · clientes activos 1.150 × 0,94 + 120', g1.activos, 1150 * 0.94 + 120);
cerca('Mes 1 · entradas 1.201 × 19,5', g1.entradas, 1201 * 19.5);
cerca('Mes 1 · salidas 10.000 + 1.200 + 1.400 + 14.000', g1.salidas, 26600);
cerca('Mes 1 · caja final', g1.caja, 60000 + 1201 * 19.5 - 26600);
es('Valeria ($30.000) rompe el piso de $10.000 en el mes 3', sim(B, B.planes[1]).primerMesBajoPiso === 3);
const sa = sim(B, { nombre: 'x', inversiones: { ads: 10000 }, cambios: { anual: 1 } });
const anualesMes1 = 120 * 0.4;
cerca('Plan anual · entradas del mes 1 = mensuales × 19,5 + anuales × 187,2', sa.filas[0].entradas, (1150 * 0.94 + 120 * 0.6) * 19.5 + anualesMes1 * 187.2);
// mes 13: renuevan el 70 % del grupo anual del mes 1 y pagan otra vez
const act12 = sa.filas[11], act13 = sa.filas[12];
let mens = 1150; for (let t = 1; t <= 13; t++) mens = mens * 0.94 + 120 * 0.6;
cerca('Plan anual · mes 13: cobro = mensuales × 19,5 + (nuevos anuales + 70 % del grupo del mes 1) × 187,2', act13.entradas, mens * 19.5 + (anualesMes1 + 0.7 * anualesMes1) * 187.2);
cerca('Plan anual · activos anuales del mes 12 = 12 grupos completos', act12.activos - (function () { let m = 1150; for (let t = 1; t <= 12; t++) m = m * 0.94 + 72; return m; })(), 12 * 48);

/* ------------------------------------------------ Sol de Casa */
cohorte('Sol de Casa · nivel 1');
const vm = 500 * 0.55 * 0.30 * 0.70, vg = 100 * 0.85 * 0.55 * 0.85, sm = vm * 0.18, sg = vg * 0.30;
cerca('Visitas pedidas de Meta 500 × 0,55 × 0,30 × 0,70', c.leadgen.canales[0].pedidas, vm);
cerca('Ventas de Google', c.leadgen.canales[1].clientes, sg);
cerca('CAC real de Meta (4.000 + 60 × visitas) ÷ ventas', c.leadgen.canales[0].cacReal, (4000 + 60 * vm) / sm);
cerca('CAC real de Google', c.leadgen.canales[1].cacReal, (4000 + 60 * vg) / sg);
cerca('La trampa: el cliente de Meta cuesta 34 % más', c.leadgen.trampa.cacMasCaro, ((4000 + 60 * vm) / sm) / ((4000 + 60 * vg) / sg) - 1);
cerca('La trampa: el lead de Meta es 5 veces más barato', c.leadgen.trampa.cplVeces, 5);
cerca('Valor de una visita de Google 0,30 × 1.625 − 60', c.leadgen.canales[1].valorVisita, 427.5);
cerca('Valor de una visita de Meta 0,18 × 1.625 − 60', c.leadgen.canales[0].valorVisita, 232.5);
cerca('Payback en caja: mes 1 (firma) = −CAC + 3.250 − 3.770', c.curva[1], -c.A.cacReal + 3250 - 3770);
es('Payback en caja = mes 2 (el de la instalación)', c.payback === 2);
let cpl = esc(C, { inv_meta: 8000, inv_google: 0, modo_meta: 'constante' });
cerca('Agencia con CPL $8 · 1.000 leads', cpl.leadgen.canales[0].leads, 1000);
cerca('Capacidad · se piden 115,5 visitas', cpl.leadgen.cap.pedidas, 115.5);
cerca('Capacidad · solo se hacen 100', cpl.leadgen.cap.hechas, 100);
cerca('Capacidad · ventas = 100 × 18 %', cpl.A.pagados, 18);
let pri = esc(C, { capacidad_base: 50 });
cerca('Prioridad: con 50 visitas, Google usa sus 39,74 y Meta el resto', pri.leadgen.canales[0].hechas, 50 - vg);
cerca('Agencia con el historial · ventas 840 × 0,55 × 0,30 × 0,70 × 0,18', esc(C, { inv_meta: 8000, inv_google: 0 }).A.pagados, 840 * 0.55 * 0.3 * 0.7 * 0.18);
cohorte('Sol de Casa · nivel 3 (cobros y pagos diferidos, capacidad, contratación)');
const sc = sim(C, C.planes[0]), h1 = sc.filas[0], ventas1 = sm + sg;
cerca('Mes 1 · ventas', h1.clientesPagados, ventas1);
cerca('Mes 1 · entradas = 3.250 × ventas del mes + 3.250 × 22 del mes 0', h1.entradas, 3250 * ventas1 + 3250 * 22);
cerca('Mes 1 · salidas = 3.770 × ventas + 1.105 × 22 + 60 × visitas + 8.000 + 18.000', h1.salidas, 3770 * ventas1 + 1105 * 22 + 60 * (vm + vg) + 26000);
cerca('Mes 1 · caja final', h1.caja, 12000 + 3250 * ventas1 + 3250 * 22 - (3770 * ventas1 + 1105 * 22 + 60 * (vm + vg) + 26000));
cerca('Mes 2 · cobra la segunda mitad de las ventas del mes 1', sc.filas[1].entradas, 3250 * ventas1 * 2);
const st = sim(C, { nombre: 'x', inversiones: { meta: 4000, google: 4000 }, contrataciones: [2] });
es('Técnico contratado en el mes 2: capacidad 100 en el mes 2 y 150 en el mes 3', st.filas[1].capacidad === 100 && st.filas[2].capacidad === 150);
cerca('Técnico: se paga desde el mes en que se contrata', st.filas[1].costoContr, 1800);
es('Regla: máximo 2 técnicos extra', sim(C, { nombre: 'x', inversiones: { meta: 4000, google: 4000 }, contrataciones: [1, 2, 3] }).fallas.some((x) => /2 técnicos/.test(x)));
es('Regla: desde el mes 19 la inversión total no baja', sim(C, { nombre: 'x', inversiones: { meta: { tramos: [[1, 4000], [21, 2000]] }, google: 4000 } }).fallas.some((x) => /mes 19/.test(x)));
es('Regla: Google de $0 a $8.000', sim(C, { nombre: 'x', inversiones: { meta: 4000, google: 9000 } }).fallas.some((x) => /rango/.test(x)));
es('Agencia ($8.000 en Meta) rompe el piso en el mes 5', sim(C, C.planes[1]).primerMesBajoPiso === 5);

/* ------------------------------------------------ extremos y entradas inválidas */
cohorte('Casos extremos');
for (const [n, pf, ch] of [['Tueste con $0', A, { inv_meta: 0 }], ['Agendo con $0', B, { inv: 0 }], ['Sol de Casa con $0', C, { inv_meta: 0, inv_google: 0 }], ['Agendo con conversión 0', B, { conv: 0 }], ['Sol de Casa sin capacidad', C, { capacidad_base: 0 }]]) {
  const r = esc(pf, ch);
  es(`${n}: sin NaN ni infinitos`, r.ok && sinInvalidos(r).length === 0, sinInvalidos(r).join(','));
  es(`${n}: CAC y LTV:CAC quedan vacíos (no infinitos)`, r.A.cacReal === null && r.ltvCac === null && r.payback === null);
}
const neg = esc(A, { precio_bolsa: 7 });
es('Margen negativo: la contribución sale negativa y el ROAS de break-even queda vacío', neg.ecommerce.tiposPedido[0].contrib < 0 && neg.ecommerce.roasBE === null);
es('Margen negativo: LTV:CAC negativo y semáforo rojo', neg.ltvCac < 0 && neg.semaforo === 'rojo');
const falta = esc(A, { churn: null });
es('Dato vacío: el escenario no se calcula y dice qué falta', !falta.ok && falta.faltan.includes('churn'));
const fuera = esc(A, { inv_meta: 30000 });
es('Fuera del historial: no extrapola (se queda en 250) y avisa', fuera.A.pagados === 250 && fuera.avisos.some((x) => /historial/.test(x)));
let error = null; try { UE.ev('$precio_bolsa; alert(1)', { precio_bolsa: 1 }); } catch (e) { error = e; }
es('Expresión no permitida en un perfil se rechaza', error !== null);
for (const pf of [A, B, C]) for (const s of UE.calcularTodo(pf).sims) es(`${pf.nombre} · ${s.nombre}: simulación sin NaN`, sinInvalidos(s.r.filas.map((f) => ({ ...f, adq: null }))).length === 0);

/* ------------------------------------------------ recomendación y mejor plan */
cohorte('Coherencia de la recomendación y del mejor plan');
for (const pf of [A, B, C]) {
  const T = UE.calcularTodo(pf);
  es(`${pf.nombre}: la recomendación rechaza la propuesta recibida`, T.recomendacion.propuesta === 'rechazar', T.recomendacion.titulo);
  es(`${pf.nombre}: no recomienda escalar con LTV:CAC < 3`, T.recomendacion.decision !== 'escalar con cuidado');
  const prop = T.escenarios.find((e) => e.rol === 'propuesta').r, hoy = T.escenarios.find((e) => e.rol === 'hoy').r, alt = T.escenarios.find((e) => e.rol === 'alternativa').r;
  es(`${pf.nombre}: la alternativa mejora el LTV:CAC de hoy`, alt.ltvCac > hoy.ltvCac && prop.ltvCac < hoy.ltvCac, `hoy ${hoy.ltvCac.toFixed(2)} · propuesta ${prop.ltvCac.toFixed(2)} · alternativa ${alt.ltvCac.toFixed(2)}`);
  const b = UE.buscar(pf, pf.busqueda);
  const ultimo = T.sims[T.sims.length - 1].r;
  es(`${pf.nombre}: el mejor plan de la búsqueda (${b.evaluados} planes) es el último plan propio`, Math.abs(b.mejor.cajaFinal - ultimo.cajaFinal) < 1e-6 && Math.abs(b.mejor.activosFinal - ultimo.activosFinal) < 1e-6 && ultimo.cumple, b.mejor.texto);
  es(`${pf.nombre}: ningún plan válido de la lista supera al mejor`, T.sims.filter((s) => s.r.cumple).every((s) => UE.mejor(b.mejor, s.r) === b.mejor));
}
for (const n of ['ejemplo-gimnasio', 'plantilla-ecommerce', 'plantilla-suscripcion', 'plantilla-leadgen']) {
  let e2 = null, T; try { T = UE.calcularTodo(P(n)); } catch (e) { e2 = e; }
  es(`Perfil ${n} se calcula sin errores`, !e2, e2 ? e2.message : T.recomendacion.titulo);
}

console.log(`\nRESULTADO: ${ok} pasan, ${mal} fallan.` + (mal ? '\nFallan: ' + fallas.join(' | ') : ''));
process.exit(mal ? 1 : 0);
