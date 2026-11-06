#!/usr/bin/env node
/* Genera una calculadora HTML autónoma (un solo archivo, sin instalar nada ni usar internet).
 * Uso:  node construir.js perfil.json salida.html            → calculadora de una empresa
 *       node construir.js --universal salida.html p1.json ...  → calculadora universal con plantillas */
const fs = require('fs'), path = require('path');
const D = __dirname, leer = (f) => fs.readFileSync(path.join(D, f), 'utf8');
const UE = require('./motor.js');
const args = process.argv.slice(2);
const universal = args[0] === '--universal';
if (universal) args.shift();
const salida = universal ? args.shift() : args[1];
const perfiles = (universal ? args : [args[0]]).map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
if (!salida || !perfiles.length) { console.error('Uso: node construir.js perfil.json salida.html | --universal salida.html perfiles...'); process.exit(1); }
for (const p of perfiles) {
  if (!p.parametros || !p.unidad || !p.adquisicion) throw new Error(`El perfil ${p.id || '?'} no tiene parametros, unidad y adquisicion`);
  const T = UE.calcularTodo(p); // valida que el motor lo pueda calcular (los datos faltantes se permiten)
  if (T.escenarios.some((e) => e.r.ok && !isFinite(e.r.ltv))) throw new Error('Resultado inválido en ' + p.id);
}
const segura = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
let datos = 'window.PERFIL=' + segura(perfiles[0]) + ';';
if (universal) {
  const pl = {}; for (const p of perfiles) pl[p.id] = p;
  datos += 'window.UNIVERSAL=true;window.PLANTILLAS=' + segura(pl) + ';';
}
const html = leer('plantilla.html')
  .replace('/*CSS*/', () => leer('estilos.css'))
  .replace('/*DATOS*/', () => datos)
  .replace('/*MOTOR*/', () => leer('motor.js'))
  .replace('/*GRAFICOS*/', () => leer('graficos.js'))
  .replace('/*APP*/', () => leer('app.js'));
fs.writeFileSync(salida, html);
console.log('Calculadora creada:', salida, `(${(html.length / 1024).toFixed(0)} KB, ${perfiles.length} perfil${perfiles.length > 1 ? 'es' : ''})`);
