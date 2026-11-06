# -*- coding: utf-8 -*-
"""Caso B · Agendo — calculadora (nivel 1) y simulador de caja (nivel 3)."""
from xl import *
from openpyxl.chart import Reference

wb = Workbook()
ws = wb.active; ws.title = 'Supuestos'
S = Hoja(ws); S.ancho(A=50, B=14, C=14, D=14, E=14, F=56)
S.titulo(1, 'Agendo · Supuestos', 'Celdas amarillas con texto azul = datos editables. Todo lo demás se calcula solo. Cifras mensuales en dólares.')
def sref(k):
    a = S.ref[k]
    if '!' in a: return a
    if a.startswith('$'): return 'Supuestos!' + a
    return f"Supuestos!${a[0]}${a[1:]}"
r = 4
S.seccion(r, '1. Precios, margen y permanencia (secciones 1, 2 y 4)'); r += 1
for k, t, v, f, fu in [
    ('precio', 'Precio del plan mensual', 25, USD2, 'Sección 1 · lo elige el 90 %'),
    ('anual_p', 'Precio del plan anual (por adelantado)', 240, USD, 'Sección 1 · equivale a $20 al mes'),
    ('mb', 'Margen bruto', 0.78, PCT, 'Sección 2 · WhatsApp, servidores, pagos y soporte'),
    ('churn', 'Cancelación mensual del plan mensual', 0.06, PCT, 'Sección 4'),
    ('renov', 'Renovación del plan anual al cumplir el año', 0.70, PCT, 'Sección 4'),
    ('horiz', 'Horizonte del LTV (meses)', 24, NUM, 'Sección 4 · tope máximo'),
]:
    S.texto(r, 1, t); S.entrada(r, 2, v, f, k); S.texto(r, 6, fu, GRIS); r += 1
r += 1
S.seccion(r, '2. Embudo y costos de adquisición (sección 3)'); r += 1
for k, t, v, f, fu in [
    ('conv', 'Trials que pasan a pagar', 0.14, PCT, 'CRM · supuesto 3: no cambia con la inversión (optimista)'),
    ('sueldo', 'Sueldo de una vendedora', 1200, USD, 'CRM · solo llama a trials de anuncios'),
    ('cap', 'Trials que atiende una vendedora al mes', 500, NUM, 'CRM · Mariela está al 100 %'),
    ('com', 'Comisión por cliente de anuncios que cierra', 20, USD, 'CRM'),
    ('org', 'Clientes nuevos orgánicos al mes', 50, NUM, 'CRM · supuesto 5: llegan igual'),
    ('cpr', 'Costo por registro que reporta el freelancer', 20, USD2, 'Panel de anuncios ($10.000 ÷ 500 trials)'),
    ('lamina_cac', 'CAC de la lámina de Valeria', 105, USD, 'Reporte trimestral'),
    ('lamina_lc', 'LTV:CAC de la lámina de Valeria', 2.4, NUM2, 'Reporte trimestral'),
]:
    S.texto(r, 1, t); S.entrada(r, 2, v, f, k); S.texto(r, 6, fu, GRIS); r += 1
r += 1
S.seccion(r, '3. Historial: trials por anuncios según la inversión (sección 5)'); r += 1
S.encabezado(r, ['Inversión total en anuncios', 'Trials por anuncios']); r += 1
h0 = r
for x, y in [(0, 0), (5000, 290), (10000, 500), (15000, 650), (20000, 760), (30000, 900)]:
    S.entrada(r, 1, x, USD); S.entrada(r, 2, y, NUM); r += 1
S.ref['hx'] = f"Supuestos!$A${h0}:$A${r - 1}"; S.ref['hy'] = f"Supuestos!$B${h0}:$B${r - 1}"
S.texto(r, 1, 'Punto ($0, 0) agregado por la regla del nivel 3. Entre puntos: interpolación lineal (supuesto 4).', GRIS); r += 2
S.seccion(r, '4. Datos de caja (sección 7, nivel 3)'); r += 1
for k, t, v, f, fu in [
    ('caja0', 'Plata en el banco hoy', 60000, USD, 'Sección 7'),
    ('piso', 'Piso de seguridad', 10000, USD, 'Ricardo'),
    ('fijos', 'Costos fijos mensuales', 14000, USD, 'Sin Mariela ni soporte'),
    ('activos0', 'Clientes que pagan hoy (mes 0)', 1150, NUM, 'Sección 7'),
]:
    S.texto(r, 1, t); S.entrada(r, 2, v, f, k); S.texto(r, 6, fu, GRIS); r += 1
