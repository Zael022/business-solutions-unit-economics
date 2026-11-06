# -*- coding: utf-8 -*-
"""Caso C · Sol de Casa — calculadora (nivel 1) y simulador de caja (nivel 3)."""
from xl import *
from openpyxl.chart import Reference

wb = Workbook()
ws = wb.active; ws.title = 'Supuestos'
S = Hoja(ws); S.ancho(A=50, B=13, C=13, D=13, E=13, F=58)
S.titulo(1, 'Sol de Casa · Supuestos', 'Celdas amarillas con texto azul = datos editables. Todo lo demás se calcula solo. Cifras mensuales en dólares.')
def sref(k):
    a = S.ref[k]
    if '!' in a: return a
    if a.startswith('$'): return 'Supuestos!' + a
    return f"Supuestos!${a[0]}${a[1:]}"
r = 4
S.seccion(r, '1. Lo que deja cada instalación (sección 1)'); r += 1
for k, t, v, f, fu in [
    ('precio', 'Precio promedio de una instalación', 6500, USD, 'Sección 1'),
    ('equipos', 'Equipos (se pagan el mes de la firma)', 0.55, PCT, 'Sección 1'),
    ('instal', 'Instalación (se paga el mes siguiente)', 0.17, PCT, 'Sección 1'),
    ('com', 'Comisión de la asesora (mes de la firma)', 0.03, PCT, 'Va en la contribución, no en el CAC'),
    ('cobro1', 'Parte que paga el cliente al firmar', 0.50, PCT, 'El otro 50 % al mes siguiente'),
    ('bat_precio', 'Batería: precio al cliente', 3000, USD, 'Sección 4'),
    ('bat_mb', 'Batería: margen bruto', 0.20, PCT, 'Sección 4'),
    ('bat_pct', 'Batería: clientes que la agregan', 0.15, PCT, 'Prueba: 3 de 20 (muestra chica)'),
]:
    S.texto(r, 1, t); S.entrada(r, 2, v, f, k); S.texto(r, 6, fu, GRIS); r += 1
r += 1
S.seccion(r, '2. Visitas técnicas (sección 2)'); r += 1
for k, t, v, f, fu in [
    ('visita', 'Costo de cada visita hecha', 60, USD, 'Transporte, viáticos y bono'),
    ('cap', 'Capacidad de visitas al mes (2 técnicos)', 100, NUM, 'Sección 2'),
    ('tec_costo', 'Técnico extra: costo mensual', 1800, USD, 'Se paga desde que se contrata'),
    ('tec_cap', 'Técnico extra: visitas que suma', 50, NUM, 'Desde el mes siguiente a contratarlo'),
]:
    S.texto(r, 1, t); S.entrada(r, 2, v, f, k); S.texto(r, 6, fu, GRIS); r += 1
r += 1
S.seccion(r, '3. Embudo de cada canal según el CRM (sección 3)'); r += 1
S.encabezado(r, ['Tasa', 'Meta', 'Google', 'Meta mejorado', '', 'Fuente']); r += 1
for k, t, vm, vg, vx in [('contacto', 'Leads que se logra contactar', .55, .85, .80), ('agenda', 'Contactados que agendan visita', .30, .55, .40),
                          ('hecha', 'Visitas agendadas que se hacen', .70, .85, .75), ('cierre', 'Visitas que terminan en venta', .18, .30, .22)]:
    S.texto(r, 1, t); S.entrada(r, 2, vm, PCT, f'm_{k}'); S.entrada(r, 3, vg, PCT, f'g_{k}'); S.entrada(r, 4, vx, PCT, f'x_{k}')
    S.texto(r, 6, 'CRM · columna «Meta mejorado» = supuesto 7 (respuesta < 5 min y filtro)', GRIS); r += 1
