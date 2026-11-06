/* Interfaz común de las calculadoras. Lee window.PERFIL (y window.PLANTILLAS en la universal). */
(function () {
  'use strict';
  const UE = window.UE, G = window.G;
  const clon = (o) => JSON.parse(JSON.stringify(o));
  const $ = (s, el) => (el || document).querySelector(s);
  const UNIVERSAL = !!window.UNIVERSAL;
  let ORIGINAL = clon(window.PERFIL), perfil = clon(ORIGINAL), base = {}, editable = null, busqueda = null;

  /* ------------------------------------------------ formato (miles con punto, decimales con coma) */
  function numero(v, d) {
    if (v === null || v === undefined || !isFinite(v)) return '—';
    const neg = v < 0, s = Math.abs(v).toFixed(d), [e, f] = s.split('.');
    return (neg ? '−' : '') + e.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (f ? ',' + f : '');
  }
  const F = {
    usd: (v, d) => (v === null || v === undefined || !isFinite(v) ? '—' : (v < 0 ? '−$' : '$') + numero(Math.abs(v), d === undefined ? (Math.abs(v) < 1000 ? 2 : 0) : d)),
    pct: (v, d = 1) => (v === null || !isFinite(v) ? '—' : numero(v * 100, d) + ' %'),
    x: (v, d = 2) => (v === null || !isFinite(v) ? '—' : numero(v, d) + '×'),
    n: (v, d = 1) => numero(v, d),
    meses: (v) => (v === null || v === undefined ? 'no recupera' : v + (v === 1 ? ' mes' : ' meses')),
  };
  const fmtU = (v, u) => (u === '$' ? F.usd(v) : u === '%' ? F.pct(v) : u === 'x' ? F.x(v) : u === 'texto' ? String(v) : Array.isArray(v) ? JSON.stringify(v) : F.n(v, Number.isInteger(v) ? 0 : 2));
  const SEM = { rojo: ['mal', 'ROJO: pierde plata'], amarillo: ['medio', 'AMARILLO: deja poco'], verde: ['ok', 'VERDE: sano'] };
  const sem = (s) => (s ? `<span class="sem ${SEM[s][0]}">${SEM[s][1]}</span>` : '');
  const tiene = (e) => (perfil.especializaciones || []).includes(e);
  const def = (id) => perfil.parametros.find((d) => d.id === id);

  /* ------------------------------------------------ controles */
  function renderControles() {
    const cont = $('#ctls'); cont.innerHTML = '';
    const pv = UE.valores(perfil, base);
    let grupo = null;
    for (const d of perfil.parametros.filter((x) => x.control)) {
      if (d.grupo !== grupo) { grupo = d.grupo; cont.insertAdjacentHTML('beforeend', `<div class="grupo">${d.grupo}</div>`); }
      const w = document.createElement('div'); w.className = 'ctl';
      const v = pv[d.id] === null ? d.min || 0 : pv[d.id];
      w.innerHTML = `<label for="c_${d.id}"><span>${d.etiqueta}</span><b id="v_${d.id}">${fmtU(v, d.unidad)}</b></label><input type="range" id="c_${d.id}" min="${d.min}" max="${d.max}" step="${d.paso}" value="${v}">`;
      cont.appendChild(w);
      w.querySelector('input').addEventListener('input', (e) => { base[d.id] = parseFloat(e.target.value); $('#v_' + d.id).textContent = fmtU(base[d.id], d.unidad); actualizar(); });
    }
    const esc = $('#escs'); esc.innerHTML = '';
    for (const e of perfil.escenarios || []) {
      const b = document.createElement('button'); b.className = 'chip'; b.textContent = e.nombre;
      b.onclick = () => { Object.assign(base, e.cambios || {}); renderControles(); actualizar(); };
      esc.appendChild(b);
    }
  }

  /* ------------------------------------------------ nivel 1 y 2 */
  function kpis(r) {
    if (!r.ok) return `<div class="aviso">Faltan datos para calcular: ${r.faltan.map((id) => (def(id) || { etiqueta: id }).etiqueta).join(', ')}.</div>`;
    const k = (t, v, a, c = '') => `<div class="kpi ${c}"><span>${t}</span><strong>${v}</strong><small>${a}</small></div>`;
    const out = [];
    if (tiene('ecommerce')) {
      const e = r.ecommerce, t0 = e.tiposPedido[0];
      out.push(k('Margen de contribución del pedido', F.usd(e.contribPedido), t0 ? `${F.pct(e.contribPedido / t0.paga)} del pedido de ${F.usd(t0.paga)}` : ''));
      out.push(k('ROAS de break-even', F.x(e.roasBEPrimerPedido), 'del primer pedido (1 ÷ margen)'));
      out.push(k('ROAS real del primer pedido', F.x(e.roasRealPrimerPedido), 'clientes nuevos × primer pedido ÷ inversión', e.roasRealPrimerPedido < e.roasBEPrimerPedido ? 'mal' : 'ok'));
    }
    if (tiene('suscripcion')) {
      const s = r.suscripcion;
      out.push(k('Margen mensual de un cliente', F.usd(s.contribMes), 'precio × margen bruto'));
      if (s.vendedoras !== null) out.push(k('Vendedoras necesarias', F.n(s.vendedoras, 0), `para ${F.n(r.A.canales[0].tope, 0)} trials`));
    }
    const venta = r.U.segmentos.some((s) => s.info.tipo === 'venta');
    if (tiene('leadgen')) {
      if (venta) out.push(k('Contribución de una venta', F.usd(r.leadgen.contribVenta), 'antes de marketing'));
      const cap = r.leadgen.cap;
      out.push(k('Visitas pedidas / capacidad', `${F.n(cap.pedidas, 1)} / ${F.n(cap.capacidad, 0)}`, cap.pedidas > cap.capacidad ? `⚠ se pierden ${F.n(cap.perdidas, 1)} visitas` : `uso ${F.pct(cap.uso)}`, cap.pedidas > cap.capacidad ? 'mal' : 'ok'));
      out.push(k('Ventas al mes', F.n(r.A.pagados, 1), 'después de la capacidad'));
    }
    out.push(k('CAC de anuncios', F.usd(r.A.cacAnuncios), 'solo inversión ÷ clientes de anuncios'));
    out.push(k(tiene('suscripcion') ? 'CAC paid' : 'CAC real', F.usd(r.A.cacReal), 'todo lo que cuesta conseguirlos ÷ clientes de anuncios'));
    if (tiene('suscripcion')) out.push(k('CAC blended', F.usd(r.A.cacBlended), 'mezcla los orgánicos: no sirve para decidir anuncios'));
    out.push(k(`LTV a ${r.H} ${r.H === 1 ? 'mes' : 'meses'}`, F.usd(r.ltv), venta ? 'una venta (sin recompra)' : 'sobre contribución, no sobre ventas'));
    out.push(k(tiene('suscripcion') ? 'LTV:CAC paid' : 'LTV:CAC', F.x(r.ltvCac), sem(r.semaforo), r.semaforo ? SEM[r.semaforo][0] : ''));
    if (tiene('suscripcion')) out.push(k('LTV:CAC blended', F.x(r.ltvCacBlended), 'el que se ve sano y engaña'));
    out.push(k('Payback', F.meses(r.payback), r.primerMesPagaCac ? 'el primer mes ya paga el CAC' : 'el primer mes no alcanza a pagar el CAC'));
    if (r.marginal) out.push(k('CAC marginal', r.marginal.cac === null ? '—' : r.marginal.clientesExtra > 0.01 ? F.usd(r.marginal.cac) : r.marginal.clientesExtra < -0.01 ? 'menos clientes' : '—', r.marginal.clientesExtra > 0.01 ? `${F.n(r.marginal.clientesExtra, 0)} clientes extra frente a la referencia` : r.marginal.clientesExtra < -0.01 ? `se dejan de traer ${F.n(-r.marginal.clientesExtra, 0)} clientes que costaban ${F.usd(r.marginal.cac)} c/u` : 'igual a la referencia', r.marginal.dejaPlata === false ? 'mal' : ''));
    if (tiene('suscripcion')) out.push(k('LTV sin tope (solo para comparar)', F.usd(r.suscripcion.ltvSinTope), 'margen ÷ cancelación: supone clientes eternos'));
    if (tiene('leadgen')) {
      const cs = r.leadgen.canales, tot = { leads: 0, pedidas: 0, hechas: 0, clientes: 0, inv: 0 };
      cs.forEach((c) => { for (const x in tot) tot[x] += c[x] || 0; });
      out.push(`<div class="kpi ancho"><span>Por canal y en total</span><div class="scroll"><table class="tabla"><thead><tr><th>Canal</th><th>Leads</th><th>Visitas pedidas</th><th>Visitas hechas</th><th>Ventas</th><th>CPL</th><th>CAC de anuncios</th><th>CAC real</th><th>LTV:CAC</th><th>Valor de una visita</th></tr></thead><tbody>` +
        cs.map((c) => `<tr><td>${c.nombre}</td><td>${F.n(c.leads, 0)}</td><td>${F.n(c.pedidas, 1)}</td><td>${F.n(c.hechas, 1)}</td><td>${F.n(c.clientes, 2)}</td><td>${F.usd(c.cpl)}</td><td>${F.usd(c.cacAnuncios)}</td><td>${F.usd(c.cacReal)}</td><td>${F.x(c.ltvCac)} ${sem(c.semaforo)}</td><td>${F.usd(c.valorVisita)}</td></tr>`).join('') +
        `<tr><td><b>Total</b></td><td>${F.n(tot.leads, 0)}</td><td>${F.n(tot.pedidas, 1)}</td><td>${F.n(tot.hechas, 1)}</td><td>${F.n(tot.clientes, 2)}</td><td>${F.usd(UE.div(tot.inv, tot.leads))}</td><td>${F.usd(r.A.cacAnuncios)}</td><td>${F.usd(r.A.cacReal)}</td><td>${F.x(r.ltvCac)} ${sem(r.semaforo)}</td><td>—</td></tr></tbody></table></div><small>Capacidad: ${F.n(r.leadgen.cap.capacidad, 0)} visitas; se usan ${F.n(r.leadgen.cap.hechas, 1)}. ${r.leadgen.cap.perdidas > 0.01 ? '⚠ Se pierden ' + F.n(r.leadgen.cap.perdidas, 1) + ' visitas pedidas.' : ''}</small></div>`);
    }
    return out.join('');
  }
  function textoTrampa(r) {
    if (!r.ok) return '';
    if (tiene('ecommerce') && r.ecommerce.trampa) {
      const t = r.ecommerce.trampa;
      return `<h3>La trampa: el ROAS de ${F.x(t.roasAtribuido, 1)} de Ads Manager</h3><p>Meta se atribuye el ${F.pct(t.parteAtribuida, 0)} de las ventas de la tienda, incluidas recompras, y el ${F.pct(t.parteRetargeting, 0)} de la inversión va a gente que ya visitó o ya compró. Contando solo el primer pedido de los clientes nuevos, el ROAS real es <b>${F.x(t.roasReal)}</b>, cuando el mínimo para no perder es <b>${F.x(t.roasBE)}</b>.</p>`;
    }
    if (tiene('suscripcion') && r.suscripcion.laminaLtvCac !== null) {
      const s = r.suscripcion;
      return `<h3>La trampa: el LTV:CAC de ${F.x(s.laminaLtvCac, 1)} de la lámina</h3><p>Ese número divide por todos los clientes nuevos, incluidos ${F.n(r.A.organicos, 0)} orgánicos que no costaron nada (CAC blended ${F.usd(r.A.cacBlended)}). Para decidir sobre anuncios hay que mirar solo a los clientes de anuncios: CAC paid <b>${F.usd(r.A.cacReal)}</b> y LTV:CAC <b>${F.x(r.ltvCac)}</b>. El costo por registro de ${F.usd(s.costoPorRegistro)} es el de una prueba gratis: el CAC paid es ${F.n(s.vecesCostoRegistro, 1)} veces eso.</p>`;
    }
    if (tiene('leadgen') && r.leadgen.trampa && r.leadgen.trampa.cplVeces) {
      const t = r.leadgen.trampa;
      return `<h3>La trampa: el costo por lead</h3><p>El lead de ${t.barato} es <b>${F.n(t.cplVeces, 1)} veces más barato</b> que el de ${t.caro}, pero el cliente de ${t.barato} cuesta <b>${F.pct(t.cacMasCaro, 0)} ${t.cacMasCaro >= 0 ? 'más' : 'menos'}</b>. Lo que importa es el costo por cliente que firma, incluidas las visitas.</p>`;
    }
    return '';
  }
  const FILAS = () => {
    const f = [
      ['Clientes de anuncios', (r) => F.n(r.A.pagados, 1)],
      ['Inversión en anuncios', (r) => F.usd(r.A.ads, 0)],
      ['CAC de anuncios', (r) => F.usd(r.A.cacAnuncios)],
      [tiene('suscripcion') ? 'CAC paid' : 'CAC real', (r) => F.usd(r.A.cacReal)],
      ['CAC blended', (r) => F.usd(r.A.cacBlended)],
      [`LTV`, (r) => F.usd(r.ltv)],
      ['LTV:CAC', (r) => F.x(r.ltvCac) + ' ' + sem(r.semaforo)],
      ['Payback', (r) => F.meses(r.payback)],
      ['CAC marginal frente a la referencia', (r) => (r.marginal && Math.abs(r.marginal.clientesExtra) > 0.01 && r.marginal.cac !== null ? F.usd(r.marginal.cac) + (r.marginal.clientesExtra < 0 ? ' (clientes que se dejan de traer)' : '') : '—')],
    ];
    if (tiene('ecommerce')) f.splice(1, 0, ['Contribución del primer pedido', (r) => F.usd(r.ecommerce.contribPrimerPedido)], ['Contribución de los pedidos siguientes', (r) => F.usd(r.ecommerce.contribPedido)], ['ROAS de break-even del primer pedido', (r) => F.x(r.ecommerce.roasBEPrimerPedido)], ['ROAS real del primer pedido', (r) => F.x(r.ecommerce.roasRealPrimerPedido)]);
    if (tiene('suscripcion')) f.splice(1, 0, ['Trials', (r) => F.n(r.A.canales[0].tope, 0)], ['Vendedoras', (r) => F.n(r.suscripcion.vendedoras, 0)], ['Costo por registro', (r) => F.usd(r.suscripcion.costoPorRegistro)], ['LTV:CAC blended', (r) => F.x(r.ltvCacBlended)], ['Caja atrapada al mes frente a la referencia', (r) => F.usd(r.suscripcion.cajaAtrapadaMes)]);
    if (tiene('leadgen')) f.splice(1, 0, ['Visitas pedidas / capacidad', (r) => `${F.n(r.leadgen.cap.pedidas, 1)} / ${F.n(r.leadgen.cap.capacidad, 0)}`], ...[0, 1].map((i) => [`${perfil.adquisicion.canales[i] ? perfil.adquisicion.canales[i].nombre : ''} · CPL / CAC real / LTV:CAC`, (r) => { const c = r.leadgen.canales[i]; return c ? `${F.usd(c.cpl)} / ${F.usd(c.cacReal)} / ${F.x(c.ltvCac)}` : '—'; }]), ['Resultado del mes (después de anuncios y visitas)', (r) => F.usd(r.leadgen.resultadoMes, 0)]);
    return f;
  };
  function tabla(escs) {
    let h = '<table class="tabla"><thead><tr><th>Indicador</th>' + escs.map((e) => `<th>${e.nombre}</th>`).join('') + '</tr></thead><tbody>';
    for (const [n, fn] of FILAS()) h += `<tr><td>${n}</td>` + escs.map((e) => `<td>${e.r.ok ? fn(e.r) : 'faltan datos'}</td>`).join('') + '</tr>';
    return h + '</tbody></table>';
  }
  function graficos(r, escs) {
    const ok = escs.filter((e) => e.r.ok);
    if (!r.ok || !ok.length) return;
    const H = r.H, xs = Array.from({ length: H + 1 }, (_, i) => String(i));
    let series = ok.map((e) => ({ nombre: e.nombre, datos: e.r.curva }));
    if (tiene('suscripcion')) {
      const hoy = ok.find((e) => e.rol === 'hoy') || ok[0], alt = ok.find((e) => e.rol === 'alternativa');
      series = [{ nombre: 'Cliente mensual (hoy)', datos: hoy.r.suscripcion.curvaMensual }, { nombre: 'Cliente anual (hoy)', datos: hoy.r.suscripcion.curvaPrepago }];
      if (alt) series.push({ nombre: alt.nombre, datos: alt.r.curva });
      series = series.filter((s) => s.datos);
    }
    series.push({ nombre: 'Vista actual (controles)', datos: r.curva, punteada: true, color: 'var(--tx2)' });
    const obj = perfil.paybackObjetivo;
    G.lineas($('#g_curva'), { x: xs, xNombre: 'Mes', xTitulo: 'Mes de vida del cliente (0 = se pagó el CAC)', series, yFmt: (v) => F.usd(v, 0), refY: [{ y: 0, texto: 'Cero: recuperó el CAC' }], refX: obj ? [{ x: String(obj), texto: `payback objetivo: ${obj} meses` }] : [] });
    const pts = [];
    ok.forEach((e, i) => { pts.push({ nombre: e.nombre + (tiene('suscripcion') ? ' · paid' : ''), x: e.r.A.cacReal, y: e.r.ltv, color: G.COL[i] }); });
    if (tiene('suscripcion')) { const hoy = ok.find((e) => e.rol === 'hoy') || ok[0]; pts.push({ nombre: hoy.nombre + ' · blended', x: hoy.r.A.cacBlended, y: hoy.r.ltv, color: 'var(--tx2)' }); }
    G.dispersion($('#g_ltvcac'), { puntos: pts, rectas: [{ m: 1, texto: '1 a 1', clase: 'mal' }, { m: 3, texto: '3 a 1', clase: 'ok' }], xFmt: (v) => F.usd(v, 0), yFmt: (v) => F.usd(v, 0), xTitulo: 'CAC', yTitulo: 'LTV' });
    // respuesta a la inversión y CAC marginal por tramo
    const c0 = perfil.adquisicion.canales.find((c) => c.historial) || perfil.adquisicion.canales[0];
    const hist = UE.ev(c0.historial, r.p), pts2 = UE.puntos(hist), max = pts2[pts2.length - 1][0];
    const paso = max / 20, invs = Array.from({ length: 21 }, (_, i) => i * paso);
    const inv = r.A.canales.find((c) => c.id === c0.id).inv;
    const etq = invs.map((v) => F.usd(v, 0));
    const cerca = etq[Math.round(Math.min(inv, max) / paso)];
    G.lineas($('#g_resp'), { x: etq, xNombre: 'Inversión', xTitulo: `Inversión mensual en ${c0.nombre}`, series: [{ nombre: c0.unidadTope || 'Clientes', datos: invs.map((v) => UE.interp(v, hist).v) }], yFmt: (v) => F.n(v, 0), refX: [{ x: cerca, texto: 'inversión elegida' }] });
    const tr = UE.tramos(hist);
    const conv = (c0.etapas || []).filter((e) => !e.capacidad).reduce((x, e) => x * UE.ev(e.tasa, r.p), 1) * UE.ev(c0.factor === undefined ? 1 : c0.factor, r.p);
    G.barras($('#g_marg'), { categorias: tr.map((t) => `${F.usd(t.de, 0)}–${F.usd(t.a, 0)}`), series: [{ nombre: 'CAC marginal de anuncios por cliente', datos: tr.map((t) => (t.cac === null ? null : t.cac / conv)) }], yFmt: (v) => F.usd(v, 0), etiquetas: true, refY: [{ y: r.ltv, texto: 'LTV ' + F.usd(r.ltv, 0), clase: 'ok' }],
      nota: (c0.etapas || []).length ? `Inversión extra ÷ clientes extra de cada tramo (${(c0.unidadTope || 'contactos').toLowerCase()} × las tasas del embudo, sin límite de capacidad). Solo anuncios: sin otros costos de adquisición.` : 'Inversión extra ÷ clientes extra de cada tramo del historial (solo anuncios).' });
    // la trampa en un gráfico
    if (tiene('ecommerce') && r.ecommerce.trampa) {
      const t = r.ecommerce.trampa;
      G.barras($('#g_trampa'), { categorias: ['ROAS de Ads Manager', 'ROAS real del 1.er pedido', 'ROAS de break-even'], series: [{ nombre: 'ROAS', datos: [t.roasAtribuido, t.roasReal, t.roasBE] }], coloresBarra: ['var(--s1)', 'var(--mal)', 'var(--tx2)'], yFmt: (v) => F.x(v, 1), etiquetas: true, refY: [{ y: t.roasBE, texto: 'break-even ' + F.x(t.roasBE), clase: 'mal' }],
        nota: `Meta dice ${F.x(t.roasAtribuido, 1)}; lo que de verdad traen los clientes nuevos en su primer pedido es ${F.x(t.roasReal)}, debajo del mínimo de ${F.x(t.roasBE)}.` });
    } else if (tiene('suscripcion') && r.suscripcion.laminaLtvCac !== null) {
      const s = r.suscripcion;
      G.barras($('#g_trampa'), { categorias: ['Lámina de Valeria', 'LTV:CAC blended', 'LTV:CAC paid'], series: [{ nombre: 'LTV:CAC', datos: [s.laminaLtvCac, s.ltvCacBlended, s.ltvCacPaid] }], coloresBarra: ['var(--s1)', 'var(--s4)', 'var(--mal)'], yFmt: (v) => F.x(v, 1), etiquetas: true, refY: [{ y: 1, texto: '1 a 1', clase: 'mal' }, { y: 3, texto: '3 a 1', clase: 'ok' }],
        nota: `El 2,4 sale de mezclar orgánicos gratis. Con solo los clientes de anuncios: ${F.x(s.ltvCacPaid)}.` });
      G.barras($('#g_extra'), { categorias: ['Trials', 'Clientes de anuncios', 'Clientes orgánicos'], series: [{ nombre: 'Cantidad al mes', datos: [r.A.canales[0].tope, r.A.pagados, r.A.organicos] }], yFmt: (v) => F.n(v, 0), etiquetas: true, nota: `Embudo: ${F.usd(r.A.ads, 0)} de inversión → ${F.n(r.A.canales[0].tope, 0)} trials → ${F.pct(UE.ev(perfil.adquisicion.canales[0].etapas[0].tasa, r.p))} pagan.` });
    }
    if (tiene('leadgen')) {
      const cs = r.leadgen.canales, t = r.leadgen.trampa;
      if (!(tiene('suscripcion') && r.suscripcion.laminaLtvCac !== null))
      G.barras($('#g_trampa'), { categorias: cs.map((c) => c.nombre + ' · CPL').concat(cs.map((c) => c.nombre + ' · CAC real')), series: [{ nombre: 'Costo', datos: cs.map((c) => c.cpl).concat(cs.map((c) => c.cacReal)) }], coloresBarra: cs.map(() => 'var(--s3)').concat(cs.map(() => 'var(--s2)')), yFmt: (v) => F.usd(v, 0), etiquetas: true,
        nota: t && t.cplVeces ? `<b>El lead de ${t.barato} es ${F.n(t.cplVeces, 1)} veces más barato, pero el cliente de ${t.barato} cuesta ${F.pct(t.cacMasCaro, 0)} ${t.cacMasCaro >= 0 ? 'más' : 'menos'}.</b>` : 'Con un solo canal activo no hay comparación de CPL.' });
      const pasos = (c) => c.etapas.filter((e) => !e.capacidad && !/^Hechas/.test(e.nombre));
      const etapas = pasos(cs[0]).map((e) => e.nombre);
      G.barras($('#g_extra'), { categorias: etapas, series: cs.map((c) => ({ nombre: c.nombre, datos: pasos(c).map((e) => (c.leads > 0 ? e.n / c.leads : null)) })), yFmt: (v) => F.pct(v, 0), nota: 'Embudo de cada canal como % de sus leads (ventas después de la capacidad).' });
      const cap = r.leadgen.cap;
      G.barras($('#g_cap'), { categorias: cs.map((c) => c.nombre).concat(['Total']), series: [{ nombre: 'Visitas pedidas', datos: cs.map((c) => c.pedidas).concat([cap.pedidas]) }], coloresBarra: cs.map(() => 'var(--s1)').concat([cap.pedidas > cap.capacidad ? 'var(--mal)' : 'var(--s3)']), yFmt: (v) => F.n(v, 0), etiquetas: true, refY: [{ y: cap.capacidad, texto: 'capacidad ' + F.n(cap.capacidad, 0), clase: 'mal' }],
        nota: cap.pedidas > cap.capacidad ? `⚠ Se piden ${F.n(cap.pedidas, 1)} visitas y caben ${F.n(cap.capacidad, 0)}: se pierden ${F.n(cap.perdidas, 1)} (primero se atiende ${perfil.adquisicion.capacidad.prioridad[0]}).` : `Uso de la capacidad: ${F.pct(cap.uso)}.` });
    }
  }
  function recomendacion(T) {
    const rc = T.recomendacion;
    return `<h3>${rc.titulo}</h3><ul>${rc.razones.map((x) => `<li>${x}</li>`).join('')}</ul>` + (rc.riesgos.length ? `<p class="nota"><b>Riesgos:</b> ${rc.riesgos.join(' ')}</p>` : '');
  }

  /* ------------------------------------------------ nivel 3 */
  function planesActuales() {
    const lista = (perfil.planes || []).map((d) => ({ d, pl: UE.plan(perfil, d, base) }));
    if (editable) lista.push({ d: { nombre: editable.nombre }, pl: editable, editable: true });
    return lista;
  }
  function renderSim() {
    if (!perfil.simulacion || !(perfil.planes || []).length) { $('#sim_tabla').innerHTML = '<p class="aviso">Este perfil no trae datos de caja o planes: agregá las secciones «simulacion» y «planes» para proyectar 24 meses.</p>'; return; }
    let lista;
    try { if (!editable) { editable = UE.plan(perfil, perfil.planes[0], base); editable.nombre = 'Plan editable'; } lista = planesActuales(); }
    catch (e) { editable = null; $('#sim_tabla').innerHTML = `<p class="aviso">No se puede simular: ${e.message}. Completá los datos en «Datos y supuestos».</p>`; return; }
    const S = perfil.simulacion;
    let sims;
    try { sims = lista.map((x) => ({ ...x, r: UE.simular(perfil, x.pl, base) })); }
    catch (e) { $('#sim_tabla').innerHTML = `<p class="aviso">No se puede simular: ${e.message}. Completá los datos en «Datos y supuestos».</p>`; return; }
    const etqAct = S.etiquetaActivos || 'Clientes activos', esLead = tiene('leadgen');
    let h = '<table class="tabla"><thead><tr><th>Plan</th><th>Caja mínima (mes)</th><th>Caja mes ' + (S.meses || 24) + '</th><th>' + etqAct + ' mes ' + (S.meses || 24) + '</th><th>' + (S.etiquetaTotal || 'Clientes nuevos de anuncios (24 meses)') + '</th><th>¿Cumple las reglas?</th></tr></thead><tbody>';
    for (const s of sims) h += `<tr><td>${s.d.nombre}</td><td>${F.usd(s.r.cajaMin, 0)} (${s.r.mesCajaMin})</td><td>${F.usd(s.r.cajaFinal, 0)}</td><td>${F.n(s.r.activosFinal, 1)}</td><td>${F.n(s.r.clientesTotal, 1)}</td><td>${s.r.cumple ? '<span class="sem ok">Sí</span>' : '<span class="sem mal">No</span> ' + s.r.fallas.join('; ')}</td></tr>`;
    h += '</tbody></table>';
    $('#sim_tabla').innerHTML = h;
    const xs = Array.from({ length: S.meses || 24 }, (_, i) => String(i + 1));
    G.lineas($('#g_caja'), { x: xs, xNombre: 'Mes', xTitulo: 'Mes', series: sims.map((s, i) => ({ nombre: s.d.nombre, datos: s.r.filas.map((f) => f.caja), punteada: s.editable, color: s.editable ? 'var(--tx2)' : G.COL[i] })), yFmt: (v) => F.usd(v, 0), refY: [{ y: sims[0].r.piso, texto: 'piso ' + F.usd(sims[0].r.piso, 0), clase: 'mal' }] });
    const sel = sims.find((s) => s.editable) || sims[0];
    if (esLead) G.lineas($('#g_act'), { x: xs, xNombre: 'Mes', xTitulo: 'Mes · ' + sel.d.nombre, series: [{ nombre: 'Visitas pedidas', datos: sel.r.filas.map((f) => f.pedidas) }, { nombre: 'Capacidad', datos: sel.r.filas.map((f) => f.capacidad), color: 'var(--mal)', punteada: true }], yFmt: (v) => F.n(v, 0) });
    else G.lineas($('#g_act'), { x: xs, xNombre: 'Mes', xTitulo: 'Mes', series: sims.map((s, i) => ({ nombre: s.d.nombre, datos: s.r.filas.map((f) => f.activos), punteada: s.editable, color: s.editable ? 'var(--tx2)' : G.COL[i] })), yFmt: (v) => F.n(v, 0) });
    $('#g_act_tit').textContent = esLead ? 'Visitas pedidas frente a la capacidad (plan editable)' : etqAct + ' mes a mes';
    renderEditable(sel);
  }
  function renderEditable(sel) {
    const S = perfil.simulacion, canales = perfil.adquisicion.canales, M = S.meses || 24, pl = editable, r = sel.r;
    const conContr = !!S.costoContratacion;
    let h = '<table class="tabla mes"><thead><tr><th>Mes</th>' + canales.map((c) => `<th>Inversión ${c.nombre}</th>`).join('') + (conContr ? '<th>Contratados (acum.)</th>' : '') +
      `<th>${canales[0].unidadTope || 'Tope'}</th>` + (r.filas[0].escalones.length ? '<th>' + perfil.adquisicion.escalones[0].nombre + '</th>' : '') + (tiene('leadgen') ? '<th>Visitas pedidas</th><th>Capacidad</th><th>Hechas</th>' : '') +
      '<th>Clientes nuevos</th>' + (S.base ? '<th>Contribución clientes actuales</th>' : '') + '<th>Contribución grupos nuevos</th><th>Entradas</th><th>Salidas</th><th>Caja final</th><th>' + (S.etiquetaActivos || 'Activos') + '</th><th>Alerta</th></tr></thead><tbody>';
    r.filas.forEach((f, i) => {
      h += `<tr class="${f.bajoPiso ? 'bajo' : ''}"><td>${f.mes}</td>` + canales.map((c) => `<td><input class="celda" data-c="${c.id}" data-m="${i}" type="number" step="500" value="${pl.inversiones[c.id][i]}"></td>`).join('') +
        (conContr ? `<td><input class="celda" data-c="__contr" data-m="${i}" type="number" min="0" step="1" value="${pl.contratados[i]}"></td>` : '') +
        `<td>${F.n(f.tope, 1)}</td>` + (f.escalones.length ? `<td>${f.escalones[0]}</td>` : '') + (tiene('leadgen') ? `<td>${F.n(f.pedidas, 1)}</td><td>${F.n(f.capacidad, 0)}</td><td>${F.n(f.hechas, 1)}</td>` : '') +
        `<td>${F.n(f.nuevos, 1)}</td>` + (S.base ? `<td>${F.usd(f.baseDecae, 0)}</td>` : '') + `<td>${F.usd(f.contribNuevos, 0)}</td><td>${F.usd(f.entradas, 0)}</td><td>${F.usd(f.salidas, 0)}</td><td><b>${F.usd(f.caja, 0)}</b></td><td>${F.n(f.activos, 1)}</td><td>${f.bajoPiso ? '⚠ bajo el piso' : f.sinCapacidad ? 'sin capacidad' : ''}</td></tr>`;
    });
    h += '</tbody></table>';
    let cb = (perfil.cambios || []).map((c) => `<label class="cambio">${c.nombre}: <select data-cambio="${c.id}"><option value="0">no</option>${Array.from({ length: M }, (_, i) => `<option value="${i + 1}" ${pl.cambios[c.id] === i + 1 ? 'selected' : ''}>desde el mes ${i + 1}</option>`).join('')}</select></label>`).join('');
    $('#sim_edit').innerHTML = `<div class="fila-ctl">${cb}<button class="chip" id="copiar">Copiar un plan al editable…</button><select id="plan_src">${(perfil.planes || []).map((p, i) => `<option value="${i}">${p.nombre}</option>`).join('')}</select></div>` +
      `<p class="nota">${sel.r.cumple ? 'El plan editable cumple todas las reglas.' : '⚠ ' + sel.r.fallas.join('; ')}</p><div class="scroll">${h}</div>`;
    $('#sim_edit').querySelectorAll('input.celda').forEach((inp) => inp.addEventListener('change', (e) => {
      const c = e.target.dataset.c, m = +e.target.dataset.m, v = parseFloat(e.target.value) || 0;
      if (c === '__contr') pl.contratados[m] = Math.max(0, Math.round(v)); else pl.inversiones[c][m] = v;
      renderSim();
    }));
    $('#sim_edit').querySelectorAll('select[data-cambio]').forEach((s) => s.addEventListener('change', (e) => { const v = +e.target.value; if (v) pl.cambios[e.target.dataset.cambio] = v; else delete pl.cambios[e.target.dataset.cambio]; renderSim(); }));
    $('#copiar').onclick = () => { const d = perfil.planes[+$('#plan_src').value]; editable = UE.plan(perfil, d, base); editable.nombre = 'Plan editable'; renderSim(); };
    $('#mes1').innerHTML = mes1(r);
  }
  function mes1(r) {
    const f = r.filas[0], A = f.adq, S = perfil.simulacion, p0 = UE.valores(perfil, base);
    const caja0 = UE.ev(S.cajaInicial, p0);
    const li = [];
    for (const c of A.canales) li.push(`${c.nombre}: inversión ${F.usd(c.inv, 0)} → ${F.n(c.tope, 2)} ${(c.def.unidadTope || '').toLowerCase()}` + (c.etapas.length > 1 ? ' → ' + c.etapas.slice(1).filter((e) => !e.capacidad).map((e) => `${e.nombre.toLowerCase()} ${F.n(e.n, 2)}`).join(' → ') : ''));
    if (A.organicos) li.push(`Clientes que no vienen de anuncios: ${F.n(A.organicos, 0)} → clientes nuevos del mes = ${F.n(A.pagados, 2)} + ${F.n(A.organicos, 0)} = ${F.n(f.nuevos, 2)}`);
    for (const e of A.escalones) li.push(`${e.nombre}: ${e.cantidad} × costo = ${F.usd(e.costo, 0)}`);
    if (S.base) li.push(`Contribución de los clientes actuales: ${F.usd(f.baseDecae, 2)}`);
    li.push(`Entradas (cobros o contribución del mes): ${F.usd(f.entradas, 2)}`);
    const sal = [`anuncios ${F.usd(A.ads, 0)}`]; if (A.fee) sal.push(`fee ${F.usd(A.fee, 0)}`); for (const e of A.escalones) if (e.costo) sal.push(`${e.nombre.toLowerCase()} ${F.usd(e.costo, 0)}`);
    if (A.comision) sal.push(`comisiones ${F.usd(A.comision, 2)}`); if (A.visitas) sal.push(`visitas ${F.usd(A.visitas, 2)}`); if (f.pagos) sal.push(`pagos de las ventas ${F.usd(f.pagos, 2)}`); sal.push(`fijos ${F.usd(f.fijos, 0)}`); if (f.costoContr) sal.push(`contratados ${F.usd(f.costoContr, 0)}`);
    li.push(`Salidas: ${sal.join(' + ')} = ${F.usd(f.salidas, 2)}`);
    li.push(`<b>Caja final del mes 1: ${F.usd(caja0, 0)} + ${F.usd(f.entradas, 2)} − ${F.usd(f.salidas, 2)} = ${F.usd(f.caja, 2)}</b>`);
    return '<ol>' + li.map((x) => `<li>${x}</li>`).join('') + '</ol>';
  }
  function buscarPlan() {
    if (!perfil.busqueda) { $('#busq').textContent = 'Este perfil no define un espacio de búsqueda.'; return; }
    $('#busq').textContent = 'Buscando…';
    setTimeout(() => {
      const t = Date.now(), b = UE.buscar(perfil, perfil.busqueda, base); busqueda = b;
      $('#busq').innerHTML = `Evaluó <b>${b.evaluados}</b> planes con el mismo modelo y las mismas reglas en ${((Date.now() - t) / 1000).toFixed(1)} s. Mejor encontrado: <b>${b.mejor.texto}</b> → caja mínima ${F.usd(b.mejor.cajaMin, 0)} (mes ${b.mejor.mesCajaMin}), caja final ${F.usd(b.mejor.cajaFinal, 0)}, ${b.mejor.cumple ? 'cumple las reglas' : 'no cumple'}. <button class="chip" id="usar">Cargar en el plan editable</button>`;
      $('#usar').onclick = () => { editable = clon(b.mejor.plan); editable.nombre = 'Plan editable'; renderSim(); };
    }, 20);
  }

  /* ------------------------------------------------ datos y supuestos */
  function renderDatos() {
    const pv = UE.valores(perfil, base), falta = new Set(UE.faltantes(perfil, pv));
    let h = '<table class="tabla datos"><thead><tr><th>Dato</th><th>Valor</th><th>Unidad</th><th>Origen</th><th>Fuente</th></tr></thead><tbody>';
    let grupo = null;
    for (const d of perfil.parametros) {
      if (d.grupo !== grupo) { grupo = d.grupo; h += `<tr class="g"><td colspan="5">${grupo || ''}</td></tr>`; }
      const v = pv[d.id], txt = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : v;
      h += `<tr class="${falta.has(d.id) ? 'falta' : ''}"><td>${d.etiqueta}</td><td><input class="dato" data-id="${d.id}" value='${String(txt).replace(/'/g, '&#39;')}' placeholder="falta"></td><td>${d.unidad || ''}</td><td><span class="orig ${(d.origen || '').replace(' ', '-')}">${d.origen || ''}</span></td><td>${d.fuente || ''}</td></tr>`;
    }
    h += '</tbody></table>';
    $('#datos').innerHTML = (falta.size ? `<p class="aviso">Faltan datos: ${[...falta].map((id) => def(id).etiqueta).join(', ')}.</p>` : '') +
      (perfil.trampa ? `<p><b>Trampa del caso:</b> ${perfil.trampa}</p>` : '') + h +
      `<p class="nota">Los valores <b>dato</b> vienen del caso; <b>supuesto</b> es un supuesto permitido por el caso; <b>supuesto propio</b> lo agregamos nosotros y está justificado en la fuente. Todo lo demás de la calculadora es <b>calculado</b>. Las listas e historiales se escriben como JSON, por ejemplo [[4000,100],[8000,165]].</p>`;
    $('#datos').querySelectorAll('input.dato').forEach((inp) => inp.addEventListener('change', (e) => {
      const d = def(e.target.dataset.id), t = e.target.value.trim();
      let v; if (t === '') v = null; else if (d.unidad === 'texto') v = t; else { try { v = JSON.parse(t.replace(',', '.')); } catch (_) { v = parseFloat(t.replace(',', '.')); } }
      if (typeof v === 'number' && !isFinite(v)) v = null;
      base[d.id] = v; renderControles(); actualizar(); renderDatos();
    }));
  }

  /* ------------------------------------------------ perfil (universal) */
  function renderPerfil() {
    if (!UNIVERSAL) return;
    const pl = window.PLANTILLAS || {};
    $('#perfil').innerHTML = `<p>Elegí una plantilla o un caso para empezar, cambiá los datos en «Datos y supuestos» o editá el perfil completo en JSON. El motor no se toca: cada empresa nueva es un perfil.</p>
      <div class="fila-ctl"><select id="plant">${Object.keys(pl).map((k) => `<option value="${k}" ${pl[k].id === perfil.id ? 'selected' : ''}>${pl[k].nombre}</option>`).join('')}</select><button class="boton" id="usarPl">Usar esta plantilla</button>
      <button class="chip" id="bajar">Descargar el perfil (JSON)</button><label class="chip">Abrir un perfil… <input type="file" id="subir" accept=".json" hidden></label></div>
      <textarea id="json" spellcheck="false"></textarea><div class="fila-ctl"><button class="boton" id="aplicar">Aplicar el JSON</button><span id="jsonmsg" class="nota"></span></div>`;
    $('#json').value = JSON.stringify(perfil, null, 2);
    $('#usarPl').onclick = () => cargar(pl[$('#plant').value]);
    $('#aplicar').onclick = () => { try { cargar(JSON.parse($('#json').value)); $('#jsonmsg').textContent = 'Perfil aplicado.'; } catch (e) { $('#jsonmsg').textContent = 'Error: ' + e.message; } };
    $('#bajar').onclick = () => { const p = clon(perfil); for (const d of p.parametros) if (d.id in base) d.valor = base[d.id]; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' })); a.download = (p.id || 'perfil') + '.json'; a.click(); };
    $('#subir').onchange = (e) => { const f = e.target.files[0]; if (!f) return; f.text().then((t) => { try { cargar(JSON.parse(t)); } catch (err) { $('#jsonmsg').textContent = 'Error: ' + err.message; } }); };
  }
  function cargar(p) {
    UE.calcularTodo(p); // valida el perfil antes de aceptarlo
    ORIGINAL = clon(p); perfil = clon(p); base = {}; editable = null; iniciar();
  }

  /* ------------------------------------------------ ciclo */
  function actualizar() {
    let r, T;
    try { r = UE.escenario(perfil, base); T = UE.calcularTodo(perfil, base); }
    catch (e) { $('#kpis').innerHTML = `<div class="aviso">El perfil tiene un error: ${e.message}</div>`; return; }
    $('#kpis').innerHTML = kpis(r);
    $('#avisos').innerHTML = r.ok && r.avisos.length ? r.avisos.map((a) => `<p class="aviso">${a}</p>`).join('') : '';
    const tt = textoTrampa(r); $('#trampa').innerHTML = tt; $('#trampa').style.display = tt ? '' : 'none';
    const escs = T.escenarios.map((e) => ({ ...e }));
    $('#tabla').innerHTML = tabla(escs);
    $('#reco').innerHTML = recomendacion(T);
    graficos(r, escs);
    if ($('#t_sim').classList.contains('activa')) renderSim();
  }
  function iniciar() {
    document.title = perfil.nombre + ' · calculadora de unit economics';
    $('#titulo').textContent = perfil.nombre; $('#sub').textContent = perfil.subtitulo || perfil.modelo || '';
    $('#decision').textContent = perfil.decision ? 'Decisión: ' + perfil.decision : '';
    const esp = perfil.especializaciones || [];
    $('#card_extra').style.display = esp.includes('suscripcion') || esp.includes('leadgen') ? '' : 'none';
    $('#card_cap').style.display = esp.includes('leadgen') ? '' : 'none';
    $('#card_trampa').style.display = esp.length ? '' : 'none';
    $('#extra_tit').textContent = esp.includes('leadgen') ? 'Embudo de cada canal, lado a lado' : 'Embudo: inversión → trials → clientes';
    renderControles(); actualizar(); renderDatos(); renderPerfil();
  }
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('activa', x === b));
    document.querySelectorAll('.panel').forEach((x) => x.classList.toggle('activa', x.id === 'p_' + b.id.slice(2)));
    if (b.id === 't_sim') renderSim();
    if (b.id === 't_datos') renderDatos();
  }));
  $('#reset').onclick = () => { base = {}; editable = null; renderControles(); actualizar(); renderDatos(); };
  $('#buscar').onclick = buscarPlan;
  if (!UNIVERSAL) $('#t_perfil').style.display = 'none';
  iniciar();
  window.APP = { get base() { return base; }, get perfil() { return perfil; }, cargar, actualizar };
})();