r += 1
S.seccion(r, '5. Palancas de cada escenario (nivel 1)'); r += 1
S.encabezado(r, ['Palanca', 'Hoy', 'Valeria (historial)', 'Valeria (como ella lo ve)', 'Propuesta', 'Explicación']); r += 1
NE = 4
for k, t, vals, f, ex in [
    ('inv', 'Inversión en anuncios al mes', (10000, 30000, 30000, 10000), USD, 'Propuesta: no triplicar todavía'),
    ('trials_fijo', 'Trials (vacío = sale del historial)', (None, None, 1500, None), NUM, 'Valeria supone 3 × 500 = 1.500 (supuesto 6)'),
    ('conv', 'Trials que pasan a pagar', (0.14, 0.14, 0.14, 0.14), PCT, ''),
    ('precio', 'Precio mensual', (25, 25, 25, 29), USD2, 'SUPUESTO PROPIO: subir a $29 (CitaYa cobra $35, NPS 61) sin que cambie la cancelación'),
    ('anual', 'Clientes nuevos que eligen el plan anual', (0, 0, 0, 0.40), PCT, 'SUPUESTO PROPIO: ofrecerlo en el trial lleva al 40 %. Base: supuesto 1 (todos mensuales)'),
    ('churn', 'Cancelación mensual', (0.06, 0.06, 0.06, 0.06), PCT, ''),
]:
    S.texto(r, 1, t)
    for j, v in enumerate(vals):
        S.entrada(r, 2 + j, v, f, f"{k}{j}")
    S.texto(r, 6, ex, GRIS); r += 1
S.texto(r + 1, 1, 'Supuestos permitidos usados: 1 (base todo mensual), 2 (paga el primer mes al llegar), 3 (conversión fija: optimista), 4 (interpolación), 5 (orgánicos fijos), 6 (versión de Valeria con CAC constante, comparada con el historial).', GRIS)
P = lambda k, j: f"Supuestos!${S.ref[f'{k}{j}'][0]}${S.ref[f'{k}{j}'][1:]}"

# ------------------------------------------------------------------ RESULTADOS
wr = wb.create_sheet('Resultados'); R = Hoja(wr); R.ancho(A=50, B=14, C=15, D=16, E=14, F=58)
R.titulo(1, 'Agendo · Resultados (se calculan solos)', 'Cambiá cualquier celda amarilla de Supuestos y todo se actualiza.')
R.encabezado(3, ['Métrica', 'Hoy ($10.000)', 'Valeria ($30.000, historial)', 'Valeria (CAC constante)', 'Propuesta', 'Cómo se calcula'])
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

