#!/usr/bin/env node
/* Exporta en JSON los resultados del motor para un perfil (y cambios opcionales). Lo usa verificar_excel.py.
 * Uso: node pruebas/exportar.js perfiles/tueste.json '{"envio": 5.5}' */
const UE = require('../motor/motor.js'), fs = require('fs');
const pf = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), base = process.argv[3] ? JSON.parse(process.argv[3]) : {};
const T = UE.calcularTodo(pf, base);
const out = { escenarios: {}, planes: [] };
for (const e of T.escenarios) {
  const r = e.r, x = { cacAnuncios: r.A.cacAnuncios, cacReal: r.A.cacReal, cacBlended: r.A.cacBlended, ltv: r.ltv, ltvCac: r.ltvCac, ltvCacBlended: r.ltvCacBlended, payback: r.payback,
    pagados: r.A.pagados, total: r.A.total, tope: r.A.canales.map((c) => c.tope), marginal: r.marginal ? r.marginal.cac : null, curva: r.curva };
  if (r.ecommerce) Object.assign(x, { contribPedido: r.ecommerce.contribPedido, contribPrimer: r.ecommerce.contribPrimerPedido, roasReal: r.ecommerce.roasRealPrimerPedido, ltvSuelto: r.ecommerce.ltvPorSegmento[0].ltv, ltvSub: r.ecommerce.ltvPorSegmento[1].ltv });
  if (r.suscripcion) Object.assign(x, { vendedoras: r.suscripcion.vendedoras, ltvMensual: r.suscripcion.ltvMensual, ltvSinTope: r.suscripcion.ltvSinTope, ltvPrepago: r.suscripcion.ltvPrepago, atrapada: r.suscripcion.cajaAtrapadaMes });
  if (r.leadgen) Object.assign(x, { canales: r.leadgen.canales.map((c) => ({ leads: c.leads, pedidas: c.pedidas, hechas: c.hechas, ventas: c.clientes, cpl: c.cpl, cacAnuncios: c.cacAnuncios, cacReal: c.cacReal, ltvCac: c.ltvCac, valorVisita: c.valorVisita })), pedidas: r.leadgen.cap.pedidas, resultadoMes: r.leadgen.resultadoMes, cacMasCaro: r.leadgen.trampa ? r.leadgen.trampa.cacMasCaro : null });
  out.escenarios[e.id] = x;
}
for (const s of T.sims || []) out.planes.push({ nombre: s.nombre, cajaMin: s.r.cajaMin, mesCajaMin: s.r.mesCajaMin, cajaFinal: s.r.cajaFinal, activosFinal: s.r.activosFinal, clientesTotal: s.r.clientesTotal, cumple: s.r.cumple,
  caja: s.r.filas.map((f) => f.caja), mes1: (({ nuevos, baseDecae, contribNuevos, entradas, salidas, caja, tope, pedidas, activos, clientesPagados }) => ({ nuevos, baseDecae, contribNuevos, entradas, salidas, caja, tope, pedidas, activos, clientesPagados }))(s.r.filas[0]) });
console.log(JSON.stringify(out));
