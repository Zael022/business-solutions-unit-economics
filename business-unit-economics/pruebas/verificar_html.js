#!/usr/bin/env node
/* Abre cada calculadora en Chromium (Playwright), lee los números que muestra y los compara con el motor
 * (menos de 1 % de diferencia), mueve un control, revisa que todo se actualice y prueba el botón de volver.
 * Uso: node pruebas/verificar_html.js <carpeta_calculadoras> */
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const UE = require('../motor/motor.js');
const DIR = process.argv[2] || path.join(__dirname, '..', '..', 'calculadoras');
const P = (n) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'perfiles', n + '.json'), 'utf8'));
let ok = 0, mal = 0; const fallas = [];
const es = (n, c, d = '') => { c ? ok++ : (mal++, fallas.push(n)); console.log(`${c ? 'PASA ' : 'FALLA'} ${n}${d ? ': ' + d : ''}`); };
const leer = (t) => { const m = /(−)?\$?([\d.]+(?:,\d+)?)/.exec(t); if (!m) return null; return (m[1] ? -1 : 1) * parseFloat(m[2].replace(/\./g, '').replace(',', '.')); };
const casi = (a, b) => a !== null && b !== null && Math.abs(a - b) <= 0.01 * Math.max(Math.abs(b), 1e-9) + 0.006;

const CASOS = [
  ['calculadora-tueste.html', 'tueste', { 'CAC real': (r) => r.A.cacReal, 'LTV a 12 meses': (r) => r.ltv, 'LTV:CAC': (r) => r.ltvCac, 'ROAS real del primer pedido': (r) => r.ecommerce.roasRealPrimerPedido, 'ROAS de break-even': (r) => r.ecommerce.roasBEPrimerPedido, 'Margen de contribución del pedido': (r) => r.ecommerce.contribPedido, 'Payback': (r) => r.payback, 'CAC marginal': (r) => (r.marginal && r.marginal.clientesExtra > 0.01 ? r.marginal.cac : null) }, ['c_inv_meta', 16000, { inv_meta: 16000 }], ['c_envio', 5.5, { envio: 5.5 }]],
  ['calculadora-agendo.html', 'agendo', { 'CAC paid': (r) => r.A.cacReal, 'CAC blended': (r) => r.A.cacBlended, 'LTV a 24 meses': (r) => r.ltv, 'LTV:CAC paid': (r) => r.ltvCac, 'LTV:CAC blended': (r) => r.ltvCacBlended, 'Payback': (r) => r.payback, 'Vendedoras necesarias': (r) => r.suscripcion.vendedoras, 'CAC marginal': (r) => (r.marginal && r.marginal.clientesExtra > 0.01 ? r.marginal.cac : null) }, ['c_inv', 30000, { inv: 30000 }], ['c_churn', 0.08, { churn: 0.08 }]],
  ['calculadora-sol-de-casa.html', 'sol-de-casa', { 'CAC real': (r) => r.A.cacReal, 'CAC de anuncios': (r) => r.A.cacAnuncios, 'LTV:CAC': (r) => r.ltvCac, 'Ventas al mes': (r) => r.A.pagados, 'Contribución de una venta': (r) => r.leadgen.contribVenta, 'Payback': (r) => r.payback }, ['c_inv_meta', 8000, { inv_meta: 8000 }], ['c_m_contacto', 0.65, { m_contacto: 0.65 }]],
  ['calculadora-universal.html', 'ejemplo-gimnasio', { 'CAC paid': (r) => r.A.cacReal, 'LTV a 12 meses': (r) => r.ltv, 'LTV:CAC paid': (r) => r.ltvCac, 'Payback': (r) => r.payback }, ['c_inv_meta', 9000, { inv_meta: 9000 }], ['c_churn', 0.1, { churn: 0.1 }]],
];
(async () => {
  const b = await chromium.launch();
  for (const [archivo, perfil, kpis, ...movs] of CASOS) {
    const pf = P(perfil), pg = await b.newPage({ viewport: { width: 1300, height: 900 } }), errs = [];
    pg.on('pageerror', (e) => errs.push(e.message));
    await pg.route('**/*', (r) => (r.request().url().startsWith('file:') ? r.continue() : (errs.push('pidió internet: ' + r.request().url()), r.abort())));
    await pg.goto('file://' + path.resolve(DIR, archivo)); await pg.waitForTimeout(300);
    const revisar = async (etq, cambios) => {
      const r = UE.escenario(pf, cambios);
      const vistos = await pg.$$eval('.kpi', (els) => els.map((e) => [e.querySelector('span').innerText, e.querySelector('strong') ? e.querySelector('strong').innerText : '']));
      for (const [n, fn] of Object.entries(kpis)) {
        const k = vistos.find((x) => x[0] === n), esperado = fn(r);
        if (!k) { es(`${archivo} · ${etq} · el KPI «${n}» está en pantalla`, false); continue; }
        const visto = /no recupera|—|igual|menos clientes/.test(k[1]) ? null : leer(k[1]);
        es(`${archivo} · ${etq} · ${n}`, esperado === null ? visto === null : casi(visto, esperado), `pantalla «${k[1]}» · motor ${esperado === null ? 'vacío' : esperado.toFixed(4)}`);
      }
    };
    await revisar('datos del caso', {});
    const cuantasGraf = await pg.$$eval('#p_calc .g svg', (s) => s.length);
    es(`${archivo} · tiene al menos 3 gráficos dibujados`, cuantasGraf >= 3, cuantasGraf + ' gráficos');
    const acum = {};
    for (const [id, v, ch] of movs) {
      await pg.$eval('#' + id, (el, v) => { el.value = v; el.dispatchEvent(new Event('input')); }, v);
      Object.assign(acum, ch); await revisar('con ' + JSON.stringify(acum), acum);
    }
    await pg.click('#reset'); await pg.waitForTimeout(100); await revisar('después de «Volver a los datos del caso»', {});
    await pg.click('#t_sim'); await pg.waitForTimeout(200);
    const filas = await pg.$$eval('#sim_tabla tbody tr', (trs) => trs.map((t) => [...t.children].map((c) => c.innerText)));
    const T = UE.calcularTodo(pf);
    T.sims.forEach((s, i) => es(`${archivo} · simulador · ${s.nombre.slice(0, 50)} · caja mes 24`, casi(leer(filas[i][2]), s.r.cajaFinal), filas[i][2]));
    const m1 = await pg.innerText('#mes1');
    es(`${archivo} · revisión del mes 1 muestra la caja final del plan`, m1.includes('Caja final del mes 1'));
    await pg.click('#buscar'); await pg.waitForSelector('#usar', { timeout: 30000 });
    const bt = await pg.innerText('#busq'), best = UE.buscar(pf, pf.busqueda).mejor;
    es(`${archivo} · «Buscar el mejor plan» da el mismo resultado que el motor`, bt.includes(best.texto.split(' · ')[0]), bt.slice(0, 120));
    es(`${archivo} · sin errores de JavaScript y sin pedir nada a internet`, errs.length === 0, errs.join(' | '));
    await pg.close();
  }
  await b.close();
  console.log(`\nRESULTADO: ${ok} pasan, ${mal} fallan.` + (mal ? '\nFallan: ' + fallas.join(' | ') : ''));
  process.exit(mal ? 1 : 0);
})();