S.texto(r, 1, 'Leads de Meta que se pierden con el filtro'); S.entrada(r, 4, 0.20, PCT, 'x_menos'); S.texto(r, 6, 'Supuesto 7: −20 % de leads, pero mejores', GRIS); r += 1
S.texto(r, 1, 'CPL de Meta según la agencia'); S.entrada(r, 2, 8, USD, 'cpl_ag'); S.texto(r, 6, 'Propuesta de Leadly', GRIS); r += 2
S.seccion(r, '4. Historial: leads según la inversión (sección 5)'); r += 1
S.encabezado(r, ['Inversión', 'Leads de Meta', 'Inversión', 'Leads de Google']); r += 1
h0 = r
for (x, y), (xg, yg) in zip([(0, 0), (2000, 280), (4000, 500), (6000, 680), (8000, 840), (10000, 960)],
                            [(0, 0), (2000, 55), (4000, 100), (6000, 135), (8000, 160), (None, None)]):
    S.entrada(r, 1, x, USD); S.entrada(r, 2, y, NUM)
    if xg is not None: S.entrada(r, 3, xg, USD); S.entrada(r, 4, yg, NUM)
    r += 1
S.ref['mx'] = f"Supuestos!$A${h0}:$A${h0 + 5}"; S.ref['my'] = f"Supuestos!$B${h0}:$B${h0 + 5}"
S.ref['gx'] = f"Supuestos!$C${h0}:$C${h0 + 4}"; S.ref['gy'] = f"Supuestos!$D${h0}:$D${h0 + 4}"
S.texto(r, 1, 'Google no pasa de 160 leads: arriba de $8.000 no hay más búsquedas. Punto ($0, 0) agregado; interpolación lineal (supuesto 5).', GRIS); r += 2
S.seccion(r, '5. Datos de caja (sección 7, nivel 3)'); r += 1
for k, t, v, f, fu in [
    ('caja0', 'Plata en el banco hoy', 12000, USD, 'Sección 7'), ('piso', 'Piso de seguridad', 5000, USD, 'Sofía'),
    ('fijos', 'Costos fijos mensuales', 18000, USD, 'Sueldos base, oficina, camioneta, CRM'),
    ('ventas0', 'Ventas del mes 0 (septiembre)', 22, NUM, 'Se instalan y cobran su segunda mitad en el mes 1'),
]:
    S.texto(r, 1, t); S.entrada(r, 2, v, f, k); S.texto(r, 6, fu, GRIS); r += 1
r += 1
S.seccion(r, '6. Palancas de cada escenario (nivel 1)'); r += 1
S.encabezado(r, ['Palanca', 'Hoy', 'Agencia (historial)', 'Agencia (como la cuenta)', 'Propuesta', 'Explicación']); r += 1
NE = 4
for k, t, vals, f, ex in [
    ('meta', 'Inversión en Meta', (4000, 8000, 8000, 4000), USD, ''),
    ('goo', 'Inversión en Google', (4000, 0, 0, 4000), USD, ''),
    ('leads_fijo', 'Leads de Meta (vacío = historial)', (None, None, 1000, None), NUM, 'La agencia supone $8.000 ÷ $8 = 1.000 (supuesto 6)'),
    ('mejora', 'Respuesta en < 5 min y filtro (1 = sí)', (0, 0, 0, 1), NUM, 'Supuesto 7, sacado de casos parecidos'),
    ('tec', 'Técnicos extra', (0, 0, 0, 1), NUM, 'Cada uno suma 50 visitas (en régimen)'),
    ('bat', 'Clientes que agregan la batería', (0, 0, 0, 0), PCT, 'Opcional: 15 % según la prueba de 3 de 20'),
]:
    S.texto(r, 1, t)
    for j, v in enumerate(vals): S.entrada(r, 2 + j, v, f, f"{k}{j}")
    S.texto(r, 6, ex, GRIS); r += 1
