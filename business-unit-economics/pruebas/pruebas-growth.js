#!/usr/bin/env node
/* Pruebas del módulo growth y de las cuentas de la Sesión 2, contra cuentas hechas a mano con los datos de la Parte 2.
 * Uso: node pruebas/pruebas-growth.js [ruta/a/cuentas.json] */
const path = require('path'), fs = require('fs');
const UE = require('../motor/motor.js'), G = UE.growth;
const archivo = process.argv[2] || path.join(__dirname, '..', '..', 'sesion2', 'cuentas', 'cuentas.json');
const D = JSON.parse(fs.readFileSync(archivo, 'utf8'));
let ok = 0, mal = 0; const fallas = [];
const cerca = (n, a, b, tol = 0.002) => { const p = a !== null && Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)); p ? ok++ : (mal++, fallas.push(n)); console.log(`${p ? 'PASA ' : 'FALLA'} ${n}: calculado=${a} esperado=${+b.toFixed(4)}`); };
const es = (n, c, d = '') => { c ? ok++ : (mal++, fallas.push(n)); console.log(`${c ? 'PASA ' : 'FALLA'} ${n}${d ? ': ' + d : ''}`); };

console.log('## Módulo growth');
const e = G.embudo([{ nombre: 'a', n: 100 }, { nombre: 'b', n: 40 }, { nombre: 'c', n: 30 }]);
es('Embudo: el paso con menor tasa es b (40 %)', e.peorTasa.nombre === 'b');
cerca('Encuesta del Club: 100 × 20 % × 2 × 25 % = 10 socios', 100 * G.k(0.2, 2, 0.25), 10);
const ba = G.balde(100, 0.10, 12), bb = G.balde(200, 0.30, 12);
cerca('Encuesta A contra B: A tiene 718 socios al año', ba.serie[11], 717.57, 0.001);
cerca('Encuesta A contra B: B tiene 657 socios al año', bb.serie[11], 657.0, 0.002);
es('B va adelante hasta el mes 9 y A lo pasa en el mes 10', bb.serie[8] > ba.serie[8] && ba.serie[9] > bb.serie[9]);
cerca('Techo del balde A = 100 ÷ 10 %', ba.techo, 1000);
es('Ciclo con K ≥ 1 no tiene techo (vacío, no infinito)', G.referidosPorMes(100, 1.2) === null);
cerca('Duplicar los anuncios de Migas: $2.000 extra ÷ 50 clientes extra = $40', 2000 / (150 - 100), 40);

console.log('\n## A · Tueste');
const A = D.A, fa = A.embudo.filas;
cerca('Correo abierto 350 ÷ 1.000', fa[1].tasa, 0.35);
cerca('Página del programa 120 ÷ 350', fa[2].tasa, 120 / 350);
cerca('Invitan 100 ÷ 120', fa[3].tasa, 100 / 120);
cerca('Abren la tienda 150 ÷ 300 invitaciones', fa[5].tasa, 0.5);
cerca('Compran 60 ÷ 150', fa[6].tasa, 0.4);
es('El paso con menor tasa es del correo a la página (34 %)', A.embudo.peorTasa.nombre === 'Página del programa');
cerca('Se pierden antes de ver el programa: 880 de 1.000', A.pierdenAntesDeVer, 0.88);
cerca('CAC de Meta (4.000 + 1.000) ÷ 100', A.cacMeta, 50);
cerca('Tope por cliente referido: la mitad', A.tope, 25);
cerca('Mes gratis de suscripción: 10,88 + 4,50 + 1,20', A.mesGratis, 16.58);
cerca('K de hoy = 10 % × 3 × 20 %', A.kHoy, 0.06);
cerca('Peor combinación de recompensas: 8 + 5 + 5,44 ÷ 3 + 16,58 ÷ 2', A.combos.peor.costo, 8 + 5 + 5.44 / 3 + 16.58 / 2);
es('Ninguna combinación pasa los $25', A.combos.combinaciones.every((c) => c.costo <= 25));
cerca('Meta: K = 35 % × 83,3 % × 3 × 50 % × 50 %', A.meta.kMeta, 0.35 * (100 / 120) * 3 * 0.5 * 0.5);
cerca('Solo con el momento correcto: K = 0,175 (17,5 por cada 100)', A.meta.kSoloMomento, 0.175);
cerca('Referidos al mes con K meta: 147 × K ÷ (1 − K)', A.meta.refMeta, 147 * 0.21875 / (1 - 0.21875));
cerca('Parte de Meta en los clientes nuevos baja de 68 % a 53 %', A.meta.parteMetaMeta, 100 / (147 + 147 * 0.21875 / 0.78125));

