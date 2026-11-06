#!/usr/bin/env node
/* Cuentas de la Sesión 2 (growth) de los tres casos, con el módulo growth del motor.
 * Todos los datos salen de la Parte 1 y la Parte 2 de cada caso; lo que no viene del caso está en SUPUESTOS.
 * Uso: node cuentas.js > cuentas.json */
const path = require('path');
const UE = require(path.join(__dirname, '..', '..', 'business-unit-economics', 'motor', 'motor.js'));
const G = UE.growth;
const r2 = (x) => (x === null ? null : Math.round(x * 10000) / 10000);

/* ======================================================== A · Tueste */
const A = {};
{
  const embudo = G.embudo([{ nombre: 'Correo recibido', n: 1000 }, { nombre: 'Correo abierto', n: 350 }, { nombre: 'Página del programa', n: 120 }, { nombre: 'Clientes que invitan', n: 100 },
    { nombre: 'Invitaciones enviadas', n: 300 }, { nombre: 'Amigos que abren la tienda', n: 150 }, { nombre: 'Amigos que compran', n: 60 }]);
  const invitaciones = 300;
  const cacMeta = (4000 + 1000) / 100;                 // Parte 1: $4.000 + fee $1.000, 100 clientes nuevos
  const tope = cacMeta / 2;                            // regla de Diego
  const mesGratis = 10.88 + 4.5 + 1.2;                 // Parte 2: no cobra $30,60 y paga café, envío y caja
  const kHoy = G.k(100 / 1000, invitaciones / 100, 60 / invitaciones);
  const recompensas = [
    { nombre: 'Amigo: $8 de descuento en su primer pedido (ya aplicado)', costo: 8, repartidoEntre: 1, cuando: 'siempre' },
    { nombre: 'Quien invita: $5 de crédito por cada amigo que compra', costo: 5, repartidoEntre: 1, cuando: 'siempre' },
    { nombre: 'Quien invita, nivel 3 amigos: una bolsa de 340 g de regalo', costo: 5.44, repartidoEntre: 3, cuando: 'al tercer amigo' },
    { nombre: 'Quien invita, 2 amigos suscritos: un mes gratis de suscripción', costo: mesGratis, repartidoEntre: 2, cuando: 'si el amigo se suscribe' },
  ];
  const n = recompensas.map((r) => r.nombre);
  const combos = [[n[0], n[1]], [n[0], n[1], n[2]], [n[0], n[1], n[3]], [n[0], n[1], n[2], n[3]]];
  const peor = G.peorCombinacion(recompensas, combos, tope);
  // Meta del diseño (supuestos propios, marcados): ven el programa 35 % y compra el 50 % de los amigos que abren la página.
  const ven = 0.35, invitanDeLosQueVen = 100 / 120, porInvitador = 3, abren = 0.5, compran = 0.5;
  const kSoloMomento = G.k(ven, invitanDeLosQueVen, porInvitador, abren, 0.4);
  const kMeta = G.k(ven, invitanDeLosQueVen, porInvitador, abren, compran);
  const base = 100 + 47;                               // clientes nuevos al mes por Meta y por otras vías (Parte 1 con $4.000)
  const refHoy = G.referidosPorMes(base, kHoy), refMeta = G.referidosPorMes(base, kMeta);
  Object.assign(A, {
    embudo, invitaciones, cacMeta, tope, mesGratis, costoHoy: 16, kHoy, recompensas, combos: peor,
    meta: { ven, abren, compran, kSoloMomento, kMeta, porCada100Hoy: kHoy * 100, porCada100Meta: kMeta * 100, base, refHoy, refMeta,
      parteMetaHoy: 100 / base, parteMetaMeta: 100 / (base + refMeta), costoReferidoPromedio: peor.combinaciones[1].costo },
    vistosHoy: 120 / 1000, pierdenAntesDeVer: 880 / 1000,
  });
}