sec('1. Margen de un cliente')
fila('Margen mensual de un cliente (plan mensual)', lambda j: f"{P('precio',j)}*{sref('mb')}", USD2, 'Precio × 78 %', 'm', True)
fila('Margen del plan anual (por adelantado)', lambda j: f"{sref('anual_p')}*{sref('mb')}", USD2, '$240 × 78 %, entra el primer mes', 'ma')
sec('2. ¿Cuánto cuesta un cliente de anuncios?')
fila('Inversión en anuncios', lambda j: P('inv', j), USD, 'Palanca', 'inv')
fila('Trials por anuncios', lambda j: f"IF(ISNUMBER({P('trials_fijo',j)}),{P('trials_fijo',j)},{interp_formula(c('inv',j), S.ref['hx'], S.ref['hy'])})", NUM1, 'Historial con interpolación lineal', 'tr', True)
fila('Costo por registro (lo que reporta el freelancer)', lambda j: f"{c('inv',j)}/{c('tr',j)}", USD2, 'Inversión ÷ trials. Es el costo de una prueba gratis, no de un cliente', 'cpr')
fila('Vendedoras necesarias', lambda j: f"IF({c('tr',j)}=0,0,ROUNDUP({c('tr',j)}/{sref('cap')},0))", NUM, 'Trials ÷ 500, hacia arriba (costo que sube a saltos)', 'vend', True)
fila('Clientes nuevos de anuncios', lambda j: f"{c('tr',j)}*{P('conv',j)}", NUM1, 'Trials × 14 %', 'cli', True)
fila('Costo total de adquisición', lambda j: f"{c('inv',j)}+{c('vend',j)}*{sref('sueldo')}+{c('cli',j)}*{sref('com')}", USD, 'Anuncios + vendedoras + comisiones', 'costo')
fila('CAC paid (solo clientes de anuncios)', lambda j: f"{c('costo',j)}/{c('cli',j)}", USD2, 'Costo ÷ clientes de anuncios', 'cacp', True)
fila('CAC blended (mezcla con orgánicos)', lambda j: f"{c('costo',j)}/({c('cli',j)}+{sref('org')})", USD2, 'Costo ÷ (anuncios + 50 orgánicos que no costaron nada)', 'cacb', True)
fila('Cuántas veces el CAC paid es el costo por registro', lambda j: f"{c('cacp',j)}/{c('cpr',j)}", X2, 'De $20 por registro a $180 por cliente', 'veces')
sec('3. ¿Cuánto vale un cliente?')
fila('LTV a 24 meses del cliente mensual', lambda j: f"{c('m',j)}*(1-(1-{P('churn',j)})^{sref('horiz')})/{P('churn',j)}", USD2, 'Suma mes a mes: m × (1 + 0,94 + … + 0,94²³)', 'ltvm', True)
fila('LTV sin tope de meses (solo para comparar)', lambda j: f"{c('m',j)}/{P('churn',j)}", USD2, 'm ÷ cancelación: supone que el cliente se queda para siempre', 'ltvs')
fila('LTV a 24 meses del cliente anual', lambda j: f"{c('ma',j)}*(1+{sref('renov')})", USD2, 'Año 1 + 70 % que renueva el año 2', 'ltva')
fila('LTV promedio del escenario', lambda j: f"(1-{P('anual',j)})*{c('ltvm',j)}+{P('anual',j)}*{c('ltva',j)}", USD2, 'Mezcla mensual / anual', 'ltv', True)
sec('4. La trampa: ¿de dónde sale el 2,4?')
fila('LTV:CAC de la lámina de Valeria', lambda j: sref('lamina_lc'), NUM2, 'Dato del reporte', 'llam')
fila('LTV:CAC blended', lambda j: f"{c('ltv',j)}/{c('cacb',j)}", X2, 'Así sale el 2,4: divide entre clientes que no costaron nada', 'lcb', True)
fila('LTV:CAC paid (el que sirve para decidir sobre anuncios)', lambda j: f"{c('ltv',j)}/{c('cacp',j)}", X2, 'Solo clientes de anuncios', 'lcp', True)
fila('Semáforo LTV:CAC paid', lambda j: f"IF({c('lcp',j)}<1,\"ROJO: pierde plata\",IF({c('lcp',j)}<3,\"AMARILLO: deja poco\",\"VERDE: sano\"))", None, 'Rojo < 1 · amarillo 1 a 3 · verde ≥ 3', 'sem')
fila('Payback del cliente del escenario (meses)', lambda j: f"IF(COUNTIF(Curva!{L(2 + j)}4:{L(2 + j)}28,\"<0\")>24,\"No recupera en 24 meses\",COUNTIF(Curva!{L(2 + j)}4:{L(2 + j)}28,\"<0\"))", NUM, 'Meses que tarda la curva de caja en cruzar el cero', 'pb', True)
fila('¿El primer mes paga el CAC?', lambda j: f"IF((1-{P('anual',j)})*{c('m',j)}+{P('anual',j)}*{c('ma',j)}>={c('cacp',j)},\"Sí\",\"No\")", None, 'Con plan anual, el cliente paga 12 meses el primer día', 'pm')
sec('5. ¿Qué pasa si triplican?')
fila('Clientes extra frente a hoy', lambda j: f"{c('cli',j)}-{c('cli',0)}", NUM1, '', 'extra')
fila('CAC marginal frente a hoy', lambda j: f"IF({c('extra',j)}=0,\"—\",({c('costo',j)}-{c('costo',0)})/{c('extra',j)})", USD2, 'Costo extra ÷ clientes extra', 'mg', True)
fila('Costo extra al mes frente a hoy', lambda j: f"{c('costo',j)}-{c('costo',0)}", USD, '', 'cextra')
fila('Margen del primer mes de los clientes extra', lambda j: f"{c('extra',j)}*{c('m',j)}", USD, 'Lo que esos clientes devuelven el mes en que llegan', 'mextra')
fila('Caja que queda atrapada cada mes (sale y no vuelve ese mes)', lambda j: f"{c('cextra',j)}-{c('mextra',j)}", USD, 'Se recupera recién en el payback', 'atrap', True)
fila('Clientes de anuncios: real frente a lo que espera Valeria', lambda j: f"{c('cli',j)}/{c('cli',2)}", PCT, '$30.000 trae 126 clientes, no 210', 'vsv')
wr.freeze_panes = 'B4'