S.texto(r + 1, 1, 'Supuestos permitidos usados: 1 (LTV = una venta), 2 (todo el embudo en el mismo mes), 3 (tasas fijas), 4 (si no caben, primero Google), 5 (interpolación), 6 (CPL de la agencia), 7 (respuesta y filtro).', GRIS)
P = lambda k, j: f"Supuestos!${S.ref[f'{k}{j}'][0]}${S.ref[f'{k}{j}'][1:]}"

# ------------------------------------------------------------------ RESULTADOS
wr = wb.create_sheet('Resultados'); R = Hoja(wr); R.ancho(A=50, B=14, C=15, D=16, E=14, F=58)
R.titulo(1, 'Sol de Casa · Resultados (se calculan solos)', 'Cambiá cualquier celda amarilla de Supuestos y todo se actualiza.')
R.encabezado(3, ['Métrica', 'Hoy', 'Agencia (historial)', 'Agencia (como la cuenta)', 'Propuesta', 'Cómo se calcula'])
row = 4; RES = {}
def fila(nombre, fn, fmt, como, clave, negrita=False):
    global row
    R.texto(row, 1, nombre, NEG if negrita else NORMAL)
    for j in range(NE): R.formula(row, 2 + j, '=' + fn(j), fmt, None, negrita)
    R.texto(row, 6, como, GRIS); RES[clave] = row; row += 1
def c(k, j): return f"{L(2 + j)}{RES[k]}"
def sec(t):
    global row
    row += 1; R.seccion(row, t); row += 1
pr = sref('precio')
def tm(k, j): return f"IF({P('mejora',j)}=1,{sref('x_' + k)},{sref('m_' + k)})"

