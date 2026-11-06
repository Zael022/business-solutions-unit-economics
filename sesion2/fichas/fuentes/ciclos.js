/* Dibuja el ciclo de cada caso (SVG) y lo guarda como PNG con Playwright. Uso: node ciclos.js <carpeta_salida> */
const { chromium } = require('playwright');
const path = require('path');
const CICLOS = {
  tueste: { color: '#2f5a47', entrada: 'Meta ($4.000) y otras vías: 147 clientes nuevos al mes', pasos: ['Le llega el café y prueba la primera taza', 'Aviso: «Regálele $8 a un amigo»', 'Invita en un toque por WhatsApp', 'El amigo abre su página con $8 aplicados', 'El amigo compra (meta: 50\u00a0%)'], cierre: 'Cuando le llega su café, el amigo ya puede invitar', k: 'K: 0,06 hoy → 0,22 meta' },
  agendo: { color: '#1d3a6e', entrada: 'Anuncios ($10.000): 500 trials al mes', pasos: ['El barbero arma su página en 3 pasos', 'Comparte su link por WhatsApp', 'Su cliente reserva solo (aha)', 'El cliente ve la insignia «Reservado con Agendo»', 'Otro barbero toca la insignia y prueba gratis'], cierre: 'Cada barbería activa recibe unas 250 visitas al mes de sus clientes', k: 'Hoy: 8 barberías al mes por la insignia' },
  'sol-de-casa': { color: '#0f5c7a', entrada: 'Google y Meta ($4.000 + $4.000): 22 ventas al mes', pasos: ['La familia ve su ahorro del mes ($77)', 'Comparte su tarjeta por WhatsApp', 'El vecino calcula su ahorro', 'Agenda la visita (referido registrado)', 'Firma, instala y empieza a ahorrar'], cierre: 'Al mes siguiente, el vecino recibe su propio ahorro', k: '0,9 → 8,2 ventas referidas al mes' },
};
function svg(c) {
  const W = 820, H = 540, cx = 410, cy = 300, rx = 290, ry = 205, n = c.pasos.length;
  const pos = c.pasos.map((_, i) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const wrap = (t, max) => { const w = t.split(' '), l = []; let s = ''; for (const x of w) { if ((s + ' ' + x).trim().length > max) { l.push(s.trim()); s = x; } else s += ' ' + x; } l.push(s.trim()); return l; };
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial, sans-serif"><rect width="${W}" height="${H}" fill="#ffffff"/>
  <defs><marker id="f" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${c.color}"/></marker>
  <marker id="g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#8a8f98"/></marker></defs>`;
  const alto = (i) => 22 + wrap(c.pasos[i], 20).length * 16;
  const borde = (x, y, dx, dy, hh) => { const k = Math.min(97 / Math.abs(dx || 1e-9), (hh / 2 + 4) / Math.abs(dy || 1e-9)); return [x + dx * k, y + dy * k]; };
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, [x1, y1] = pos[i], [x2, y2] = pos[j], dx = x2 - x1, dy = y2 - y1;
    const p1 = borde(x1, y1, dx, dy, alto(i)), p2 = borde(x2, y2, -dx, -dy, alto(j));
    const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2, ox = (mx - cx) * 0.18, oy = (my - cy) * 0.18;
    s += `<path d="M${p1[0]},${p1[1]} Q${mx + ox},${my + oy} ${p2[0]},${p2[1]}" fill="none" stroke="${c.color}" stroke-width="3" marker-end="url(#f)"/>`;
  }
  pos.forEach(([x, y], i) => {
    const l = wrap(c.pasos[i], 20), h = 22 + l.length * 16;
    s += `<rect x="${x - 95}" y="${y - h / 2}" width="190" height="${h}" rx="12" fill="${i === 0 ? c.color : '#ffffff'}" stroke="${c.color}" stroke-width="2"/>`;
    l.forEach((t, j) => { s += `<text x="${x}" y="${y - h / 2 + 24 + j * 16}" text-anchor="middle" font-size="14" fill="${i === 0 ? '#ffffff' : '#1d1d1f'}">${esc(t)}</text>`; });
  });
  s += `<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="15" font-weight="bold" fill="${c.color}">${esc(c.k)}</text>`;
  wrap(c.cierre, 30).forEach((t, j) => { s += `<text x="${cx}" y="${cy + 16 + j * 16}" text-anchor="middle" font-size="12.5" fill="#555a63">${esc(t)}</text>`; });
  const top = pos[0];
  s += `<rect x="20" y="10" width="290" height="44" rx="8" fill="#f1f2f4" stroke="#8a8f98"/>`;
  wrap(c.entrada, 40).forEach((t, j) => { s += `<text x="165" y="${28 + j * 15}" text-anchor="middle" font-size="12.5" fill="#333">${esc(t)}</text>`; });
  s += `<path d="M310,40 L${top[0] - 97},${top[1] - 10}" fill="none" stroke="#8a8f98" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#g)"/>`;
  return s + '</svg>';
}
(async () => {
  const out = process.argv[2]; const b = await chromium.launch(); const pg = await b.newPage({ deviceScaleFactor: 2 });
  for (const [k, c] of Object.entries(CICLOS)) {
    await pg.setContent(`<html><body style="margin:0">${svg(c)}</body></html>`);
    await (await pg.$('svg')).screenshot({ path: path.join(out, `ciclo-${k}.png`) });
  }
  await b.close(); console.log('ok');
})();
