/* Genera la ficha de growth de una página de cada caso (.docx, se abre en Google Docs). Uso: node fichas.js <carpeta> */
const fs = require('fs'), path = require('path');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, ImageRun, AlignmentType, BorderStyle, LevelFormat, VerticalAlign } = require('docx');
const OUT = process.argv[2];
const ANCHO = 12240 - 2 * 720; // carta con márgenes de 0,5"
const F = 'Arial';
const t = (texto, o = {}) => new TextRun({ text: texto, font: F, size: o.size || 19, bold: o.bold, color: o.color, italics: o.italics });
const p = (partes, o = {}) => new Paragraph({ children: (Array.isArray(partes) ? partes : [partes]).map((x) => (typeof x === 'string' ? t(x, o) : x)), spacing: { before: o.before || 0, after: o.after === undefined ? 40 : o.after }, alignment: o.align, numbering: o.bullet ? { reference: 'vinetas', level: 0 } : undefined, keepNext: o.keepNext });
const h = (texto, color) => new Paragraph({ children: [t(texto.toUpperCase(), { bold: true, size: 16, color })], spacing: { before: 90, after: 30 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color, space: 1 } }, keepNext: true });
const sinBorde = { top: { style: BorderStyle.NONE, size: 0 }, bottom: { style: BorderStyle.NONE, size: 0 }, left: { style: BorderStyle.NONE, size: 0 }, right: { style: BorderStyle.NONE, size: 0 } };
const linea = { style: BorderStyle.SINGLE, size: 2, color: 'C9CED6' };
const bordes = { top: linea, bottom: linea, left: linea, right: linea };
function tabla(filas, anchos, color, o = {}) {
  const total = anchos.reduce((a, b) => a + b, 0);
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: anchos,
    rows: filas.map((f, i) => new TableRow({ children: f.map((c, j) => new TableCell({ width: { size: anchos[j], type: WidthType.DXA }, borders: bordes,
      shading: i === 0 && o.encabezado !== false ? { type: ShadingType.CLEAR, color: 'auto', fill: color } : (o.sombra && o.sombra(i, j)) ? { type: ShadingType.CLEAR, color: 'auto', fill: 'F1F3F5' } : undefined,
      margins: { top: 40, bottom: 40, left: 80, right: 80 },
      children: [new Paragraph({ alignment: j > 0 && o.derecha ? AlignmentType.RIGHT : AlignmentType.LEFT, spacing: { after: 0 }, children: [t(String(c), { size: 17, bold: (i === 0 && o.encabezado !== false) || (o.negritaUltima && i === filas.length - 1), color: i === 0 && o.encabezado !== false ? 'FFFFFF' : undefined })] })] })) })) });
}
const FICHAS = {
  tueste: {
    color: '2F5A47', titulo: 'Tueste · Programa de referidos «Regalá un café»', proto: 'prototipos/tueste.html',
    paso: ['De 1.000 clientes, 350 abren el correo (35 %) y solo 120 llegan a la página del programa (34 % de los que lo abren): ', t('el 88 % nunca ve el programa', { bold: true }), '. El correo sale al día siguiente de pagar y el café tarda 3 días. Nuestro diseño manda el aviso cuando el paquete llega, que es cuando el 6 % ya publica fotos sin que nadie se lo pida, y lo lleva directo a invitar en un toque.'],
    meta: [['Métrica', 'Hoy', 'Meta'], ['Clientes que ven el programa', '12 %', '35 %'], ['Amigos que compran (de los que abren)', '40 %', '50 %'], ['Referidos por cada 100 clientes (K)', '6', '21,9'], ['Referidos al mes (147 nuevos al mes)', '9', '41'], ['Parte de los clientes nuevos que viene de Meta', '68 %', '53 %']],
    cambia: 'Un cliente por referidos cuesta como máximo $23,10 (lo normal: $14,81), contra $50 de un cliente de Meta ($4.000 + $1.000 de agencia ÷ 100). Si Meta se cae seis horas, siguen entrando clientes.',
    semana: 'Clientes nuevos por referidos cada 100 clientes que reciben su café (hoy 6). North Star: bolsas entregadas por semana.',
    matriz: [['', 'Vuelve rápido (se elige por el riesgo)', 'Vuelve lento (se elige por cuánto puede dar)'], ['Seguro / puede dar mucho', 'Siempre activo: referidos de hoy ($8 + $8), que ya traen 6 de cada 100', 'Largo plazo: Meta con $4.000 y el pack (2 de cada 3 clientes; devuelve el CAC en 7 meses). Contenido de las seis fincas'], ['Incierto / promete poco', 'Probar: referidos nuevos con aviso al llegar el café; tarjeta con el link dentro del paquete', 'Descartar por ahora: volver a $16.000 en Meta con 30 % de descuento (LTV:CAC 0,64)']],
    experimento: 'Si el aviso para invitar sale cuando llega el café (la mitad de los clientes nuevos durante 4 semanas), entonces los clientes que ven el programa pasan de 12 % a 35 %, y vigilamos que el costo por cliente referido no pase de $25 ni suban las bajas de la lista de correos.',
    tablaTitulo: 'Recompensas (regla de Diego: un referido no cuesta más de $25)',
    tabla: [['Recompensa', 'Costo', 'Por referido'], ['Amigo: $8 de descuento ya aplicado en su primer pedido', '$8,00', '$8,00'], ['Quien invita: $5 de crédito por cada amigo que compra', '$5,00', '$5,00'], ['Quien invita, al 3.er amigo: una bolsa de 340 g de café', '$5,44', '$1,81'], ['Quien invita, 2 amigos suscritos: un mes de suscripción gratis ($10,88 + $4,50 + $1,20)', '$16,58', '$8,29'], ['Peor combinación (todas juntas)', '', '$23,10 ≤ $25']],
    anchos: [7200, 1500, 2100],
    ia: ['Al armar el embudo, la IA pasó de «100 clientes invitan» a «150 amigos abren la tienda» y calculó un paso del 150 %. Faltaba el paso de las 300 invitaciones (3 por cliente). Con ese paso, abren el 50 % y compran el 40 %.', 'La regla de la clase pone en «vuelve rápido» lo que devuelve su costo en pocos meses. Meta tarda 7 meses, así que quedó en «Largo plazo» y no en «Siempre activo», como los anuncios del ejemplo de Migas. Lo dejamos así porque es lo que dicen los números.'],
  },
  agendo: {
    color: '1D3A6E', titulo: 'Agendo · Puesta en marcha nueva', proto: 'prototipos/agendo.html',
    paso: ['Se pierden dos grupos: 26 de cada 100 en la primera pantalla, que pide datos fiscales a quien vino por «más clientes» (pasa el 74 %), y ', t('32 de los 62 que terminan no comparten su link el primer día', { bold: true }), ' (pasa el 48 %). Donde más tiempo se va: servicios, 12 de 28 minutos. Hábito: 20 citas en 14 días. Aha: un cliente reserva solo por el link. Setup: servicios, horario y link compartido. El diseño deja los datos fiscales para el día 12, carga plantillas y termina en el botón de WhatsApp.'],
    meta: [['Métrica (por cada 100 trials)', 'Hoy', 'Meta'], ['Configuran su página', '62', '90'], ['Comparten el link el primer día', '30', '63'], ['Reciben su primera reserva', '38', '66'], ['Llegan a uso habitual', '22', '38'], ['Conversión a pago', '13,9 %', '22,7 %'], ['CAC paid (500 trials, $10.000)', '$181', '$119']],
    cambia: 'Con los mismos $10.000 entran 113 clientes en vez de 69. El CAC paid baja de $181 a $119, el LTV:CAC sube de 1,39 a 2,11 y el payback baja de 14 a 8 meses. Recién ahí tiene sentido subir los anuncios.',
    semana: 'Trials que reciben su primera reserva por el link (hoy 38 %). North Star: barberías con 20 citas o más en los últimos 14 días.',
    matriz: [['', 'Vuelve rápido (se elige por el riesgo)', 'Vuelve lento (se elige por cuánto puede dar)'], ['Seguro / puede dar mucho', 'Siempre activo: la insignia de hoy (8 barberías al mes, $0)', 'Largo plazo: anuncios con $10.000, sin triplicar (CAC $180, payback 14 meses; con la meta, 8). Alianzas con academias de barbería'], ['Incierto / promete poco', 'Probar: la puesta en marcha nueva y la insignia con «Probá gratis» (250 visitas al mes por barbería)', 'Descartar por ahora: triplicar a $30.000 (cada cliente extra cuesta $399 y deja $251)']],
    experimento: 'Si la mitad de los trials del mes empieza con plantillas y deja los datos fiscales para el final, entonces los trials que reciben su primera reserva pasan de 38 % a 55 % (meta prudente para la primera prueba), y vigilamos que no suban los negocios que llegan al día 14 sin datos para facturar.',
    tablaTitulo: 'Cómo baja el CAC paid (Parte 1: $10.000 + $1.200 de Mariela + $20 por cliente)',
    tabla: [['Grupo (por cada 100 trials)', 'Pagan', 'Hoy', 'Meta'], ['No configuran', '1 %', '38', '10'], ['Configuran sin reserva', '5 %', '24', '24'], ['Reservan sin hábito', '15 %', '16', '27,8'], ['Uso habitual', '45 %', '22', '38,2'], ['Conversión → clientes con 500 trials → CAC paid', '', '13,9 % · 69 · $181', '22,7 % · 113 · $119']],
    anchos: [4800, 1200, 2400, 2400],
    ia: ['La IA escribió que, con la puesta en marcha nueva, el cliente devuelve su CAC «en unos 7 meses». Con la curva del motor (margen de $19,50 y 6 % de cancelación) son 8. Lo corregimos.', 'Al probar el prototipo tocando solo los botones, el aviso «Enviado a 48 clientes» tapaba el botón «Simular que un cliente reserva» durante 3 segundos y el recorrido se trababa. La IA no lo había notado; hicimos que el aviso no bloquee los toques.'],
  },
  'sol-de-casa': {
    color: '0F5C7A', titulo: 'Sol de Casa · El ahorro que se comparte', proto: 'prototipos/sol-de-casa.html',
    paso: ['Retener aquí es mantener la relación: nadie vuelve a comprar paneles, pero una familia que ve su ahorro lo cuenta. Hoy ', t('el 75 % no sabe cuánto ahorró', { bold: true }), ' y no recibe ningún mensaje. En la web, de 100 visitas solo 14 abren el formulario (14 %). El diseño le manda a cada familia su ahorro del mes con una tarjeta para WhatsApp, y el vecino llega a una calculadora que termina en agendar.'],
    meta: [['Métrica (al mes)', 'Hoy', 'Meta'], ['Familias que saben cuánto ahorraron', '25 %', '100 %'], ['Familias que comparten su tarjeta', '—', '168 (40 %)'], ['Leads referidos (0,15 por familia, como un letrero)', '2,8', '25,2'], ['Visitas hechas de referidos', '2,0', '18,3'], ['Ventas referidas', '0,9', '8,2']],
    cambia: 'Una venta referida cuesta $298 con visitas, contra $718 de Meta y $536 de Google (CAC real). Con la agenda casi llena, cada visita referida que reemplaza a una de Meta vale $671 en vez de $233. Para llenar las 50 visitas de un técnico nuevo harían falta 69 leads: 459 familias rindiendo como un letrero, más que las 420 que hay. El ciclo solo no alcanza: los referidos van primero en la agenda y siguen los letreros y Google.',
    semana: 'Tarjetas de ahorro compartidas. North Star: ventas que vienen de clientes actuales por mes (hoy 0,9).',
    matriz: [['', 'Vuelve rápido (se elige por el riesgo)', 'Vuelve lento (se elige por cuánto puede dar)'], ['Seguro / puede dar mucho', 'Siempre activo: Google con $4.000 (CAC $536) y Meta con $4.000 (CAC $718), con las visitas de referidos primero', 'Largo plazo: videos y testimonios con el ahorro real de las familias (hoy no hay ninguno)'], ['Incierto / promete poco', 'Probar: la tarjeta de ahorro compartida; letreros en barrios (6 leads de 20 casas en 2 meses)', 'Descartar por ahora: pasar todo a Meta (Leadly): bajan las ventas de 22,3 a 17,5 al mes']],
    experimento: 'Si 25 de 50 familias reciben su ahorro del mes con el botón para compartir y las otras 25 no, entonces los leads referidos en 2 meses pasan de unos 0,3 (lo de hoy) a 7,5 en el grupo que lo recibe, y vigilamos que el cierre de las visitas referidas no baje del 45 % ni suban las familias que piden no recibir mensajes.',
    tablaTitulo: 'Una venta referida (regla de Andrés: máximo $300 con visitas)',
    tabla: [['Concepto', 'Cálculo', 'Por venta'], ['Visitas', '1 ÷ 45 % = 2,22 visitas × $60', '$133,33'], ['$10 en el plan por vecino que agenda', '1 ÷ (90 % × 45 %) = 2,47 agendas', '$24,69'], ['Limpieza de paneles gratis cuando el vecino firma', '$60', '$60,00'], ['$80 de descuento en el plan de mantenimiento al firmar', '$80', '$80,00'], ['Total', '', '$298,02 ≤ $300']],
    anchos: [5000, 3800, 2000],
    ia: ['En la revisión en el celular, el botón «Mapa de la demo» se partía en dos líneas y desordenaba la barra de arriba. La IA no lo había visto; lo encontramos con la captura y lo corregimos.', 'La IA quiso usar una tasa de «leads por tarjeta compartida» que el caso no da. La reemplazamos por la del letrero del caso (6 leads de 20 casas en 2 meses = 0,15 por familia al mes) y la marcamos como supuesto.'],
  },
};
(async () => {
  for (const [id, c] of Object.entries(FICHAS)) {
    const img = fs.readFileSync(path.join(OUT, `ciclo-${id}.png`));
    const izq = 4300, der = ANCHO - izq;
    const cab = new Table({ width: { size: ANCHO, type: WidthType.DXA }, columnWidths: [izq, der], rows: [new TableRow({ children: [
      new TableCell({ width: { size: izq, type: WidthType.DXA }, borders: sinBorde, verticalAlign: VerticalAlign.TOP, margins: { right: 120 }, children: [
        h('El ciclo', c.color), new Paragraph({ children: [new ImageRun({ type: 'png', data: img, transformation: { width: 300, height: 198 } })], spacing: { after: 0 } })] }),
      new TableCell({ width: { size: der, type: WidthType.DXA }, borders: sinBorde, margins: { left: 120 }, children: [
        h('El paso donde más gente se pierde', c.color), p(c.paso.map((x) => (typeof x === 'string' ? t(x) : x)), { after: 60 }),
        h('La meta en números', c.color), tabla(c.meta, [der - 240 - 2 * 1050, 1050, 1050], c.color, { derecha: true })] })] })] });
    const doc = new Document({
      styles: { default: { document: { run: { font: F, size: 19 } } } },
      numbering: { config: [{ reference: 'vinetas', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 280, hanging: 180 } } } }] }] },
      sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 640, bottom: 560, left: 720, right: 720 } } }, children: [
        p([t('Ficha de growth · ', { size: 26, bold: true, color: c.color }), t(c.titulo, { size: 26, bold: true })], { after: 20 }),
        p([t(`Sesión 2 · Reto 2 · Rossman Doan Rivera Cano · Business Solutions · Prof. Steven Ledezma · Prototipo: ${c.proto} (datos de demostración marcados «simulado»)`, { size: 14, color: '555A63' })], { after: 60 }),
        cab,
        h('Lo que esa meta le cambia al negocio', c.color), p(c.cambia),
        h('El número que el dueño mira cada semana', c.color), p(c.semana),
        h('Matriz de canales a 90 días', c.color), tabla(c.matriz, [1900, (ANCHO - 1900) / 2, (ANCHO - 1900) / 2], c.color, { sombra: (i, j) => j === 0 }),
        h('El experimento (prueba A/B)', c.color), p(c.experimento),
        h(c.tablaTitulo, c.color), tabla(c.tabla, c.anchos, c.color, { derecha: true, negritaUltima: true }),
        h('En qué se equivocó o nos confundió la IA', c.color),
        ...c.ia.map((x) => p(x, { bullet: true, after: 20 })),
        p([t('Ejemplo del equipo: ', { bold: true }), t('________________________________________________________________________________________')], { after: 0 }),
      ] }],
    });
    fs.writeFileSync(path.join(OUT, `Ficha_growth_${id}.docx`), await Packer.toBuffer(doc));
    console.log('ficha', id);
  }
})();