sec('1. ¿Cuánto deja una venta?')
fila('Contribución de una instalación (antes de marketing)', lambda j: f"{pr}*(1-{sref('equipos')}-{sref('instal')})-{sref('com')}*{pr}", USD, '$6.500 × 28 % − 3 % de comisión', 'con0', True)
fila('Contribución extra por la batería (promedio por venta)', lambda j: f"{P('bat',j)}*({sref('bat_precio')}*{sref('bat_mb')}-{sref('com')}*{sref('bat_precio')})", USD, '% que la agrega × ($3.000 × 20 % − 3 %)', 'conb')
fila('Contribución por venta del escenario', lambda j: f"{c('con0',j)}+{c('conb',j)}", USD, '', 'con', True)
sec('2. Embudo de Meta')
fila('Leads de Meta', lambda j: f"IF(ISNUMBER({P('leads_fijo',j)}),{P('leads_fijo',j)},{interp_formula(P('meta',j), S.ref['mx'], S.ref['my'])}*(1-{P('mejora',j)}*{sref('x_menos')}))", NUM1, 'Historial (o el supuesto de la agencia); −20 % con filtro', 'ml', True)
fila('Contactados', lambda j: f"{c('ml',j)}*{tm('contacto',j)}", NUM1, '', 'mc')
fila('Agendan visita', lambda j: f"{c('mc',j)}*{tm('agenda',j)}", NUM1, '', 'ma')
fila('Visitas pedidas (el cliente está en la casa)', lambda j: f"{c('ma',j)}*{tm('hecha',j)}", NUM1, '', 'mvp')
sec('3. Embudo de Google')
fila('Leads de Google', lambda j: interp_formula(P('goo', j), S.ref['gx'], S.ref['gy']), NUM1, 'Historial; tope de 160', 'gl', True)
fila('Contactados', lambda j: f"{c('gl',j)}*{sref('g_contacto')}", NUM1, '', 'gc')
fila('Agendan visita', lambda j: f"{c('gc',j)}*{sref('g_agenda')}", NUM1, '', 'ga')
fila('Visitas pedidas', lambda j: f"{c('ga',j)}*{sref('g_hecha')}", NUM1, '', 'gvp')
sec('4. Capacidad de visitas (primero Google, supuesto 4)')
fila('Capacidad de visitas', lambda j: f"{sref('cap')}+{P('tec',j)}*{sref('tec_cap')}", NUM, '100 + 50 por técnico extra', 'cap')
fila('Visitas pedidas en total', lambda j: f"{c('mvp',j)}+{c('gvp',j)}", NUM1, '', 'vp', True)
fila('Visitas hechas de Google', lambda j: f"MIN({c('gvp',j)},{c('cap',j)})", NUM1, '', 'gvh')
fila('Visitas hechas de Meta', lambda j: f"MIN({c('mvp',j)},{c('cap',j)}-{c('gvh',j)})", NUM1, '', 'mvh')
fila('Uso de la capacidad', lambda j: f"({c('gvh',j)}+{c('mvh',j)})/{c('cap',j)}", PCT, '', 'uso')
fila('Visitas que se pierden por falta de capacidad', lambda j: f"{c('vp',j)}-{c('gvh',j)}-{c('mvh',j)}", NUM1, '', 'perd', True)
fila('Alerta de capacidad', lambda j: f"IF({c('vp',j)}>{c('cap',j)},\"SE PASA DE LA CAPACIDAD\",\"OK\")", None, '', 'alerta')
sec('5. Ventas y CAC por canal')
fila('Ventas de Meta', lambda j: f"{c('mvh',j)}*{tm('cierre',j)}", NUM1, '', 'mv', True)
fila('Ventas de Google', lambda j: f"{c('gvh',j)}*{sref('g_cierre')}", NUM1, '', 'gv', True)
fila('Ventas totales', lambda j: f"{c('mv',j)}+{c('gv',j)}", NUM1, 'Hoy ≈ 22, como septiembre', 'v', True)
fila('Meta · CPL', lambda j: f"IF({c('ml',j)}=0,\"—\",{P('meta',j)}/{c('ml',j)})", USD2, 'Inversión ÷ leads', 'mcpl')
fila('Google · CPL', lambda j: f"IF({c('gl',j)}=0,\"—\",{P('goo',j)}/{c('gl',j)})", USD2, '', 'gcpl')
fila('Meta · CAC de anuncios', lambda j: f"IF({c('mv',j)}=0,\"—\",{P('meta',j)}/{c('mv',j)})", USD, 'Inversión ÷ ventas', 'mcac')
fila('Google · CAC de anuncios', lambda j: f"IF({c('gv',j)}=0,\"—\",{P('goo',j)}/{c('gv',j)})", USD, '', 'gcac')
fila('Meta · CAC real', lambda j: f"IF({c('mv',j)}=0,\"—\",({P('meta',j)}+{c('mvh',j)}*{sref('visita')})/{c('mv',j)})", USD, '(Inversión + visitas × $60) ÷ ventas', 'mcr', True)
fila('Google · CAC real', lambda j: f"IF({c('gv',j)}=0,\"—\",({P('goo',j)}+{c('gvh',j)}*{sref('visita')})/{c('gv',j)})", USD, '', 'gcr', True)
fila('CAC real total', lambda j: f"({P('meta',j)}+{P('goo',j)}+({c('mvh',j)}+{c('gvh',j)})*{sref('visita')})/{c('v',j)}", USD, '', 'tcr', True)
fila('LA TRAMPA: el lead de Meta es N veces más barato…', lambda j: f"IF(OR({c('ml',j)}=0,{c('gl',j)}=0),\"—\",{c('gcpl',j)}/{c('mcpl',j)})", X2, 'CPL Google ÷ CPL Meta', 'trap1')
fila('…pero el cliente de Meta cuesta este % más', lambda j: f"IF(OR({c('mv',j)}=0,{c('gv',j)}=0),\"—\",{c('mcr',j)}/{c('gcr',j)}-1)", PCT, 'CAC real Meta ÷ CAC real Google − 1', 'trap2', True)
sec('6. ¿Los dos canales dejan plata?')
fila('Meta · LTV:CAC', lambda j: f"IF({c('mv',j)}=0,\"—\",{c('con',j)}/{c('mcr',j)})", X2, 'Contribución de una venta ÷ CAC real', 'mlc', True)
fila('Google · LTV:CAC', lambda j: f"IF({c('gv',j)}=0,\"—\",{c('con',j)}/{c('gcr',j)})", X2, '', 'glc', True)
fila('Semáforo Meta', lambda j: f"IF({c('mv',j)}=0,\"—\",IF({c('mlc',j)}<1,\"ROJO\",IF({c('mlc',j)}<3,\"AMARILLO\",\"VERDE\")))", None, 'Rojo < 1 · amarillo 1 a 3 · verde ≥ 3', 'msem')
fila('Semáforo Google', lambda j: f"IF({c('gv',j)}=0,\"—\",IF({c('glc',j)}<1,\"ROJO\",IF({c('glc',j)}<3,\"AMARILLO\",\"VERDE\")))", None, '', 'gsem')
fila('Meta · visitas por venta', lambda j: f"1/{tm('cierre',j)}", NUM2, '1 ÷ % de cierre', 'mvpv')
fila('Google · visitas por venta', lambda j: f"1/{sref('g_cierre')}", NUM2, '', 'gvpv')
fila('Meta · valor de una visita', lambda j: f"{tm('cierre',j)}*{c('con',j)}-{sref('visita')}", USD2, '% cierre × contribución − $60', 'mvv', True)
fila('Google · valor de una visita', lambda j: f"{sref('g_cierre')}*{c('con',j)}-{sref('visita')}", USD2, 'Con la capacidad llena, cada visita va a Google primero', 'gvv', True)
sec('7. Caja de un cliente (los equipos se pagan el día de la firma)')
fila('Caja acumulada del cliente en el mes 1 (mes de la firma, con CAC real total)', lambda j: f"-{c('tcr',j)}+{sref('cobro1')}*{pr}-{sref('equipos')}*{pr}-{sref('com')}*{pr}", USD, '−CAC + 50 % − 55 % − 3 %', 'cj0', True)
fila('Caja acumulada del cliente en el mes 2 (instalación)', lambda j: f"{c('cj0',j)}+(1-{sref('cobro1')})*{pr}-{sref('instal')}*{pr}", USD, '+ 50 % − 17 %', 'cj1', True)
fila('Mes en que se recupera el cliente (payback en caja)', lambda j: f"IF({c('cj0',j)}>=0,1,IF({c('cj1',j)}>=0,2,\"Después del mes 2\"))", NUM, 'Mes 1 = mes de la firma (misma convención que los otros casos)', 'pb', True)
fila('Caja que hay que poner por cada venta el mes de la firma', lambda j: f"-{c('cj0',j)}", USD, 'Por eso la caja aprieta aunque el negocio deje plata', 'hueco')
sec('8. Resultado del mes')
fila('Contribución del mes después de marketing, visitas y técnicos', lambda j: f"{c('v',j)}*{c('con',j)}-{P('meta',j)}-{P('goo',j)}-({c('mvh',j)}+{c('gvh',j)})*{sref('visita')}-{P('tec',j)}*{sref('tec_costo')}", USD, 'Para comparar escenarios (antes de costos fijos)', 'net', True)
fila('Ventas frente a hoy', lambda j: f"{c('v',j)}-{c('v',0)}", NUM1, '', 'dv', True)
wr.freeze_panes = 'B4'

