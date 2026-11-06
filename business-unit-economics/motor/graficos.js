/* Gráficos SVG sin librerías externas: líneas, barras y dispersión, con tooltip y leyenda. */
(function (raiz) {
  'use strict';
  const COL = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)', 'var(--s5)', 'var(--s7)'];
  const W = 640, H = 300, M = { t: 16, r: 18, b: 42, l: 64 };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function escala(min, max) {
    if (min === max) { max = min + 1; }
    const paso0 = (max - min) / 5, pot = Math.pow(10, Math.floor(Math.log10(Math.abs(paso0) || 1)));
    const paso = [1, 2, 2.5, 5, 10].map((k) => k * pot).find((s) => s >= paso0) || paso0;
    const lo = Math.floor(min / paso) * paso, hi = Math.ceil(max / paso) * paso, ticks = [];
    for (let v = lo; v <= hi + paso / 2; v += paso) ticks.push(+v.toFixed(10));
    return { lo, hi, ticks };
  }
  let tip;
  function tooltip(svg) {
    if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; document.body.appendChild(tip); }
    svg.addEventListener('mousemove', (e) => {
      const t = e.target.closest('[data-tip]');
      if (!t) { tip.style.display = 'none'; return; }
      tip.innerHTML = t.getAttribute('data-tip'); tip.style.display = 'block';
      tip.style.left = Math.min(e.pageX + 12, window.scrollX + window.innerWidth - tip.offsetWidth - 8) + 'px'; tip.style.top = e.pageY + 12 + 'px';
    });
    svg.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
  }
  function marco(el, ys, yFmt, refsY) {
    const vals = ys.concat((refsY || []).map((r) => r.y)).filter((v) => v !== null && isFinite(v));
    let mn = Math.min(0, ...vals), mx = Math.max(0, ...vals);
    const e = escala(mn, mx), py = (v) => M.t + (H - M.t - M.b) * (1 - (v - e.lo) / (e.hi - e.lo));
    let s = '';
    for (const t of e.ticks) s += `<line class="grid" x1="${M.l}" x2="${W - M.r}" y1="${py(t)}" y2="${py(t)}"/><text class="eje" x="${M.l - 6}" y="${py(t) + 4}" text-anchor="end">${esc(yFmt(t))}</text>`;
    s += `<line class="base" x1="${M.l}" x2="${W - M.r}" y1="${py(0)}" y2="${py(0)}"/>`;
    return { e, py, s };
  }
  function refs(refsY, py, yFmt) {
    return (refsY || []).map((r) => `<line class="ref ${r.clase || ''}" x1="${M.l}" x2="${W - M.r}" y1="${py(r.y)}" y2="${py(r.y)}"/><text class="reft ${r.clase || ''}" x="${W - M.r - 4}" y="${py(r.y) - 5}" text-anchor="end">${esc(r.texto || yFmt(r.y))}</text>`).join('');
  }
  function leyenda(series) {
    if (series.length < 2) return '';
    return '<div class="leyenda">' + series.map((s, i) => `<span><i style="background:${s.color || COL[i]}"${s.punteada ? ' class="pt"' : ''}></i>${esc(s.nombre)}</span>`).join('') + '</div>';
  }
  function poner(el, svg, series, nota) {
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(el.getAttribute('aria-label') || '')}">${svg}</svg>` + leyenda(series) + (nota ? `<p class="nota">${nota}</p>` : '');
    tooltip(el.querySelector('svg'));
  }

  // series: [{nombre, datos:[y], color, punteada}], x: etiquetas
  function lineas(el, o) {
    const yFmt = o.yFmt || String, xs = o.x, n = xs.length;
    const all = [].concat(...o.series.map((s) => s.datos));
    const { py, s: base } = marco(el, all, yFmt, o.refY);
    const px = (i) => M.l + ((W - M.l - M.r) * i) / Math.max(1, n - 1);
    let s = base, pasoX = Math.ceil(n / 12);
    xs.forEach((x, i) => { if (i % pasoX === 0 || i === n - 1) s += `<text class="eje" x="${px(i)}" y="${H - M.b + 16}" text-anchor="middle">${esc(x)}</text>`; });
    if (o.xTitulo) s += `<text class="eje" x="${(W + M.l) / 2}" y="${H - 6}" text-anchor="middle">${esc(o.xTitulo)}</text>`;
    s += refs(o.refY, py, yFmt);
    for (const r of o.refX || []) { const i = xs.indexOf(r.x); if (i < 0) continue; s += `<line class="ref ${r.clase || ''}" x1="${px(i)}" x2="${px(i)}" y1="${M.t}" y2="${H - M.b}"/><text class="reft ${r.clase || ''}" x="${px(i) + 4}" y="${M.t + 12}">${esc(r.texto)}</text>`; }
    o.series.forEach((se, k) => {
      const c = se.color || COL[k];
      let d = '', abierto = false;
      se.datos.forEach((v, i) => { if (v === null || !isFinite(v)) { abierto = false; return; } d += (abierto ? 'L' : 'M') + px(i).toFixed(1) + ' ' + py(v).toFixed(1); abierto = true; });
      s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="2" ${se.punteada ? 'stroke-dasharray="6 4"' : ''}/>`;
      se.datos.forEach((v, i) => { if (v === null || !isFinite(v)) return; s += `<circle cx="${px(i)}" cy="${py(v)}" r="${n > 30 ? 0 : 3}" fill="${c}"/><circle class="hit" cx="${px(i)}" cy="${py(v)}" r="9" data-tip="<b>${esc(se.nombre)}</b><br>${esc(o.xNombre || '')} ${esc(xs[i])}: ${esc(yFmt(v))}"/>`; });
    });
    poner(el, s, o.series, o.nota);
  }
  // categorias: [..], series: [{nombre, datos:[..], color}] ; colores por barra opcional (o.coloresBarra)
  function barras(el, o) {
    const yFmt = o.yFmt || String, cats = o.categorias, ns = o.series.length;
    const all = [].concat(...o.series.map((s) => s.datos));
    const { py, s: base } = marco(el, all, yFmt, o.refY);
    const anchoG = (W - M.l - M.r) / cats.length, anchoB = Math.min(46, (anchoG * 0.7) / ns);
    let s = base;
    cats.forEach((c, i) => {
      const x0 = M.l + anchoG * i + (anchoG - anchoB * ns - 2 * (ns - 1)) / 2;
      s += `<text class="eje" x="${M.l + anchoG * (i + 0.5)}" y="${H - M.b + 16}" text-anchor="middle">${esc(c)}</text>`;
      o.series.forEach((se, k) => {
        const v = se.datos[i]; if (v === null || v === undefined || !isFinite(v)) return;
        const col = (o.coloresBarra && o.coloresBarra[i]) || se.color || COL[k];
        const y = py(Math.max(v, 0)), h = Math.abs(py(v) - py(0)), x = x0 + k * (anchoB + 2);
        s += `<rect x="${x}" y="${y}" width="${anchoB}" height="${Math.max(h, 0.5)}" rx="3" fill="${col}" data-tip="<b>${esc(c)}</b>${ns > 1 ? ' · ' + esc(se.nombre) : ''}<br>${esc(yFmt(v))}"/>`;
        if (o.etiquetas) s += `<text class="val" x="${x + anchoB / 2}" y="${v >= 0 ? y - 5 : y + h + 13}" text-anchor="middle">${esc(yFmt(v))}</text>`;
      });
    });
    s += refs(o.refY, py, yFmt);
    poner(el, s, ns > 1 ? o.series : [], o.nota);
  }
  // puntos: [{x, y, nombre, color}], rectas por el origen: [{m, texto}]
  function dispersion(el, o) {
    const xFmt = o.xFmt || String, yFmt = o.yFmt || String;
    const xs = o.puntos.map((p) => p.x).filter(isFinite), ys = o.puntos.map((p) => p.y).filter(isFinite);
    const ex = escala(0, Math.max(...xs, 1) * 1.15), ey = escala(0, Math.max(...ys, 1) * 1.1);
    const px = (v) => M.l + (W - M.l - M.r) * (v - ex.lo) / (ex.hi - ex.lo), py = (v) => M.t + (H - M.t - M.b) * (1 - (v - ey.lo) / (ey.hi - ey.lo));
    let s = '';
    for (const t of ey.ticks) s += `<line class="grid" x1="${M.l}" x2="${W - M.r}" y1="${py(t)}" y2="${py(t)}"/><text class="eje" x="${M.l - 6}" y="${py(t) + 4}" text-anchor="end">${esc(yFmt(t))}</text>`;
    for (const t of ex.ticks) s += `<text class="eje" x="${px(t)}" y="${H - M.b + 16}" text-anchor="middle">${esc(xFmt(t))}</text>`;
    s += `<text class="eje" x="${(W + M.l) / 2}" y="${H - 6}" text-anchor="middle">${esc(o.xTitulo || '')}</text><text class="eje" x="14" y="${M.t + 4}">${esc(o.yTitulo || '')}</text>`;
    s += `<defs><clipPath id="c${el.id}"><rect x="${M.l}" y="${M.t}" width="${W - M.l - M.r}" height="${H - M.t - M.b}"/></clipPath></defs>`;
    for (const r of o.rectas || []) {
      const x2 = Math.min(ex.hi, ey.hi / r.m);
      s += `<line class="ref ${r.clase || ''}" clip-path="url(#c${el.id})" x1="${px(0)}" y1="${py(0)}" x2="${px(x2)}" y2="${py(r.m * x2)}"/><text class="reft ${r.clase || ''}" x="${px(x2) - 4}" y="${py(r.m * x2) + 14}" text-anchor="end">${esc(r.texto)}</text>`;
    }
    o.puntos.forEach((p, i) => { if (!isFinite(p.x) || !isFinite(p.y)) return; const c = p.color || COL[i];
      s += `<circle cx="${px(p.x)}" cy="${py(p.y)}" r="7" fill="${c}" stroke="var(--fondo-t)" stroke-width="2" data-tip="<b>${esc(p.nombre)}</b><br>CAC ${esc(xFmt(p.x))} · LTV ${esc(yFmt(p.y))}<br>LTV:CAC ${(p.y / p.x).toFixed(2)}"/>`; });
    poner(el, s, o.puntos.map((p, i) => ({ nombre: p.nombre, color: p.color || COL[i] })), o.nota);
  }
  raiz.G = { lineas, barras, dispersion, COL };
})(typeof self !== 'undefined' ? self : this);