# ------------------------------------------------------------------ CURVA
wc = wb.create_sheet('Curva'); C = Hoja(wc); C.ancho(A=8, B=14, C=14, D=14, E=14, F=15, G=15, H=10)
C.titulo(1, 'Curva de caja de un cliente de anuncios', 'Mes 0 = se paga el CAC paid. Mes 1 = primer pago (el cliente paga al llegar). La línea de payback objetivo es 12 meses.')
C.encabezado(3, ['Mes', 'Hoy', 'Valeria (hist.)', 'Valeria (cte.)', 'Propuesta', 'Cliente mensual (hoy)', 'Cliente anual (hoy)', 'Cero'])
for m in range(25):
    rr = 4 + m; C.texto(rr, 1, m)
    for j in range(NE):
        Rr = lambda k: f"Resultados!{L(2 + j)}{RES[k]}"
        if m == 0: f = f"=-{Rr('cacp')}"
        else:
            f = (f"={L(2 + j)}{rr - 1}+(1-{P('anual',j)})*{Rr('m')}*(1-{P('churn',j)})^(A{rr}-1)"
                 f"+{P('anual',j)}*{Rr('ma')}*(IF(A{rr}=1,1,0)+IF(A{rr}=13,{sref('renov')},0))")
        C.formula(rr, 2 + j, f, USD)
    if m == 0:
        C.formula(rr, 6, f"=-Resultados!B{RES['cacp']}", USD); C.formula(rr, 7, f"=-Resultados!B{RES['cacp']}", USD)
    else:
        C.formula(rr, 6, f"=F{rr - 1}+Resultados!B{RES['m']}*(1-{P('churn',0)})^(A{rr}-1)", USD)
        C.formula(rr, 7, f"=G{rr - 1}+Resultados!B{RES['ma']}*(IF(A{rr}=1,1,0)+IF(A{rr}=13,{sref('renov')},0))", USD)
    C.formula(rr, 8, '=0', USD)
ch = LineChart(); ch.title = 'Curva de caja: cliente mensual, anual y de la propuesta'; ch.height = 10; ch.width = 20
for k, n in [(6, 'Cliente mensual'), (7, 'Cliente anual'), (5, 'Propuesta'), (8, 'Cero')]:
    ch.series.append(Series(Reference(wc, min_col=k, min_row=4, max_row=28), title=n))
ch.set_categories(Reference(wc, min_col=1, min_row=4, max_row=28)); ch.x_axis.title = 'Mes'; ch.y_axis.title = 'Caja acumulada ($)'
ch.x_axis.delete = False; ch.y_axis.delete = False
wc.add_chart(ch, 'J3')