/* ======================================================== B · Agendo */
const B = {};
{
  const embudo = G.embudo([{ nombre: 'Empiezan la prueba', n: 100 }, { nombre: 'Datos fiscales', n: 74 }, { nombre: 'Datos del negocio', n: 70 }, { nombre: 'Servicios', n: 65 },
    { nombre: 'Horarios («¡Listo!»)', n: 62 }, { nombre: 'Comparten el link el primer día', n: 30 }]);
  const tiempos = [{ pantalla: 'Datos fiscales', min: 4 }, { pantalla: 'Datos del negocio', min: 3 }, { pantalla: 'Servicios', min: 12 }, { pantalla: 'Horarios', min: 9 }];
  const tasaRes = { comparten: 27 / 30, noComparten: 11 / 32 }, habitoDeReservan = 22 / 38;
  const tasasPago = { noConfiguran: 0.01, sinReserva: 0.05, reserva: 0.15, habito: 0.45 };
  const modelo = (configuran, comparten) => { // por cada 100 trials
    const comp = configuran * comparten, noComp = configuran - comp;
    const reservan = comp * tasaRes.comparten + noComp * tasaRes.noComparten, habito = reservan * habitoDeReservan;
    const grupos = [{ n: 100 - configuran, tasa: tasasPago.noConfiguran }, { n: configuran - reservan, tasa: tasasPago.sinReserva }, { n: reservan - habito, tasa: tasasPago.reserva }, { n: habito, tasa: tasasPago.habito }];
    const conv = G.conversionPorGrupos(grupos), clientes = 500 * conv;
    const cac = (10000 + 1200 + 20 * clientes) / clientes;   // Parte 1: anuncios + Mariela + $20 por cliente
    return { configuran, comparten: comp, reservan, habito, conv, clientes, cac, ltvCac: (19.5 * (1 - Math.pow(0.94, 24)) / 0.06) / cac };
  };
  const hoy = { configuran: 62, comparten: 30, reservan: 38, habito: 22 };
  hoy.conv = G.conversionPorGrupos([{ n: 38, tasa: 0.01 }, { n: 24, tasa: 0.05 }, { n: 16, tasa: 0.15 }, { n: 22, tasa: 0.45 }]);
  hoy.clientes = 500 * hoy.conv; hoy.cac = (10000 + 1200 + 20 * hoy.clientes) / hoy.clientes;
  const meta = modelo(90, 0.7);          // supuestos propios: plantillas y datos fiscales al final → 90 configuran; botón de WhatsApp → 70 % comparte
  const prudente = { reservanDe: 0.38, reservanA: 0.55 };
  const insignia = { visitasPorPagina: 250, barberiasHoy: 8, paginasActivas: 1150 };
  insignia.tasaHoy = insignia.barberiasHoy / (insignia.visitasPorPagina * insignia.paginasActivas);
  Object.assign(B, { embudo, tiempos, tiempoTotal: 28, tasaRes, habitoDeReservan, tasasPago, hoy, meta, prudente, insignia,
    cacParte1: 180, ltv24: 19.5 * (1 - Math.pow(0.94, 24)) / 0.06 });
}

/* ======================================================== C · Sol de Casa */
const C = {};
{
  const tasas = { contacto: 0.95, agenda: 0.85, visita: 0.9, cierre: 0.45 };
  const ventaPorLead = G.k(tasas.contacto, tasas.agenda, tasas.visita, tasas.cierre);
  const visitasPorVenta = 1 / tasas.cierre, agendadasPorVenta = 1 / (tasas.visita * tasas.cierre);
  const costoVisitas = visitasPorVenta * 60, tope = 300, paraRecompensas = tope - costoVisitas;
  const contrib = 6500 * 0.28 - 0.03 * 6500;
  const recompensas = [
    { nombre: 'Familia: $10 de descuento en el plan de mantenimiento por cada vecino que agenda', costo: 10 * agendadasPorVenta, repartidoEntre: 1, cuando: 'por agendar (×2,47 agendas por venta)' },
    { nombre: 'Familia: una limpieza de paneles gratis cuando el vecino firma', costo: 60, repartidoEntre: 1, cuando: 'al firmar' },
    { nombre: 'Familia: $80 de descuento en el plan de mantenimiento cuando el vecino firma', costo: 80, repartidoEntre: 1, cuando: 'al firmar' },
  ];
  const n = recompensas.map((r) => r.nombre);
  const peor = G.peorCombinacion(recompensas, [[n[0]], [n[0], n[1], n[2]]], tope, costoVisitas);
  const leadsHoy = 420 * 0.08 / 12, ventasHoy = leadsHoy * ventaPorLead;
  const visitasPorLead = G.k(tasas.contacto, tasas.agenda, tasas.visita);
  const leadsParaTecnico = 50 / visitasPorLead, letreroPorCasaMes = 6 / 20 / 2, familiasParaTecnico = leadsParaTecnico / letreroPorCasaMes;
  const valorVisita = { referido: tasas.cierre * contrib - 60, google: 0.30 * contrib - 60, meta: 0.18 * contrib - 60 };
  // Meta del diseño (supuesto propio): comparte el 40 % de las familias (las que hoy ya enseñan su recibo) y cada una rinde como un letrero.
  const comparten = 420 * 0.40, leadsMeta = comparten * letreroPorCasaMes, visitasMeta = leadsMeta * visitasPorLead, ventasMeta = leadsMeta * ventaPorLead;
  const ahorro = { recibo: 110, pct: 0.7 }; ahorro.mes = ahorro.recibo * ahorro.pct; ahorro.anio = ahorro.mes * 12; ahorro.anosRecupera = 6500 / ahorro.anio;
  const experimento = { familias: 25, meses: 2, controlLeads: 25 * 0.08 / 12 * 2, metaLeads: 25 * letreroPorCasaMes * 2 };
  Object.assign(C, { tasas, ventaPorLead, visitasPorVenta, agendadasPorVenta, costoVisitas, tope, paraRecompensas, contrib, recompensas, combos: peor,
    leadsHoy, ventasHoy, visitasPorLead, leadsParaTecnico, letreroPorCasaMes, familiasParaTecnico, valorVisita,
    meta: { comparten, leads: leadsMeta, visitas: visitasMeta, ventas: ventasMeta, costoPorVenta: peor.peor.costo },
    cacMeta: (4000 + 60 * 57.75) / 10.395, cacGoogle: (4000 + 60 * 39.7375) / 11.92125,
    web: G.embudo([{ nombre: 'Visitas a la página', n: 100 }, { nombre: 'Abren el formulario', n: 14 }, { nombre: 'Dejan sus datos', n: 6 }]),
    familias: G.embudo([{ nombre: 'Familias con paneles', n: 420 }, { nombre: 'Saben cuánto ahorraron', n: 420 * 0.25 }]), ahorro, experimento });
}

