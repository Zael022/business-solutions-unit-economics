/* Motor de unit economics compartido (navegador y Node).
 * Un perfil JSON describe el negocio; este archivo no cambia de un caso a otro.
 * Convenciones: cifras mensuales; edad 1 = mes en que llega el cliente; curva[0] = −CAC. */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.UE = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const EPS = 1e-9;
  const esNum = (x) => typeof x === 'number' && isFinite(x);
  const div = (a, b) => (!esNum(a) || !esNum(b) || Math.abs(b) < EPS ? null : a / b);
  const suma = (v) => v.reduce((s, x) => s + x, 0);
  const clon = (o) => JSON.parse(JSON.stringify(o));

  class FaltaDato extends Error { constructor(id) { super('Falta el dato «' + id + '»'); this.id = id; } }

  /* ---------------------------------------------------------- parámetros */
  function valores(perfil, cambios) {
    const p = {};
    for (const d of perfil.parametros) p[d.id] = clon(d.valor);
    if (cambios) for (const k of Object.keys(cambios)) p[k] = clon(cambios[k]);
    return p;
  }
  // Evalúa un número, "$parametro" o una expresión aritmética con $parametros, min() y max().
  function ev(x, p) {
    if (x === null || x === undefined) return 0;
    if (typeof x === 'number' || typeof x === 'boolean') return x;
    if (Array.isArray(x)) return x.map((v) => ev(v, p));
    if (typeof x !== 'string') return x;
    const ref = /^\$([A-Za-z_][\w]*)$/.exec(x.trim());
    if (ref) {
      if (!(ref[1] in p)) throw new Error('Parámetro inexistente: ' + x);
      const v = p[ref[1]];
      if (v === null || v === undefined || (typeof v === 'number' && !isFinite(v))) throw new FaltaDato(ref[1]);
      return v;
    }
    const sinRefs = x.replace(/\$([A-Za-z_][\w]*)/g, '0');
    if (!/^[\d\s+\-*/().,<>=?:!&|]*$/.test(sinRefs.replace(/\b(min|max)\(/g, '('))) throw new Error('Expresión no permitida: ' + x);
    const js = x.replace(/\$([A-Za-z_][\w]*)/g, (_, n) => {
      if (!(n in p)) throw new Error('Parámetro inexistente: $' + n);
      const v = p[n];
      if (v === null || v === undefined || (typeof v === 'number' && !isFinite(v))) throw new FaltaDato(n);
      return '(' + JSON.stringify(v) + ')';
    });
    const r = Function('min', 'max', '"use strict";return (' + js + ');')(Math.min, Math.max);
    if (typeof r === 'number' && !isFinite(r)) throw new Error('La expresión no da un número válido: ' + x);
    return r;
  }
  function faltantes(perfil, p) {
    const usados = new Set(JSON.stringify(perfil).match(/\$[A-Za-z_]\w*/g) || []);
    return perfil.parametros.filter((d) => usados.has('$' + d.id) && (p[d.id] === null || p[d.id] === undefined || p[d.id] === '')).map((d) => d.id);
  }

  /* ---------------------------------------------------------- curva de respuesta (historial) */
  function puntos(hist) {
    const pts = hist.map(([x, y]) => [Number(x), Number(y)]).filter(([x, y]) => esNum(x) && esNum(y)).sort((a, b) => a[0] - b[0]);
    if (!pts.length || pts[0][0] > 0) pts.unshift([0, 0]); // con $0 llegan 0 (recta desde cero)
    return pts;
  }
  function interp(x, hist) {
    const pts = puntos(hist);
    if (!esNum(x) || x <= 0) return { v: 0, fuera: x < 0 };
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      if (x <= x1 + EPS) return { v: x1 === x0 ? y1 : y0 + ((x - x0) * (y1 - y0)) / (x1 - x0), fuera: false };
    }
    return { v: pts[pts.length - 1][1], fuera: true }; // sin extrapolar: se queda en el último dato
  }
  function tramos(hist) {
    const pts = puntos(hist), out = [];
    for (let i = 1; i < pts.length; i++) out.push({ de: pts[i - 1][0], a: pts[i][0], extra: pts[i][1] - pts[i - 1][1], cac: div(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) });
    return out;
  }

  /* ---------------------------------------------------------- unidad: lo que deja un cliente mes a mes */
  function pedido(o, p, conDescuento) {
    const precio = ev(o.precio, p), desc = conDescuento ? ev(o.descuentoPrimer || 0, p) : 0;
    const paga = precio * (1 - desc);
    const costo = ev(o.unidades || 1, p) * ev(o.costoUnidad || 0, p) + ev(o.costosPorPedido || 0, p) + ev(o.comisionPct || 0, p) * paga;
    return { paga, contrib: paga - costo, margen: div(paga - costo, paga), roasBE: paga - costo > EPS ? div(paga, paga - costo) : null }; // con margen ≤ 0 no hay ROAS que alcance
  }
  function segmento(s, p, H) {
    const z = () => new Array(H + 1).fill(0);
    const contrib = z(), cobros = z(), pagos = z(), activos = z(), info = { id: s.id, nombre: s.nombre, tipo: s.tipo };
    if (s.tipo === 'pedidos') {
      const tipos = s.pedidos.map((o) => ({ nombre: o.nombre, peso: ev(o.peso === undefined ? 1 : o.peso, p), n: pedido(o, p, false), d: pedido(o, p, true) }));
      const prom = suma(tipos.map((t) => t.peso * t.n.contrib)), primero = suma(tipos.map((t) => t.peso * t.d.contrib));
      let frec = ev(s.frecuencia, p).slice(); const despues = ev(s.frecuenciaDespues || 0, p);
      if (s.pedidosEn12 !== undefined) { // escala las recompras (meses 2 a 12) para que el total de 12 meses sea el pedido
        const meta = ev(s.pedidosEn12, p), resto = suma(frec.slice(1, 12));
        const k = resto > EPS ? Math.max(0, meta - frec[0]) / resto : 0;
        frec = frec.map((f, i) => (i >= 1 && i < 12 ? f * k : f));
      }
      for (let a = 1; a <= H; a++) {
        const f = a <= frec.length ? frec[a - 1] : despues;
        contrib[a] = a === 1 ? primero + (f - 1) * prom : f * prom;
      }
      Object.assign(info, { tiposPedido: tipos, contribPedido: prom, contribPrimerPedido: primero, pedidos12: suma(frec.slice(0, 12)) });
    } else if (s.tipo === 'suscripcion') {
      const c = ev(s.contribMes, p), ch = ev(s.churn, p);
      for (let a = 1; a <= H; a++) { activos[a] = Math.pow(1 - ch, a - 1); contrib[a] = c * activos[a]; }
      Object.assign(info, { contribMes: c, churn: ch, precio: s.precio !== undefined ? ev(s.precio, p) : null, ltvSinTope: div(c, ch) });
    } else if (s.tipo === 'prepago') {
      const c = ev(s.contribPeriodo, p), m = ev(s.meses || 12, p), r = ev(s.renovacion || 0, p);
      for (let a = 1; a <= H; a++) { const k = Math.floor((a - 1) / m); activos[a] = Math.pow(r, k); if ((a - 1) % m === 0) contrib[a] = c * activos[a]; }
      Object.assign(info, { contribPeriodo: c, meses: m, renovacion: r });
    } else if (s.tipo === 'venta') {
      const cb = ev(s.cobros, p), pg = ev(s.pagos, p);
      for (let a = 1; a <= H; a++) { cobros[a] = cb[a - 1] || 0; pagos[a] = pg[a - 1] || 0; contrib[a] = cobros[a] - pagos[a]; }
      activos[1] = 1; // la venta cuenta como cliente del mes en que se firma
      Object.assign(info, { contribVenta: suma(cb) - suma(pg), precio: s.precio !== undefined ? ev(s.precio, p) : null });
    } else throw new Error('Tipo de segmento desconocido: ' + s.tipo);
    if (s.tipo !== 'venta') for (let a = 1; a <= H; a++) cobros[a] = contrib[a];
    return { info, contrib, cobros, pagos, activos };
  }
  function unidad(perfil, p, H) {
    const segs = perfil.unidad.segmentos.map((s) => ({ peso: ev(s.peso === undefined ? 1 : s.peso, p), ...segmento(s, p, H) }));
    const pesoTotal = suma(segs.map((s) => s.peso));
    const mezcla = (k) => Array.from({ length: H + 1 }, (_, a) => suma(segs.map((s) => s.peso * s[k][a])));
    return { segmentos: segs, pesoTotal, contrib: mezcla('contrib'), cobros: mezcla('cobros'), pagos: mezcla('pagos'), activos: mezcla('activos') };
  }
  const ltvA = (vec, H) => suma(vec.slice(1, H + 1));

  /* ---------------------------------------------------------- adquisición de un mes */
  function adquirir(adq, p, invs, capacidad) {
    const canales = adq.canales.map((c) => {
      const inv = invs && c.id in invs ? invs[c.id] : ev(c.inversion, p);
      const modo = c.modo ? ev(c.modo, p) : 'historial';
      let base, fuera = false;
      if (modo === 'constante') base = div(inv, ev(c.costoUnitario, p)) || 0;
      else { const r = interp(inv, ev(c.historial, p)); base = r.v; fuera = r.fuera; }
      const tope = base * ev(c.factor === undefined ? 1 : c.factor, p);
      const etapas = [{ nombre: c.unidadTope || 'Contactos', n: tope }];
      let n = tope, pedidas = null, iCap = -1;
      (c.etapas || []).forEach((e, i) => {
        if (e.capacidad) { pedidas = n; iCap = i; etapas.push({ nombre: e.nombre, n, capacidad: true }); return; }
        n *= ev(e.tasa, p); etapas.push({ nombre: e.nombre, n, tasa: ev(e.tasa, p) });
      });
      return { id: c.id, nombre: c.nombre, inv, modo, fuera, tope, etapas, pedidas, iCap, clientes: n, def: c };
    });
    let pedidasTot = 0, hechasTot = 0;
    if (adq.capacidad) {
      let libre = capacidad === undefined || capacidad === null ? ev(adq.capacidad.base, p) : capacidad;
      const capTot = libre;
      const orden = (adq.capacidad.prioridad || canales.map((c) => c.id)).map((id) => canales.find((c) => c.id === id)).filter(Boolean);
      for (const c of orden) {
        if (c.pedidas === null) continue;
        const hechas = Math.max(0, Math.min(c.pedidas, libre)); libre -= hechas; pedidasTot += c.pedidas; hechasTot += hechas;
        c.hechas = hechas; let n = hechas;
        c.def.etapas.slice(c.iCap + 1).forEach((e) => { n *= ev(e.tasa, p); });
        c.etapas = c.etapas.slice(0, c.iCap + 2);
        c.etapas[c.iCap + 1] = { nombre: c.etapas[c.iCap + 1].nombre, n: c.pedidas, capacidad: true };
        c.etapas.push({ nombre: 'Hechas (dentro de la capacidad)', n: hechas });
        let m = hechas; c.def.etapas.slice(c.iCap + 1).forEach((e) => { m *= ev(e.tasa, p); c.etapas.push({ nombre: e.nombre, n: m, tasa: ev(e.tasa, p) }); });
        c.clientes = n;
      }
      var cap = { capacidad: capTot, pedidas: pedidasTot, hechas: hechasTot, uso: div(pedidasTot, capTot), perdidas: Math.max(0, pedidasTot - hechasTot) };
    }
    const ads = suma(canales.map((c) => c.inv));
    const pagados = suma(canales.map((c) => c.clientes));
    const fee = adq.fee ? (ads > EPS || !ev(adq.fee.siHayInversion === undefined ? true : adq.fee.siHayInversion, p) ? ev(adq.fee.monto, p) : 0) : 0;
    const escalones = (adq.escalones || []).map((e) => {
      const u = suma(canales.map((c) => c.tope));
      const cant = u > EPS ? Math.ceil(u / ev(e.cada, p) - EPS) : 0;
      return { nombre: e.nombre, cantidad: cant, costo: cant * ev(e.costo, p) };
    });
    const comision = ev(adq.costoPorCliente || 0, p) * pagados;
    const costoUnidadCap = adq.capacidad ? ev(adq.capacidad.costoUnidad || 0, p) : 0;
    const visitas = costoUnidadCap * hechasTot;
    const organicos = ev(adq.organicos || 0, p);
    const total = ads + fee + suma(escalones.map((e) => e.costo)) + comision + visitas;
    canales.forEach((c) => {
      const costo = c.inv + costoUnidadCap * (c.hechas || 0) + ev(adq.costoPorCliente || 0, p) * c.clientes;
      Object.assign(c, { costoUnitario: div(c.inv, c.tope), cacAnuncios: div(c.inv, c.clientes), cacReal: div(costo, c.clientes) });
    });
    return { canales, ads, fee, escalones, comision, visitas, organicos, pagados, total, cap: cap || null, fuera: canales.some((c) => c.fuera),
      cacAnuncios: div(ads, pagados), cacReal: div(total, pagados), cacBlended: div(total, pagados + organicos), costoUnitario: div(ads, suma(canales.map((c) => c.tope))) };
  }

  /* ---------------------------------------------------------- nivel 1: un escenario */
  const semaforo = (r) => (r === null ? null : r < 1 ? 'rojo' : r < 3 ? 'amarillo' : 'verde');
  function curvaCaja(cac, vec, H) {
    const c = [cac === null ? null : -cac];
    for (let a = 1; a <= H; a++) c.push(c[a - 1] === null ? null : c[a - 1] + vec[a]);
    return c;
  }
  const payback = (curva) => { if (curva[0] === null) return null; const i = curva.findIndex((v, k) => k > 0 && v >= -EPS); return i < 0 ? null : i; };

  function escenario(perfil, cambios, opciones) {
    const p = valores(perfil, cambios);
    const falta = faltantes(perfil, p);
    if (falta.length) return { ok: false, faltan: falta, p };
    try {
      const H = ev(perfil.unidad.horizonte || 12, p);
      const U = unidad(perfil, p, Math.max(H, 24));
      const A = adquirir(perfil.adquisicion, p, opciones && opciones.inversiones);
      const ltv = ltvA(U.contrib, H);
      const curva = curvaCaja(A.cacReal, U.cobros.map((x, i) => x - U.pagos[i]), H);
      const r = { ok: true, p, H, U, A, ltv, curva, payback: payback(curva),
        ltvCac: div(ltv, A.cacReal), ltvCacBlended: div(ltv, A.cacBlended), semaforo: semaforo(div(ltv, A.cacReal)),
        primerMesPagaCac: A.cacReal === null ? null : U.cobros[1] - U.pagos[1] >= A.cacReal, avisos: [] };
      if (A.fuera) r.avisos.push('La inversión pasa el último dato del historial: no se extrapola, se usa el último punto.');
      if (Math.abs(U.pesoTotal - 1) > 1e-6) r.avisos.push('Los pesos de la mezcla de clientes suman ' + U.pesoTotal.toFixed(3) + ' y no 1.');
      if (A.pagados <= EPS) r.avisos.push('Con esta inversión no llegan clientes pagados: CAC, LTV:CAC y payback no se pueden calcular.');
      // CAC marginal frente a la inversión de referencia (por canal con historial)
      const ref = perfil.adquisicion.referencia ? valores(perfil, perfil.adquisicion.referencia) : null;
      if (ref) {
        const B = adquirir(perfil.adquisicion, ref);
        r.marginal = { costoExtra: A.total - B.total, clientesExtra: A.pagados - B.pagados, cac: div(A.total - B.total, A.pagados - B.pagados),
          invExtra: A.ads - B.ads, cacAnuncios: div(A.ads - B.ads, A.pagados - B.pagados) };
        if (Math.abs(r.marginal.invExtra) < EPS) { r.marginal.cac = null; r.marginal.cacAnuncios = null; } // sin cambio de inversión no hay CAC marginal
        r.marginal.dejaPlata = r.marginal.clientesExtra > EPS && r.marginal.cac !== null ? ltv > r.marginal.cac : null;
      }
      for (const esp of perfil.especializaciones || []) if (ESPECIALIZACIONES[esp]) r[esp] = ESPECIALIZACIONES[esp](perfil, p, r);
      return r;
    } catch (e) {
      if (e instanceof FaltaDato) return { ok: false, faltan: [e.id], p };
      throw e;
    }
  }

  /* ---------------------------------------------------------- especializaciones (solo lo propio de cada modelo) */
  const ESPECIALIZACIONES = {
    ecommerce(perfil, p, r) {
      const e = perfil.ecommerce || {}, seg = r.U.segmentos.find((s) => s.info.tipo === 'pedidos');
      const sub = r.U.segmentos.find((s) => s.info.tipo === 'suscripcion');
      const valor1 = e.valorPrimerPedido !== undefined ? ev(e.valorPrimerPedido, p) : null;
      const roasReal = valor1 === null ? null : div(r.A.pagados * valor1, r.A.ads);
      const t0 = seg ? seg.info.tiposPedido[0] : null;
      const out = {
        tiposPedido: seg ? seg.info.tiposPedido.map((t) => ({ nombre: t.nombre, peso: t.peso, paga: t.n.paga, contrib: t.n.contrib, margen: t.n.margen, roasBE: t.n.roasBE, pagaPrimero: t.d.paga, contribPrimero: t.d.contrib, roasBEPrimero: t.d.roasBE })) : [],
        contribPedido: seg ? seg.info.contribPedido : null, contribPrimerPedido: seg ? seg.info.contribPrimerPedido : null,
        suscripcion: sub && sub.info.precio ? { precio: sub.info.precio, contrib: sub.info.contribMes, margen: div(sub.info.contribMes, sub.info.precio), roasBE: sub.info.contribMes > EPS ? div(sub.info.precio, sub.info.contribMes) : null } : null,
        ltvPorSegmento: r.U.segmentos.map((s) => ({ nombre: s.info.nombre, peso: s.peso, ltv: ltvA(s.contrib, r.H) })),
        roasRealPrimerPedido: roasReal, roasBE: t0 ? t0.n.roasBE : null, roasBEPrimerPedido: t0 ? t0.d.roasBE : null,
      };
      if (e.roasAtribuido !== undefined) {
        const vt = ev(e.ventasTienda, p), va = ev(e.ventasAtribuidas, p);
        out.trampa = { roasAtribuido: ev(e.roasAtribuido, p), roasReal, roasBE: out.roasBEPrimerPedido,
          parteAtribuida: div(va, vt), parteRetargeting: div(ev(e.invRetargeting, p), ev(e.invReporte, p)) };
      }
      return out;
    },
    suscripcion(perfil, p, r) {
      const e = perfil.suscripcion || {};
      const mens = r.U.segmentos.find((s) => s.info.tipo === 'suscripcion'), pre = r.U.segmentos.find((s) => s.info.tipo === 'prepago');
      const out = {
        contribMes: mens ? mens.info.contribMes : null, ltvSinTope: mens ? mens.info.ltvSinTope : null,
        ltvMensual: mens ? ltvA(mens.contrib, r.H) : null, ltvPrepago: pre ? ltvA(pre.contrib, r.H) : null,
        contribPrepago: pre ? pre.info.contribPeriodo : null, pesoPrepago: pre ? pre.peso : 0,
        costoPorRegistro: r.A.costoUnitario, vecesCostoRegistro: div(r.A.cacReal, r.A.costoUnitario),
        vendedoras: r.A.escalones.length ? r.A.escalones[0].cantidad : null,
        ltvCacPaid: r.ltvCac, ltvCacBlended: r.ltvCacBlended, laminaLtvCac: e.ltvCacReportado !== undefined ? ev(e.ltvCacReportado, p) : null,
      };
      // curvas por tipo de cliente con el mismo CAC
      if (mens) out.curvaMensual = curvaCaja(r.A.cacReal, mens.cobros, r.H);
      if (pre) out.curvaPrepago = curvaCaja(r.A.cacReal, pre.cobros, r.H);
      out.paybackMensual = out.curvaMensual ? payback(out.curvaMensual) : null;
      out.paybackPrepago = out.curvaPrepago ? payback(out.curvaPrepago) : null;
      if (r.marginal) {
        const primerMes = r.U.cobros[1];
        out.cajaAtrapadaMes = r.marginal.costoExtra - r.marginal.clientesExtra * primerMes;
      }
      return out;
    },
    leadgen(perfil, p, r) {
      const seg = r.U.segmentos.find((s) => s.info.tipo === 'venta');
      const contrib = seg ? seg.info.contribVenta : ltvA(r.U.contrib, r.H);
      const cu = perfil.adquisicion.capacidad ? ev(perfil.adquisicion.capacidad.costoUnidad || 0, p) : 0;
      const canales = r.A.canales.map((c) => {
        const cierre = c.def.etapas.slice(c.iCap + 1).reduce((x, e) => x * ev(e.tasa, p), 1);
        return { id: c.id, nombre: c.nombre, inv: c.inv, leads: c.tope, etapas: c.etapas, pedidas: c.pedidas, hechas: c.hechas, clientes: c.clientes,
          cpl: c.costoUnitario, cacAnuncios: c.cacAnuncios, cacReal: c.cacReal, ltvCac: div(contrib, c.cacReal), semaforo: semaforo(div(contrib, c.cacReal)),
          visitasPorVenta: div(1, cierre), valorVisita: cierre * contrib - cu };
      });
      const out = { contribVenta: contrib, canales, cap: r.A.cap, ventas: r.A.pagados };
      const tr = (perfil.leadgen || {}).trampa;
      if (tr) {
        const a = canales.find((c) => c.id === tr.barato), b = canales.find((c) => c.id === tr.caro);
        if (a && b) out.trampa = { cplVeces: div(b.cpl, a.cpl), cacMasCaro: a.cacReal !== null && b.cacReal !== null ? a.cacReal / b.cacReal - 1 : null, barato: a.nombre, caro: b.nombre };
      }
      const extra = (perfil.leadgen || {}).costoMesExtra;
      out.resultadoMes = contrib * r.A.pagados - r.A.total - (extra ? ev(extra, p) : 0);
      return out;
    },
  };

  /* ---------------------------------------------------------- nivel 3: simulador mensual por cohortes */
  function plan(perfil, desc, base) {
    const S = perfil.simulacion, M = S.meses || 24, pb = () => valores(perfil, base), out = { nombre: desc.nombre, descripcion: desc.descripcion || '', inversiones: {}, contratados: new Array(M).fill(0), cambios: desc.cambios || {} };
    for (const c of perfil.adquisicion.canales) {
      const d = (desc.inversiones || {})[c.id];
      out.inversiones[c.id] = Array.isArray(d) ? d.slice(0, M) : typeof d === 'number' ? new Array(M).fill(d) : typeof d === 'string' ? new Array(M).fill(ev(d, pb())) : d && d.tramos ? expandir(d.tramos, M) : new Array(M).fill(0);
    }
    if (desc.contrataciones) { // meses en que se contrata (1 técnico por mes listado)
      for (const m of desc.contrataciones) for (let t = m; t <= M; t++) out.contratados[t - 1]++;
    }
    return out;
  }
  function expandir(tramos, M) { // [[desdeMes, valor], ...]
    const v = new Array(M).fill(0);
    for (let t = 1; t <= M; t++) for (const [d, x] of tramos) if (t >= d) v[t - 1] = x;
    return v;
  }
  function simular(perfil, pl, base) {
    const S = perfil.simulacion, M = S.meses || 24, H = M + 2;
    const p0 = valores(perfil, base);
    const cache = new Map();
    const activos = (t) => Object.keys(pl.cambios).filter((k) => pl.cambios[k] && t >= pl.cambios[k]).sort();
    const paramsMes = (t) => {
      const ids = activos(t); const key = ids.join('|');
      if (!cache.has(key)) {
        const ch = Object.assign({}, base || {});
        for (const id of ids) Object.assign(ch, (perfil.cambios.find((c) => c.id === id) || { valores: {} }).valores);
        const p = valores(perfil, ch); cache.set(key, { p, U: unidad(perfil, p, H) });
      }
      return cache.get(key);
    };
    const cohortes = (S.cohortesIniciales || []).map((c) => ({ mes: 0, n: ev(c.n, p0), U: unidad(perfil, valores(perfil, Object.assign({}, base || {}, c.cambios || {})), H) }));
    let caja = ev(S.cajaInicial, p0); const piso = ev(S.piso, p0), fijos = ev(S.costosFijos || 0, p0);
    const filas = [];
    for (let t = 1; t <= M; t++) {
      const { p, U } = paramsMes(t);
      const contr = pl.contratados[t - 1], contrPrev = t > 1 ? pl.contratados[t - 2] : 0;
      const cap = perfil.adquisicion.capacidad ? ev(perfil.adquisicion.capacidad.base, p) + ev(S.capacidadPorContratacion || 0, p) * contrPrev : null;
      const invs = {}; for (const c of perfil.adquisicion.canales) invs[c.id] = pl.inversiones[c.id][t - 1];
      const A = adquirir(perfil.adquisicion, p, invs, cap);
      const nuevos = A.pagados + A.organicos;
      cohortes.push({ mes: t, n: nuevos, U });
      let cobros = 0, pagos = 0, act = 0, contribNuevos = 0;
      for (const c of cohortes) { const a = t - c.mes + 1; if (a < 1 || a > H) continue; cobros += c.n * c.U.cobros[a]; pagos += c.n * c.U.pagos[a]; act += c.n * c.U.activos[a]; if (c.mes > 0) contribNuevos += c.n * (c.U.cobros[a] - c.U.pagos[a]); }
      const baseDecae = S.base ? ev(S.base.monto, p) * Math.pow(1 - ev(S.base.caida, p), t - 1) : 0;
      const costoContr = ev(S.costoContratacion || 0, p) * contr;
      const entradas = cobros + baseDecae, salidas = pagos + A.total + fijos + costoContr;
      caja += entradas - salidas;
      filas.push({ mes: t, inversiones: invs, inversion: A.ads, tope: suma(A.canales.map((c) => c.tope)), escalones: A.escalones.map((e) => e.cantidad),
        clientesPagados: A.pagados, nuevos, pedidas: A.cap ? A.cap.pedidas : null, capacidad: cap, hechas: A.cap ? A.cap.hechas : null,
        contratados: contr, baseDecae, contribNuevos, cobros, pagos, adquisicion: A.total, fijos, costoContr, entradas, salidas, caja, activos: act,
        adq: A, bajoPiso: caja < piso - EPS, sinCapacidad: A.cap ? A.cap.pedidas > A.cap.capacidad + EPS : false, cambios: activos(t) });
    }
    return resumen(perfil, pl, filas, p0, piso);
  }
  function resumen(perfil, pl, filas, p0, piso) {
    const S = perfil.simulacion, M = filas.length;
    const cajas = filas.map((f) => f.caja), min = Math.min(...cajas);
    const fallas = [];
    const bajo = filas.find((f) => f.bajoPiso); if (bajo) fallas.push('La caja baja del piso en el mes ' + bajo.mes);
    for (const c of perfil.adquisicion.canales) {
      const r = (S.rangos || {})[c.id]; if (!r) continue;
      const v = pl.inversiones[c.id];
      if (Math.min(...v) < r[0] - EPS || Math.max(...v) > r[1] + EPS) fallas.push(`Inversión en ${c.nombre} fuera del rango $${r[0]}–$${r[1]}`);
    }
    for (const regla of S.reglas || []) {
      const tot = filas.map((f) => f.inversion);
      if (regla.tipo === 'minimoPromedio') {
        const prom = suma(tot.slice(regla.ventana[0] - 1, regla.ventana[1])) / (regla.ventana[1] - regla.ventana[0] + 1);
        if (tot.slice(regla.desde - 1).some((x) => x < prom - 1e-6)) fallas.push(regla.texto);
      } else if (regla.tipo === 'noBaja') {
        for (let t = regla.desde; t <= M; t++) if (tot[t - 1] < tot[t - 2] - 1e-6) { fallas.push(regla.texto); break; }
      } else if (regla.tipo === 'maxContratados') {
        if (Math.max(...pl.contratados) > regla.max) fallas.push(regla.texto);
      }
    }
    const r = { plan: pl, filas, cajaMin: min, mesCajaMin: cajas.indexOf(min) + 1, cajaFinal: cajas[M - 1], activosFinal: filas[M - 1].activos,
      clientesTotal: suma(filas.map((f) => f.clientesPagados)), primerMesBajoPiso: bajo ? bajo.mes : null, cumple: fallas.length === 0, fallas, piso };
    const obj = S.objetivo || { principal: 'cajaFinal', desempate: 'activosFinal' };
    r.puntaje = [r.cumple ? 1 : 0, r[obj.principal], r[obj.desempate]];
    return r;
  }
  const mejor = (a, b) => { for (let i = 0; i < 3; i++) { if (a.puntaje[i] > b.puntaje[i] + 1e-9) return a; if (a.puntaje[i] < b.puntaje[i] - 1e-9) return b; } return a; };

  // Búsqueda en una grilla de planes con el MISMO modelo y reglas. Devuelve el mejor y cuántos evaluó.
  function buscar(perfil, espacio, base) {
    const M = perfil.simulacion.meses || 24;
    const canales = perfil.adquisicion.canales.map((c) => c.id);
    const opcionesCanal = canales.map((id) => {
      const e = espacio.canales[id] || { valores: [0] }, out = [];
      for (const a of e.valores) {
        out.push({ tramos: [[1, a]], txt: `$${a}` });
        for (const k of e.cambioEn || []) for (const b of e.valores) if (b !== a) out.push({ tramos: [[1, a], [k, b]], txt: `$${a} meses 1-${k - 1}, $${b} desde ${k}` });
      }
      return out;
    });
    const contrataciones = espacio.contrataciones || [[]];
    const cambios = espacio.cambios || [{}];
    let best = null, n = 0;
    const rec = (i, acc) => {
      if (i === canales.length) {
        for (const ct of contrataciones) for (const cb of cambios) {
          const desc = { nombre: 'búsqueda', inversiones: {}, contrataciones: ct, cambios: cb };
          canales.forEach((id, j) => { desc.inversiones[id] = { tramos: acc[j].tramos }; });
          const r = simular(perfil, plan(perfil, desc), base); n++;
          r.texto = canales.map((id, j) => id + ': ' + acc[j].txt).join(' · ') + (ct.length ? ' · contrata en meses ' + ct.join(', ') : '') + (Object.keys(cb).length ? ' · cambios ' + JSON.stringify(cb) : '');
          best = best ? mejor(best, r) : r;
        }
        return;
      }
      for (const o of opcionesCanal[i]) rec(i + 1, acc.concat([o]));
    };
    rec(0, []);
    return { mejor: best, evaluados: n, meses: M };
  }

  /* ---------------------------------------------------------- recomendación razonada */
  function recomendar(perfil, res, sims) {
    const hoy = res.find((r) => r.rol === 'hoy'), prop = res.find((r) => r.rol === 'propuesta'), alt = res.find((r) => r.rol === 'alternativa');
    const f = (x, d = 2) => { if (x === null || x === undefined || !isFinite(x)) return 'sin dato'; const [e, g] = Math.abs(x).toFixed(d).split('.'); return (x < 0 ? '−' : '') + e.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (g ? ',' + g : ''); };
    const razones = [], riesgos = [];
    const lc = hoy && hoy.r.ok ? hoy.r.ltvCac : null;
    let negocio = lc === null ? 'faltan datos para decidir' : lc < 1 ? 'pausar o reducir la inversión' : lc < 3 ? 'arreglar antes de escalar' : 'escalar con cuidado';
    if (lc !== null) razones.push(`Hoy cada cliente devuelve ${f(lc)} veces lo que cuesta (LTV ${f(hoy.r.ltv)} / CAC ${f(hoy.r.A.cacReal)}); payback ${hoy.r.payback ?? 'mayor al horizonte'}.`);
    let propuesta = null;
    if (prop && prop.r.ok) {
      const pr = prop.r, m = pr.marginal, contras = [];
      if (lc !== null && pr.ltvCac !== null && pr.ltvCac < lc - 1e-9) contras.push(`baja el LTV:CAC de ${f(lc)} a ${f(pr.ltvCac)}`);
      if (pr.ltvCac !== null && pr.ltvCac < 1) contras.push('cada cliente cuesta más de lo que deja');
      if (m && m.clientesExtra > 0 && m.cac !== null && m.cac > pr.ltv) contras.push(`cada cliente extra cuesta ${f(m.cac)} y deja ${f(pr.ltv)}`);
      if (hoy && hoy.r.ok && pr.A.pagados < hoy.r.A.pagados - 1e-9) contras.push(`trae menos clientes que hoy (${f(pr.A.pagados, 1)} contra ${f(hoy.r.A.pagados, 1)})`);
      const sp = sims && sims.find((s) => s.rol === 'propuesta');
      if (sp && sp.r.primerMesBajoPiso) contras.push(`la caja rompe el piso en el mes ${sp.r.primerMesBajoPiso}`);
      propuesta = contras.length ? 'rechazar' : 'aceptar';
      razones.push(`La propuesta «${prop.nombre}»: ${contras.length ? contras.join('; ') : 'no empeora los números'}.`);
    }
    if (alt && alt.r.ok && lc !== null) razones.push(`La alternativa «${alt.nombre}» lleva el LTV:CAC de ${f(lc)} a ${f(alt.r.ltvCac)} y el payback de ${hoy.r.payback ?? 'más del horizonte'} a ${alt.r.payback ?? 'más del horizonte'} meses.`);
    if (sims && sims.length) {
      const validos = sims.filter((s) => s.r.cumple);
      if (validos.length) { const b = validos.reduce((a, c) => (mejor(a.r, c.r) === a.r ? a : c)); razones.push(`Entre los planes comparados, el mejor que cumple las reglas es «${b.nombre}».`); }
    }
    if (hoy && hoy.r.ok && hoy.r.A.fuera) riesgos.push('La inversión sale del historial: el resultado no se extrapola.');
    for (const s of perfil.riesgos || []) riesgos.push(s);
    const titulo = (propuesta === 'rechazar' ? 'No aceptar la propuesta. ' : propuesta === 'aceptar' ? 'La propuesta no empeora los números. ' : '') + negocio.charAt(0).toUpperCase() + negocio.slice(1) + '.';
    return { decision: negocio, propuesta, titulo, razones, riesgos };
  }

  function calcularTodo(perfil, base) {
    const res = (perfil.escenarios || []).map((e) => ({ id: e.id, nombre: e.nombre, rol: e.rol, r: escenario(perfil, Object.assign({}, base || {}, e.cambios || {})) }));
    let sims = null;
    if (perfil.simulacion && perfil.planes) {
      try { sims = perfil.planes.map((d) => ({ nombre: d.nombre, rol: d.rol, r: simular(perfil, plan(perfil, d, base), base) })); }
      catch (e) { if (e instanceof FaltaDato) sims = null; else throw e; }
    }
    return { escenarios: res, sims, recomendacion: recomendar(perfil, res, sims) };
  }

  /* ---------------------------------------------------------- growth: embudos, ciclos, recompensas y canales (Sesión 2) */
  const growth = {
    // pasos: [{nombre, n}] en orden. Devuelve la tasa de cada paso al siguiente y dónde se pierde más.
    embudo(pasos) {
      const filas = pasos.map((p, i) => ({ nombre: p.nombre, n: p.n, tasa: i ? div(p.n, pasos[i - 1].n) : null, perdidos: i ? pasos[i - 1].n - p.n : 0 }));
      const conTasa = filas.filter((f) => f.tasa !== null);
      const peorTasa = conTasa.reduce((a, b) => (b.tasa < a.tasa ? b : a), conTasa[0]);
      const masPerdidos = conTasa.reduce((a, b) => (b.perdidos > a.perdidos ? b : a), conTasa[0]);
      return { filas, total: div(pasos[pasos.length - 1].n, pasos[0].n), peorTasa, masPerdidos };
    },
    // Coeficiente viral K = clientes nuevos que trae cada cliente.
    k(...factores) { return factores.reduce((x, f) => x * f, 1); },
    // Con N clientes nuevos al mes por otras vías y un ciclo K < 1, los referidos se estabilizan en N·K/(1−K).
    referidosPorMes(base, K) { return K >= 1 ? null : (base * K) / (1 - K); },
    // recompensas: [{nombre, costo, repartidoEntre}] que se pagan por un cliente referido; tope opcional.
    costoRecompensas(recompensas, tope, extra = 0) {
      const filas = recompensas.map((r) => ({ ...r, porReferido: r.costo / (r.repartidoEntre || 1) }));
      const total = suma(filas.map((f) => f.porReferido)) + extra;
      return { filas, extra, total, tope: tope === undefined ? null : tope, cumple: tope === undefined ? null : total <= tope + EPS, margen: tope === undefined ? null : tope - total };
    },
    // Peor combinación: combos = [[nombres...]]; devuelve el costo de cada combinación posible.
    peorCombinacion(recompensas, combos, tope, extra = 0) {
      const res = combos.map((c) => ({ combo: c, costo: extra + suma(c.map((n) => { const r = recompensas.find((x) => x.nombre === n); return r.costo / (r.repartidoEntre || 1); })) }));
      const peor = res.reduce((a, b) => (b.costo > a.costo ? b : a), res[0]);
      return { combinaciones: res, peor, cumple: peor.costo <= tope + EPS };
    },
    // Conversión a pago según hasta dónde llegó cada grupo: grupos = [{n, tasa}] sobre el total.
    conversionPorGrupos(grupos) { const tot = suma(grupos.map((g) => g.n)); return div(suma(grupos.map((g) => g.n * g.tasa)), tot); },
    // Clientes activos mes a mes con altas fijas y una baja mensual (el balde con agujeros).
    balde(altas, baja, meses, inicio = 0) { const v = []; let n = inicio; for (let m = 1; m <= meses; m++) { n = n * (1 - baja) + altas; v.push(n); } return { serie: v, techo: div(altas, baja) }; },
    // Matriz de 90 días: rápido/lento según el payback (meses) frente a un límite; seguro/incierto o mucho/poco según el canal.
    cuadrante(c, limiteMeses = 3) {
      const rapido = c.paybackMeses !== null && c.paybackMeses !== undefined && c.paybackMeses <= limiteMeses;
      return rapido ? (c.seguro ? 'Siempre activo' : 'Probar') : (c.puedeDarMucho ? 'Largo plazo' : 'Descartar por ahora');
    },
  };

  return { ev, valores, faltantes, growth, interp, puntos, tramos, pedido, unidad, adquirir, escenario, semaforo, curvaCaja, payback, plan, expandir, simular, buscar, mejor, recomendar, calcularTodo, div, FaltaDato, ESPECIALIZACIONES };
});
