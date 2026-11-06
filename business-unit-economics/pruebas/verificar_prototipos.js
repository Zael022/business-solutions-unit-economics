#!/usr/bin/env node
/* Recorre cada prototipo de la Sesión 2 en un celular simulado, tocando solo los botones (como un cliente),
 * desde la primera pantalla hasta el panel del dueño. Revisa errores, desbordes y la etiqueta «simulado».
 * Uso: node pruebas/verificar_prototipos.js <carpeta_prototipos> */
const path = require('path');
const { chromium, devices } = require('playwright');
const DIR = process.argv[2] || path.join(__dirname, '..', '..', 'sesion2', 'prototipos');
const RECORRIDOS = {
  'tueste.html': ['text=Tocar el aviso', 'text=Invitar por WhatsApp', '#enviar', '#como-andrea', 'button[data-prod="sub"]', 'text=Seguir con mi regalo', '#pago .btn', '#ver-camila', 'text=Ver el panel de Diego'],
  'agendo.html': ['#empezar', '#cuenta >> text=Seguir', '#servicios >> text=Seguir', 'text=Crear mi página', 'text=Mandar por WhatsApp a mis clientes', '#enviar', 'text=Simular que un cliente reserva', 'text=Ver lo que vio Juan', 'text=Día 12 de la prueba: datos para facturar', '#fiscales >> text=Guardar y seguir'],
  'sol-de-casa.html': ['#mensaje >> text=Ver mi ahorro', 'text=Contarle a un vecino', '#enviar', '#como-vecina', 'text=Agendar la visita gratis', 'text=Miércoles', 'text=Agendar visita', 'text=Ver qué le llega a Marta', 'text=Ver el panel de Andrés'],
};
let ok = 0, mal = 0; const fallas = [];
const es = (n, c, d = '') => { c ? ok++ : (mal++, fallas.push(n)); console.log(`${c ? 'PASA ' : 'FALLA'} ${n}${d ? ': ' + d : ''}`); };
(async () => {
  const b = await chromium.launch();
  for (const [f, pasos] of Object.entries(RECORRIDOS)) {
    const ctx = await b.newContext({ ...devices['iPhone 13'] }); const pg = await ctx.newPage(); const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message));
    await pg.route(/fonts\.(googleapis|gstatic)/, (r) => r.fulfill({ body: '', contentType: 'text/css' }));
    await pg.goto('file://' + path.resolve(DIR, f)); await pg.waitForTimeout(150);
    let llego = true;
    for (const s of pasos) {
      try { await pg.locator(s).filter({ visible: true }).first().click({ timeout: 2500 }); await pg.waitForTimeout(120); }
      catch (e) { llego = false; es(`${f} · tocar «${s}»`, false, e.message.split('\n')[0]); break; }
      const ancho = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (ancho > 0) errs.push('desborda ' + ancho + 'px después de ' + s);
    }
    const final = await pg.evaluate(() => document.querySelector('.pantalla.activa').id);
    es(`${f} · se recorre de punta a punta con los botones hasta el panel`, llego && final === 'panel', 'última pantalla: ' + final);
    const sim = await pg.$$eval('.sim', (x) => x.length);
    es(`${f} · marca lo simulado`, sim >= 5, sim + ' etiquetas «simulado»');
    es(`${f} · sin errores ni desbordes en el celular`, errs.length === 0, errs.join(' | '));
    await ctx.close();
  }
  await b.close();
  console.log(`\nRESULTADO: ${ok} pasan, ${mal} fallan.` + (mal ? '\nFallan: ' + fallas.join(' | ') : ''));
  process.exit(mal ? 1 : 0);
})();
