#!/usr/bin/env node
/* Analiza un perfil de empresa y escribe un informe en Markdown: datos faltantes, métricas, la trampa,
 * escenarios, simulación de 24 meses, mejor plan encontrado y recomendación.
 * Uso: node analizar.js perfil.json [--buscar] > informe.md */
const fs = require('fs'), UE = require('./motor.js');
const pf = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), buscar = process.argv.includes('--buscar');
const n = (v, d = 2) => { if (v === null || v === undefined || !isFinite(v)) return '—'; const [e, f] = Math.abs(v).toFixed(d).split('.'); return (v < 0 ? '−' : '') + e.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (f ? ',' + f : ''); };
const usd = (v) => (v === null || v === undefined ? '—' : (v < 0 ? '−$' : '$') + n(Math.abs(v), Math.abs(v) < 1000 ? 2 : 0));
const pct = (v) => (v === null || v === undefined ? '—' : n(v * 100, 1) + ' %');
const out = [];
const T = UE.calcularTodo(pf);
out.push(`# ${pf.nombre}`, '', `**Modelo:** ${pf.modelo || (pf.especializaciones || []).join(' + ')}  `, `**Decisión:** ${pf.decision || '—'}  `, `**Fuente:** ${pf.fuente || '—'}`, '');
const p0 = UE.valores(pf), falta = UE.faltantes(pf, p0);
out.push('## 1. Datos', '', falta.length ? `**Faltan datos:** ${falta.map((id) => pf.parametros.find((d) => d.id === id).etiqueta).join(', ')}. Sin ellos no se calcula nada que dependa de ellos.` : 'Están todos los datos que usa el modelo.', '');
const sup = pf.parametros.filter((d) => d.origen && d.origen !== 'dato');
if (sup.length) out.push('Supuestos (no son datos del caso):', '', ...sup.map((d) => `- ${d.etiqueta}: ${JSON.stringify(d.valor)} (${d.origen}; ${d.fuente || 'sin fuente'})`), '');
out.push('## 2. Escenarios', '');
const ok = T.escenarios.filter((e) => e.r.ok);
if (ok.length) {
  const filas = [['Clientes de anuncios', (r) => n(r.A.pagados, 1)], ['CAC de anuncios', (r) => usd(r.A.cacAnuncios)], ['CAC real (paid)', (r) => usd(r.A.cacReal)], ['CAC blended', (r) => usd(r.A.cacBlended)],
    [`LTV (${ok[0].r.H} meses, sobre contribución)`, (r) => usd(r.ltv)], ['LTV:CAC', (r) => n(r.ltvCac) + ' ' + (r.semaforo || '')], ['Payback (meses)', (r) => (r.payback === null ? 'no recupera' : r.payback)],
    ['CAC marginal frente a la referencia', (r) => (r.marginal && r.marginal.cac !== null && Math.abs(r.marginal.clientesExtra) > 0.01 ? usd(r.marginal.cac) : '—')]];
  if ((pf.especializaciones || []).includes('ecommerce')) filas.push(['ROAS real del primer pedido', (r) => n(r.ecommerce.roasRealPrimerPedido)], ['ROAS de break-even del primer pedido', (r) => n(r.ecommerce.roasBEPrimerPedido)]);
  if ((pf.especializaciones || []).includes('suscripcion')) filas.push(['LTV:CAC blended', (r) => n(r.ltvCacBlended)], ['LTV sin tope (solo comparar)', (r) => usd(r.suscripcion.ltvSinTope)]);
  if ((pf.especializaciones || []).includes('leadgen')) filas.push(['Visitas pedidas / capacidad', (r) => `${n(r.leadgen.cap.pedidas, 1)} / ${n(r.leadgen.cap.capacidad, 0)}`], ...r0canales());
  out.push('| Indicador | ' + T.escenarios.map((e) => e.nombre).join(' | ') + ' |', '|---|' + T.escenarios.map(() => '---:').join('|') + '|');
  for (const [nom, fn] of filas) out.push(`| ${nom} | ` + T.escenarios.map((e) => (e.r.ok ? fn(e.r) : 'faltan datos')).join(' | ') + ' |');
  out.push('');
  for (const e of ok) for (const a of e.r.avisos) out.push(`> Aviso (${e.nombre}): ${a}`);
}
function r0canales() {
  return pf.adquisicion.canales.map((c, i) => [`${c.nombre}: CPL / CAC real / LTV:CAC`, (r) => { const k = r.leadgen.canales[i]; return `${usd(k.cpl)} / ${usd(k.cacReal)} / ${n(k.ltvCac)}`; }]);
}
const hoy = T.escenarios.find((e) => e.rol === 'hoy');
if (hoy && hoy.r.ok) {
  const r = hoy.r; out.push('## 3. Métricas que pueden engañar', '');
  if (r.ecommerce && r.ecommerce.trampa) { const t = r.ecommerce.trampa; out.push(`- ROAS de la plataforma ${n(t.roasAtribuido, 1)} frente a ROAS real del primer pedido ${n(t.roasReal)} (break-even ${n(t.roasBE)}). La plataforma se atribuye ${pct(t.parteAtribuida)} de las ventas totales y ${pct(t.parteRetargeting)} de la inversión es retargeting.`); }
  if (r.suscripcion) out.push(`- CAC blended ${usd(r.A.cacBlended)} (LTV:CAC ${n(r.ltvCacBlended)}) frente a CAC paid ${usd(r.A.cacReal)} (LTV:CAC ${n(r.ltvCac)}). Costo por ${(r.A.canales[0].def.unidadTope || 'registro').toLowerCase()} (arriba del embudo) ${usd(r.suscripcion.costoPorRegistro)}: el CAC paid es ${n(r.suscripcion.vecesCostoRegistro, 1)} veces eso. LTV sin tope ${usd(r.suscripcion.ltvSinTope)} frente a LTV a ${r.H} meses ${usd(r.ltv)}.`);
  if (r.leadgen && r.leadgen.trampa && r.leadgen.trampa.cplVeces) { const t = r.leadgen.trampa; out.push(`- El lead de ${t.barato} es ${n(t.cplVeces, 1)} veces más barato que el de ${t.caro}, pero su cliente cuesta ${pct(t.cacMasCaro)} ${t.cacMasCaro >= 0 ? 'más' : 'menos'}.`); }
  for (const e of T.escenarios) if (e.r.ok && e.r.A.cap && e.r.A.cap.pedidas > e.r.A.cap.capacidad + 1e-9) out.push(`- ${e.nombre}: se piden ${n(e.r.A.cap.pedidas, 1)} y caben ${n(e.r.A.cap.capacidad, 0)}; se pierden ${n(e.r.A.cap.perdidas, 1)}. Más inversión no trae más clientes si no hay capacidad.`);
  if (r.marginal === undefined) out.push('- Sin escenario de referencia no se calcula el CAC marginal.');
  out.push(`- Payback ${r.payback === null ? 'mayor al horizonte' : r.payback + ' meses'}; ${r.primerMesPagaCac ? 'el primer mes paga el CAC' : 'el primer mes no paga el CAC: hay que financiar la adquisición'}.`, '');
}
if (T.sims) {
  out.push('## 4. Simulación de caja', '', '| Plan | Caja mínima (mes) | Caja final | Activos al final | Clientes nuevos | Cumple |', '|---|---:|---:|---:|---:|---|');
  for (const s of T.sims) out.push(`| ${s.nombre} | ${usd(s.r.cajaMin)} (${s.r.mesCajaMin}) | ${usd(s.r.cajaFinal)} | ${n(s.r.activosFinal, 1)} | ${n(s.r.clientesTotal, 1)} | ${s.r.cumple ? 'sí' : 'no: ' + s.r.fallas.join('; ')} |`);
  out.push('');
  const f = T.sims[0].r.filas[0], A = f.adq;
  out.push(`Mes 1 de «${T.sims[0].nombre}»: ${A.canales.map((c) => `${c.nombre} ${usd(c.inv)} → ${n(c.tope, 2)} → ${n(c.clientes, 2)} clientes`).join('; ')}; clientes nuevos ${n(f.nuevos, 2)}; entradas ${usd(f.entradas)}; salidas ${usd(f.salidas)}; caja final ${usd(f.caja)}.`, '');
  if (buscar && pf.busqueda) { const b = UE.buscar(pf, pf.busqueda); out.push(`Búsqueda: ${b.evaluados} planes evaluados con el mismo modelo y reglas. Mejor encontrado: ${b.mejor.texto} → caja mínima ${usd(b.mejor.cajaMin)} (mes ${b.mejor.mesCajaMin}), caja final ${usd(b.mejor.cajaFinal)}, ${b.mejor.cumple ? 'cumple' : 'no cumple'}. No es un óptimo global: es el mejor dentro de ese espacio.`, ''); }
}
const rc = T.recomendacion;
out.push('## 5. Recomendación', '', `**${rc.titulo}**`, '', ...rc.razones.map((x) => '- ' + x), '', rc.riesgos.length ? '**Riesgos:** ' + rc.riesgos.join(' ') : '', '');
console.log(out.join('\n'));