console.log('\n## B · Agendo');
const B = D.B, fb = B.embudo.filas;
cerca('Datos fiscales 74 ÷ 100', fb[1].tasa, 0.74);
cerca('Compartir el link 30 ÷ 62', fb[5].tasa, 30 / 62);
es('Donde más gente se pierde (en cantidad): compartir el link (32)', B.embudo.masPerdidos.nombre === 'Comparten el link el primer día');
es('Donde más tiempo se va: servicios (12 de 28 minutos)', B.tiempos.reduce((a, b) => (b.min > a.min ? b : a)).pantalla === 'Servicios');
cerca('Conversión a pago de hoy: 38 × 1 % + 24 × 5 % + 16 × 15 % + 22 × 45 %', B.hoy.conv, 0.1388);
cerca('CAC paid de hoy con 13,9 %', B.hoy.cac, (11200 + 20 * 69.4) / 69.4);
cerca('Meta: reciben su primera reserva 63 × 90 % + 27 × 11/32', B.meta.reservan, 63 * 0.9 + 27 * 11 / 32);
cerca('Meta: llegan a uso habitual (reservan × 22/38)', B.meta.habito, (63 * 0.9 + 27 * 11 / 32) * 22 / 38);
cerca('Meta: conversión a pago 22,7 %', B.meta.conv, 0.2266, 0.002);
cerca('Meta: CAC paid baja a $119', B.meta.cac, 118.86, 0.002);

console.log('\n## C · Sol de Casa');
const C = D.C;
cerca('Ventas por lead referido: 95 % × 85 % × 90 % × 45 %', C.ventaPorLead, 0.95 * 0.85 * 0.9 * 0.45);
cerca('Visitas por venta 1 ÷ 45 %', C.visitasPorVenta, 2.2222);
cerca('Costo de visitas por venta referida', C.costoVisitas, 133.33);
cerca('Para recompensas: $300 − $133,33', C.paraRecompensas, 166.67);
cerca('Peor combinación con visitas: 133,33 + 10 × 2,47 + 60 + 80', C.combos.peor.costo, 133.333 + 10 / (0.9 * 0.45) + 140);
es('La venta referida no pasa los $300', C.combos.cumple);
cerca('Referidos de hoy: 420 × 8 % ÷ 12 leads al mes', C.leadsHoy, 2.8);
cerca('Leads para llenar 50 visitas: 50 ÷ (95 % × 85 % × 90 %)', C.leadsParaTecnico, 50 / (0.95 * 0.85 * 0.9));
cerca('Familias que harían falta si cada una rinde como un letrero', C.familiasParaTecnico, (50 / (0.95 * 0.85 * 0.9)) / 0.15);
es('Más familias que las 420 que hay', C.familiasParaTecnico > 420);
cerca('Valor de una visita referida 45 % × 1.625 − 60', C.valorVisita.referido, 671.25);
cerca('Ahorro de la familia promedio 110 × 70 %', C.ahorro.mes, 77);
cerca('Años para recuperar la instalación 6.500 ÷ 924', C.ahorro.anosRecupera, 7.03, 0.002);
cerca('Página web: 14 de 100 abren el formulario', C.web.filas[1].tasa, 0.14);

console.log('\n## Matriz de 90 días');
for (const k of ['A', 'B', 'C']) {
  es(`${k}: los anuncios siguen en la matriz`, D.matriz[k].some((c) => /Meta|Anuncios|Google/.test(c.canal) && c.cuadrante !== 'Descartar por ahora'));
  es(`${k}: la propuesta que se rechazó en la Sesión 1 queda descartada`, D.matriz[k][D.matriz[k].length - 1].cuadrante === 'Descartar por ahora');
}
console.log(`\nRESULTADO: ${ok} pasan, ${mal} fallan.` + (mal ? '\nFallan: ' + fallas.join(' | ') : ''));
process.exit(mal ? 1 : 0);