# ------------------------------------------------------------------ EMBUDO (gráfico)
we = wb.create_sheet('Embudo'); E = Hoja(we); E.ancho(A=26, B=12, C=12, D=12)
E.titulo(1, 'Embudo de cada canal (escenario de hoy) y capacidad', 'Dónde se cae la gente: en Meta, el 45 % de los leads ni contesta.')
E.encabezado(3, ['Paso', 'Meta', 'Google', 'Capacidad de visitas'])
for i, (n, km, kg) in enumerate([('Leads', 'ml', 'gl'), ('Contactados', 'mc', 'gc'), ('Agendan visita', 'ma', 'ga'), ('Visitas hechas', 'mvh', 'gvh'), ('Ventas', 'mv', 'gv')]):
    rr = 4 + i; E.texto(rr, 1, n)
    E.formula(rr, 2, f"=Resultados!B{RES[km]}", NUM1); E.formula(rr, 3, f"=Resultados!B{RES[kg]}", NUM1)
    E.formula(rr, 4, f"=Resultados!B{RES['cap']}", NUM)
E.texto(10, 1, 'Pérdida en cada paso', SUB)
E.encabezado(11, ['Paso', 'Meta', 'Google'])
for i, n in enumerate(['Leads → contactados', 'Contactados → agendan', 'Agendan → visita hecha', 'Visita → venta']):
    rr = 12 + i; E.texto(rr, 1, n)
    E.formula(rr, 2, f"=1-B{5 + i}/B{4 + i}", PCT); E.formula(rr, 3, f"=1-C{5 + i}/C{4 + i}", PCT)