# ------------------------------------------------------------------ SIMULADOR
PLANES = [
    ('Plan 1', '$10.000 fijos (hoy)', [10000] * 24, 0, 1),
    ('Plan 2', 'Valeria: $30.000 fijos', [30000] * 24, 0, 1),
    ('Plan 3', 'Propio: $15.000 los meses 1-18 y $27.000 después', [15000] * 18 + [27000] * 6, 0, 1),
    ('Plan 4', 'Propio: plan anual al 40 % desde el mes 1, $23.000 los meses 1-12 y $30.000 después', [23000] * 12 + [30000] * 12, 0.4, 1),
]
m_base = f"Resultados!B{RES['m']}"; ma_base = f"Resultados!B{RES['ma']}"
SIMS = []
for nombre, desc, plan, an, an_desde in PLANES:
    w = wb.create_sheet(nombre); H = Hoja(w)
    H.ancho(A=6, B=12, C=10, D=11, E=11, F=11, G=11, H=11, I=12, J=12, K=12, L=13, M=13, N=13, O=14)
    H.titulo(1, f'Simulador de caja · {nombre}: {desc}', 'Editá la inversión de cada mes (columna B) y las palancas de la fila 3.')
    H.texto(3, 1, '% anual'); H.entrada(3, 2, an, PCT); H.texto(3, 3, 'Desde mes'); H.entrada(3, 4, an_desde, NUM)
    H.texto(3, 5, 'Conversión'); H.entrada(3, 6, 0.14, PCT); H.texto(3, 7, 'Desde mes'); H.entrada(3, 8, 1, NUM)
    H.encabezado(5, ['Mes', 'Inversión', 'Trials', 'Vendedoras', 'Clientes de anuncios', 'Clientes nuevos', 'Nuevos plan anual',
                     'Nuevos plan mensual', 'Activos plan mensual', 'Activos plan anual', 'Clientes activos', 'Entradas', 'Salidas', 'Caja final', 'Alerta'])
    for t in range(1, 25):
        rr = 5 + t
        H.texto(rr, 1, t); H.entrada(rr, 2, plan[t - 1], USD)
        H.formula(rr, 3, '=' + interp_formula(f"B{rr}", S.ref['hx'], S.ref['hy']), NUM1)
        H.formula(rr, 4, f"=IF(C{rr}=0,0,ROUNDUP(C{rr}/{sref('cap')},0))", NUM)
        H.formula(rr, 5, f"=C{rr}*IF(A{rr}>=$H$3,$F$3,{sref('conv')})", NUM1)
        H.formula(rr, 6, f"=E{rr}+{sref('org')}", NUM1)
        H.formula(rr, 7, f"=F{rr}*IF(A{rr}>=$D$3,$B$3,0)", NUM1)
        H.formula(rr, 8, f"=F{rr}-G{rr}", NUM1)
        H.formula(rr, 9, f"={sref('activos0') if t == 1 else f'I{rr - 1}'}*(1-{sref('churn')})+H{rr}", NUM1)
        H.formula(rr, 10, f"=SUMIFS($G$6:$G$29,$A$6:$A$29,\">\"&(A{rr}-12),$A$6:$A$29,\"<=\"&A{rr})+{sref('renov')}*SUMIFS($G$6:$G$29,$A$6:$A$29,\">\"&(A{rr}-24),$A$6:$A$29,\"<=\"&(A{rr}-12))", NUM1)
        H.formula(rr, 11, f"=I{rr}+J{rr}", NUM, None, True)
        H.formula(rr, 12, f"=I{rr}*{m_base}+(G{rr}+{sref('renov')}*SUMIFS($G$6:$G$29,$A$6:$A$29,A{rr}-12))*{ma_base}", USD)
        H.formula(rr, 13, f"=B{rr}+D{rr}*{sref('sueldo')}+E{rr}*{sref('com')}+{sref('fijos')}", USD)
        H.formula(rr, 14, f"={sref('caja0') if t == 1 else f'N{rr - 1}'}+L{rr}-M{rr}", USD, None, True)
        H.formula(rr, 15, f"=IF(N{rr}<{sref('piso')},\"BAJO EL PISO\",\"\")")
    w.conditional_formatting.add('N6:N29', CellIsRule(operator='lessThan', formula=[sref('piso')], fill=F_ALERTA))
    H.texto(31, 1, 'Resumen', SUB)
    H.texto(32, 1, 'Caja mínima'); H.formula(32, 5, '=MIN(N6:N29)', USD, None, True)
    H.texto(33, 1, 'Mes de la caja mínima'); H.formula(33, 5, '=MATCH(MIN(N6:N29),N6:N29,0)', NUM)
    H.texto(34, 1, 'Primer mes bajo el piso'); H.formula(34, 5, '=IFERROR(MATCH("BAJO EL PISO",O6:O29,0),"Nunca")', NUM)
    H.texto(35, 1, 'Clientes activos en el mes 24'); H.formula(35, 5, '=K29', NUM, None, True)
    H.texto(36, 1, 'Caja del mes 24'); H.formula(36, 5, '=N29', USD)
    H.texto(37, 1, '¿Cumple todas las reglas?'); H.formula(37, 5, f'=IF(AND(E32>={sref("piso")},MIN(B6:B29)>=0,MAX(B6:B29)<=30000),"Sí","No")', None, None, True)
    H.texto(38, 1, 'Reglas revisadas: caja ≥ piso todos los meses e inversión de $0 a $30.000.')
    w.freeze_panes = 'B6'
    SIMS.append((nombre, desc))

