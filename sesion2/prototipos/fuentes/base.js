/* Navegación común: pantallas <section class="pantalla" id="..." data-nombre="...">, mapa de la demo y hash (#id). */
(function () {
  'use strict';
  const $ = (s, el) => (el || document).querySelector(s), $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const pantallas = $$('.pantalla');
  const historia = [];
  const mapa = $('#mapa'), etiqueta = $('#paso-actual');
  pantallas.forEach((p, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.ir = p.id;
    b.innerHTML = `<i>${String(i + 1).padStart(2, '0')}</i><span>${p.dataset.nombre}</span>`;
    mapa.appendChild(b);
  });
  function ir(id, sinHistoria) {
    const p = document.getElementById(id); if (!p) return;
    const actual = $('.pantalla.activa');
    if (actual && actual !== p && !sinHistoria) historia.push(actual.id);
    pantallas.forEach((x) => x.classList.toggle('activa', x === p));
    $$('button', mapa).forEach((b) => b.setAttribute('aria-current', b.dataset.ir === id ? 'true' : 'false'));
    etiqueta.innerHTML = `<b>${pantallas.indexOf(p) + 1} de ${pantallas.length}</b> · ${p.dataset.nombre}`;
    mapa.classList.remove('abierto');
    if (location.hash.slice(1) !== id) { try { history.replaceState(null, '', '#' + id); } catch (e) { /* sin historial */ } }
    p.scrollIntoView ? window.scrollTo({ top: 0 }) : 0;
    document.dispatchEvent(new CustomEvent('pantalla', { detail: id }));
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ir]'); if (b) { e.preventDefault(); ir(b.dataset.ir); }
    if (e.target.closest('[data-atras]')) { const id = historia.pop(); if (id) ir(id, true); }
  });
  $('#abrir-mapa').addEventListener('click', () => mapa.classList.toggle('abierto'));
  window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (id && document.getElementById(id)) ir(id, true); });
  window.toast = (t) => { const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); };
  window.copiar = (texto, el) => {
    const ok = () => toast('Copiado');
    try { navigator.clipboard.writeText(texto).then(ok, () => { if (el) { el.select && el.select(); } toast('Seleccioná el texto y copialo'); }); }
    catch (e) { toast('Seleccioná el texto y copialo'); }
  };
  window.ir = ir;
  window.dinero = (v, d) => (v < 0 ? '−$' : '$') + Math.abs(v).toLocaleString('es-CR', { minimumFractionDigits: d === undefined ? 0 : d, maximumFractionDigits: d === undefined ? 0 : d }).replace(/ | | /g, '.');
  const inicio = location.hash.slice(1);
  ir(inicio && document.getElementById(inicio) ? inicio : pantallas[0].id, true);
})();