bc = BarChart(); bc.type = 'col'; bc.title = 'Embudo por canal (hoy) con la capacidad de 100 visitas'; bc.height = 9; bc.width = 18
bc.add_data(Reference(we, min_col=2, max_col=3, min_row=3, max_row=8), titles_from_data=True)
bc.set_categories(Reference(we, min_col=1, min_row=4, max_row=8)); bc.y_axis.title = 'Personas'
lc = LineChart(); lc.add_data(Reference(we, min_col=4, min_row=3, max_row=8), titles_from_data=True)
bc.x_axis.delete = False; bc.y_axis.delete = False
bc += lc
we.add_chart(bc, 'F3')

# ------------------------------------------------------------------ SIMULADOR
PLANES = [
    ('Plan 1', 'Actual: $4.000 Meta + $4.000 Google, sin técnicos', [4000] * 24, [4000] * 24, [0] * 24, None),
    ('Plan 2', 'Agencia: $8.000 Meta + $0 Google', [8000] * 24, [0] * 24, [0] * 24, None),
    ('Plan 3', 'Propio: $6.000 Meta + $8.000 Google y 1 técnico desde el mes 2', [6000] * 24, [8000] * 24, [0] + [1] * 23, None),
    ('Plan 4', 'Propio: respuesta y filtro desde el mes 1, $7.000 Meta + $6.000 Google, técnicos en los meses 2 y 3', [7000] * 24, [6000] * 24, [0, 1] + [2] * 22, 1),
    ('Plan 5', 'Propio (mejor encontrado): respuesta y filtro desde el mes 1, Meta $4.000 los meses 1-2 y $7.000 desde el mes 3, Google $6.000, técnicos en los meses 1 y 2', [4000] * 2 + [7000] * 22, [6000] * 24, [1] + [2] * 23, 1),
]
con0 = f"Resultados!B{RES['con0']}"
SIMS = []
for nombre, desc, meta, goo, tec, mj in PLANES:
    w = wb.create_sheet(nombre); H = Hoja(w)
    H.ancho(A=6, B=11, C=11, D=10, E=10, F=10, G=10, H=11, I=11, J=11, K=10, L=10, M=10, N=10, O=13, P=13, Q=13, R=14)
    H.titulo(1, f'Simulador de caja · {nombre}: {desc}', 'Editá las columnas B a E (inversión por canal, técnicos extra contratados hasta ese mes, y 1 si ya se aplica la respuesta rápida con filtro).')
    H.encabezado(5, ['Mes', 'Inversión Meta', 'Inversión Google', 'Técnicos extra', 'Respuesta y filtro', 'Leads Meta', 'Leads Google',
                     'Visitas pedidas Meta', 'Visitas pedidas Google', 'Visitas pedidas total', 'Capacidad', 'Hechas Google', 'Hechas Meta',
                     'Ventas', 'Entradas', 'Salidas', 'Caja final', 'Alerta'])
    for t in range(1, 25):
        rr = 5 + t
        H.texto(rr, 1, t)
        H.entrada(rr, 2, meta[t - 1], USD); H.entrada(rr, 3, goo[t - 1], USD); H.entrada(rr, 4, tec[t - 1], NUM)
        H.entrada(rr, 5, 1 if (mj and t >= mj) else 0, NUM)
        H.formula(rr, 6, '=' + interp_formula(f"B{rr}", S.ref['mx'], S.ref['my']) + f"*(1-E{rr}*{sref('x_menos')})", NUM1)
        H.formula(rr, 7, '=' + interp_formula(f"C{rr}", S.ref['gx'], S.ref['gy']), NUM1)
        tmm = lambda k: f"IF(E{rr}=1,{sref('x_' + k)},{sref('m_' + k)})"
        H.formula(rr, 8, f"=F{rr}*{tmm('contacto')}*{tmm('agenda')}*{tmm('hecha')}", NUM1)
        H.formula(rr, 9, f"=G{rr}*{sref('g_contacto')}*{sref('g_agenda')}*{sref('g_hecha')}", NUM1)
        H.formula(rr, 10, f"=H{rr}+I{rr}", NUM1)
        H.formula(rr, 11, f"={sref('cap')}+{sref('tec_cap')}*{'0' if t == 1 else f'D{rr - 1}'}", NUM)
        H.formula(rr, 12, f"=MIN(I{rr},K{rr})", NUM1)
        H.formula(rr, 13, f"=MIN(H{rr},K{rr}-L{rr})", NUM1)
        H.formula(rr, 14, f"=M{rr}*{tmm('cierre')}+L{rr}*{sref('g_cierre')}", NUM1, None, True)
        prev = sref('ventas0') if t == 1 else f"N{rr - 1}"
        H.formula(rr, 15, f"={sref('cobro1')}*{pr}*N{rr}+(1-{sref('cobro1')})*{pr}*{prev}", USD)
        H.formula(rr, 16, f"=({sref('equipos')}+{sref('com')})*{pr}*N{rr}+{sref('instal')}*{pr}*{prev}+{sref('visita')}*(L{rr}+M{rr})+B{rr}+C{rr}+{sref('fijos')}+{sref('tec_costo')}*D{rr}", USD)
        H.formula(rr, 17, f"={sref('caja0') if t == 1 else f'Q{rr - 1}'}+O{rr}-P{rr}", USD, None, True)
        H.formula(rr, 18, f"=IF(Q{rr}<{sref('piso')},\"BAJO EL PISO\",IF(J{rr}>K{rr},\"Sin capacidad\",\"\"))")
    w.conditional_formatting.add('Q6:Q29', CellIsRule(operator='lessThan', formula=[sref('piso')], fill=F_ALERTA))
    H.texto(31, 1, 'Resumen', SUB)
    H.texto(32, 1, 'Caja mínima'); H.formula(32, 6, '=MIN(Q6:Q29)', USD, None, True)
    H.texto(33, 1, 'Mes de la caja mínima'); H.formula(33, 6, '=MATCH(MIN(Q6:Q29),Q6:Q29,0)', NUM)
    H.texto(34, 1, 'Caja del mes 24'); H.formula(34, 6, '=Q29', USD, None, True)
    H.texto(35, 1, 'Instalaciones totales (24 meses)'); H.formula(35, 6, '=SUM(N6:N29)', NUM1)
    H.texto(36, 1, '¿Desde el mes 19 la inversión total nunca baja?'); H.formula(36, 6, '=IF(SUMPRODUCT(--((B24:B29+C24:C29)<(B23:B28+C23:C28)))=0,"Sí","No")')
    H.texto(37, 1, '¿Cumple todas las reglas?'); H.formula(37, 6, f'=IF(AND(F32>={sref("piso")},F36="Sí",MIN(B6:C29)>=0,MAX(B6:B29)<=10000,MAX(C6:C29)<=8000,MIN(D6:D29)>=0,MAX(D6:D29)<=2),"Sí","No")', None, None, True)
    H.texto(38, 1, 'Reglas revisadas: caja ≥ piso, Meta de $0 a $10.000, Google de $0 a $8.000, máximo 2 técnicos extra y, desde el mes 19, inversión total que no baja.')
    w.freeze_panes = 'B6'
    SIMS.append((nombre, desc))