wp = wb.create_sheet('Planes'); Pp = Hoja(wp); Pp.ancho(A=10, B=60, C=13, D=8, E=12, F=14, G=13, H=10)
Pp.titulo(1, 'Comparación de planes (nivel 3)', 'Gana el plan con más clientes activos en el mes 24 sin bajar del piso de $10.000; si empatan, el de más caja.')
Pp.encabezado(3, ['Plan', 'Descripción', 'Caja mínima', 'Mes', 'Primer mes bajo el piso', 'Clientes activos mes 24', 'Caja mes 24', '¿Cumple?'])
for i, (n, d) in enumerate(SIMS):
    rr = 4 + i; q = f"'{n}'"
    Pp.texto(rr, 1, n, NEG); Pp.texto(rr, 2, d)
    for col, ref, fmt in [(3, 'E32', USD), (4, 'E33', NUM), (5, 'E34', NUM), (6, 'E35', NUM), (7, 'E36', USD), (8, 'E37', None)]:
        Pp.formula(rr, col, f"={q}!{ref}", fmt, None, col in (6, 8))
Pp.texto(10, 1, 'Caja y clientes activos mes a mes', SUB)
Pp.encabezado(11, ['Mes'] + [f'Caja {n}' for n, _ in SIMS] + ['Piso'] + [f'Activos {n}' for n, _ in SIMS])
for t in range(1, 25):
    rr = 11 + t; Pp.texto(rr, 1, t)
    for i, (n, _) in enumerate(SIMS):
        Pp.formula(rr, 2 + i, f"='{n}'!N{5 + t}", USD)
        Pp.formula(rr, 3 + len(SIMS) + i, f"='{n}'!K{5 + t}", NUM)
    Pp.formula(rr, 2 + len(SIMS), f"={sref('piso')}", USD)
for (c0, c1, tit, yt, anc) in [(2, 2 + len(SIMS), 'Caja mes a mes con el piso de $10.000', 'Caja ($)', 'K3'),
                               (3 + len(SIMS), 2 + 2 * len(SIMS), 'Clientes activos mes a mes', 'Clientes', 'K22')]:
    ch = LineChart(); ch.title = tit; ch.height = 9; ch.width = 20
    for k in range(c0, c1 + 1):
        ch.series.append(Series(Reference(wp, min_col=k, min_row=12, max_row=35), title=wp.cell(11, k).value))
    ch.set_categories(Reference(wp, min_col=1, min_row=12, max_row=35)); ch.x_axis.title = 'Mes'; ch.y_axis.title = yt
    ch.x_axis.delete = False; ch.y_axis.delete = False
    wp.add_chart(ch, anc)
wb._sheets = [wb[n] for n in ['Supuestos', 'Resultados', 'Curva', 'Planes'] + [n for n, _ in SIMS]]
wb.save('Caso_B_Agendo.xlsx'); print('ok')