/* ======================================================== matriz de 90 días (payback en meses de la Parte 1) */
const matriz = { // payback en meses según la Parte 1 (o lo que tarda en volver lo que se paga en recompensas); límite de «vuelve rápido»: 3 meses
  A: [{ canal: 'Referidos de hoy ($8 + $8): ya traen 6 de cada 100', paybackMeses: 1, seguro: true, porque: 'la recompensa se paga cuando el amigo compra y su primer pedido ya deja $15,89' },
      { canal: 'Referidos nuevos: aviso al llegar el café, link y niveles', paybackMeses: 1, seguro: false, porque: 'misma lógica de pago, pero la meta de 17,5 a 22 por cada 100 hay que probarla' },
      { canal: 'Tarjeta con el link dentro del paquete (el 6 % ya publica fotos)', paybackMeses: 1, seguro: false, porque: 'cuesta centavos por paquete; no hay datos de cuántos la usan' },
      { canal: 'Meta con $4.000 y el pack', paybackMeses: 7, puedeDarMucho: true, porque: 'trae 2 de cada 3 clientes nuevos, pero cada uno tarda 7 meses en devolver su CAC de $50' },
      { canal: 'Volver a $16.000 en Meta con 30 % de descuento', paybackMeses: null, puedeDarMucho: false, porque: 'no recupera el CAC en 12 meses (LTV:CAC 0,64)' }],
  B: [{ canal: 'Insignia de hoy (8 barberías nuevas al mes, $0)', paybackMeses: 1, seguro: true, porque: 'no cuesta nada y ya funciona' },
      { canal: 'Insignia nueva «¿Tenés barbería? Probá gratis» con link', paybackMeses: 1, seguro: false, porque: 'cuesta $0; cuántas barberías trae hay que medirlo' },
      { canal: 'Puesta en marcha nueva (sube la conversión de todos los trials)', paybackMeses: 1, seguro: false, porque: 'no es un canal: baja el CAC paid de $180 a unos $119 si se cumple la meta' },
      { canal: 'Anuncios con $10.000 (sin triplicar)', paybackMeses: 14, puedeDarMucho: true, porque: 'cada cliente devuelve su CAC de $180 en 14 meses; con la puesta en marcha nueva, en unos 8' },
      { canal: 'Triplicar los anuncios a $30.000', paybackMeses: null, puedeDarMucho: false, porque: 'cada cliente extra cuesta $399 y deja $251' }],
  C: [{ canal: 'Google con $4.000', paybackMeses: 2, seguro: true, porque: 'CAC real $536, la venta deja $1.625 y se cobra en dos meses' },
      { canal: 'Meta con $4.000 (después de Google y de los referidos en la agenda)', paybackMeses: 2, seguro: true, porque: 'CAC real $718; recupera en dos meses, pero sus visitas valen menos' },
      { canal: 'Ahorro compartido: tarjeta por WhatsApp y calculadora del vecino', paybackMeses: 2, seguro: false, porque: 'venta referida ≤ $300 con visitas; cuánto comparten hay que probarlo con 50 familias' },
      { canal: 'Letreros «Esta casa ahorra con Sol de Casa»', paybackMeses: 2, seguro: false, porque: '6 leads de 20 casas en 2 meses: una muestra chica' },
      { canal: 'Videos y testimonios con el ahorro real de las familias', paybackMeses: 6, puedeDarMucho: true, porque: 'hoy no hay ninguno; tardan en producir clientes' },
      { canal: 'Pasar todo el presupuesto a Meta (Leadly)', paybackMeses: null, puedeDarMucho: false, porque: 'bajan las ventas de 22,3 a 17,5 al mes' }],
};
for (const k of Object.keys(matriz)) for (const c of matriz[k]) c.cuadrante = UE.growth.cuadrante(c);

console.log(JSON.stringify({ A, B, C, matriz }, (k, v) => (typeof v === 'number' ? r2(v) : v), 1));