wp = wb.create_sheet('Planes'); Pp = Hoja(wp); Pp.ancho(A=10, B=66, C=13, D=8, E=13, F=13, G=10)
Pp.titulo(1, 'Comparación de planes (nivel 3)', 'Gana el plan con más caja en el mes 24 sin bajar del piso; si empatan, el de más instalaciones.')
Pp.encabezado(3, ['Plan', 'Descripción', 'Caja mínima', 'Mes', 'Caja mes 24', 'Instalaciones', '¿Cumple?'])
for i, (n, d) in enumerate(SIMS):
    rr = 4 + i; q = f"'{n}'"
    Pp.texto(rr, 1, n, NEG); Pp.texto(rr, 2, d)
    for col, ref, fmt in [(3, 'F32', USD), (4, 'F33', NUM), (5, 'F34', USD), (6, 'F35', NUM1), (7, 'F37', None)]:
        Pp.formula(rr, col, f"={q}!{ref}", fmt, None, col in (5, 7))
Pp.texto(10, 1, 'Caja, visitas pedidas y capacidad mes a mes', SUB)
hdr = ['Mes'] + [f'Caja {n}' for n, _ in SIMS] + ['Piso'] + [f'Pedidas {n}' for n, _ in SIMS] + [f'Capacidad {n}' for n, _ in SIMS]
Pp.encabezado(11, hdr)
for t in range(1, 25):
    rr = 11 + t; Pp.texto(rr, 1, t)
    for i, (n, _) in enumerate(SIMS):
        Pp.formula(rr, 2 + i, f"='{n}'!Q{5 + t}", USD)
        Pp.formula(rr, 3 + len(SIMS) + i, f"='{n}'!J{5 + t}", NUM1)
        Pp.formula(rr, 3 + 2 * len(SIMS) + i, f"='{n}'!K{5 + t}", NUM)
    Pp.formula(rr, 2 + len(SIMS), f"={sref('piso')}", USD)
n = len(SIMS)
for (cols, tit, yt, anc) in [(list(range(2, 3 + n)), 'Caja mes a mes con el piso de $5.000', 'Caja ($)', 'I3'),
                              ([3 + n + 4, 3 + 2 * n + 4, 3 + n, 3 + 2 * n], 'Visitas pedidas frente a la capacidad (planes 1 y 5)', 'Visitas', 'I22')]:
    ch = LineChart(); ch.title = tit; ch.height = 9; ch.width = 20
    for k in cols:
        ch.series.append(Series(Reference(wp, min_col=k, min_row=12, max_row=35), title=wp.cell(11, k).value))
    ch.set_categories(Reference(wp, min_col=1, min_row=12, max_row=35)); ch.x_axis.title = 'Mes'; ch.y_axis.title = yt
    ch.x_axis.delete = False; ch.y_axis.delete = False
    wp.add_chart(ch, anc)
wb._sheets = [wb[n_] for n_ in ['Supuestos', 'Resultados', 'Embudo', 'Planes'] + [m for m, _ in SIMS]]
wb.save('Caso_C_Sol_de_Casa.xlsx'); print('ok')
