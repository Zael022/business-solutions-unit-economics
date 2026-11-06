# -*- coding: utf-8 -*-
"""Caso A · Tueste — calculadora (nivel 1) y simulador de caja (nivel 3) en Excel / Google Sheets."""
from xl import *
from openpyxl.chart import Reference

wb = Workbook()
# ------------------------------------------------------------------ SUPUESTOS
ws = wb.active; ws.title = 'Supuestos'
S = Hoja(ws); S.ancho(A=48, B=14, C=14, D=14, E=54)
S.titulo(1, 'Tueste · Supuestos', 'Celdas amarillas con texto azul = datos editables. Todo lo demás se calcula solo. Cifras mensuales en dólares.')
r = 4
S.seccion(r, '1. Producto, precios y costos por pedido (sección 1 y 2 del caso)'); r += 1
datos = [
    ('precio', 'Precio de una bolsa de 340 g', 17, USD2, 'Sección 1'),
    ('bolsas', 'Bolsas en el pedido típico', 2, NUM, 'Sección 1'),
    ('cafe', 'Costo del café por bolsa (grano, tueste y bolsa)', 5.44, USD2, 'Sección 2 · no cambia con descuento'),
    ('envio', 'Envío por pedido (lo paga Tueste)', 4.50, USD2, 'Sección 2'),
    ('pasarela', 'Comisión de la pasarela de pago', 0.045, PCT, 'Sección 2 · sobre lo que paga el cliente'),
    ('caja', 'Caja y empaque por pedido', 1.20, USD2, 'Sección 2'),
    ('desc_sub', 'Descuento de la suscripción', 0.10, PCT, 'Sección 1'),
    ('churn', 'Cancelación mensual de suscriptores', 0.09, PCT, 'Sección 4'),
    ('pack_precio', 'Pack de 3 bolsas: precio', 48, USD2, 'Sección 6 · idea de Diego'),
    ('pack_bolsas', 'Pack: bolsas', 3, NUM, 'Sección 6'),
    ('pack_caja', 'Pack: caja más grande', 1.40, USD2, 'Sección 6 · envío gratis solo desde $45'),
]
for k, t, v, f, fu in datos:
    S.texto(r, 1, t); S.entrada(r, 2, v, f, k); S.texto(r, 5, fu, GRIS); r += 1
r += 1
S.seccion(r, '2. Cómo recompra el cliente de pedidos sueltos (sección 4)'); r += 1
S.encabezado(r, ['Mes de vida del cliente', 'Pedidos promedio']); r += 1
ords = [1.00, .15, .20, .20, .20, .20, .20, .15, .15, .15, .20, .20] + [0.10] * 12
r0 = r
for i, o in enumerate(ords, 1):
    S.texto(r, 1, i); S.entrada(r, 2, o, NUM2); S.texto(r, 5, 'Sección 4' if i <= 12 else 'Meses 13 a 24 (solo nivel 3)', GRIS); r += 1
S.ref['ords12'] = f"$B${r0}:$B${r0 + 11}"; S.ref['ords24'] = f"$B${r0}:$B${r0 + 23}"
S.texto(r, 1, 'Pedidos en 12 meses (suma)', NEG); S.formula(r, 2, f"=SUM(B{r0}:B{r0 + 11})", NUM2, 'ped12', True); r += 2

S.seccion(r, '3. Historial: clientes nuevos de Meta según la inversión (sección 5)'); r += 1
S.encabezado(r, ['Inversión en Meta', 'Clientes nuevos de Meta']); r += 1
hist = [(0, 0), (4000, 100), (8000, 165), (12000, 210), (16000, 235), (20000, 250)]
h0 = r
for x, y in hist:
    S.entrada(r, 1, x, USD); S.entrada(r, 2, y, NUM); r += 1
S.ref['hx'] = f"Supuestos!$A${h0}:$A${r - 1}"; S.ref['hy'] = f"Supuestos!$B${h0}:$B${r - 1}"
S.texto(r, 1, 'El punto ($0, 0) se agrega según la regla del nivel 3. Entre puntos se usa interpolación lineal (supuesto 4).', GRIS); r += 2

S.seccion(r, '4. Datos de Ads Manager y de la tienda (sección 3)'); r += 1
for k, t, v, f, fu in [
    ('roas_meta', 'ROAS que reporta Ads Manager', 3.0, NUM2, 'Captura de Meta · atribución 7 días clic o 1 día vista'),
    ('ventas_meta', 'Ventas que Meta se atribuye', 24000, USD, 'Captura de Meta'),
    ('ventas_tienda', 'Ventas totales de la tienda', 28000, USD, 'Shopify · incluye recompras y suscripciones'),
    ('rtg', 'Inversión en retargeting (visitantes + compradores)', 2400, USD, 'Captura: $1.400 + $1.000'),
    ('rtg_ventas', 'Ventas atribuidas al retargeting', 10700, USD, 'Captura: $5.500 + $5.200'),
    ('cli_meta', 'Clientes nuevos que llegaron por Meta (septiembre)', 165, NUM, 'Encuesta y UTM'),
]:
    S.texto(r, 1, t); S.entrada(r, 2, v, f, k); S.texto(r, 5, fu, GRIS); r += 1
r += 1
S.seccion(r, '5. Datos de caja (sección 7, nivel 3)'); r += 1
for k, t, v, f, fu in [
    ('caja0', 'Plata en el banco hoy', 35000, USD, 'Sección 7'),
    ('piso', 'Piso de seguridad', 5000, USD, 'Camila'),
    ('fijos', 'Costos fijos mensuales', 6500, USD, 'Planilla, alquiler, Shopify, contador'),
    ('fee', 'Fee de la agencia (si hay inversión ese mes)', 1000, USD, 'Contrato'),
    ('actuales', 'Contribución de los clientes actuales el mes 1', 9000, USD, 'Sección 7'),
    ('caida', 'Caída mensual de esa contribución', 0.03, PCT, 'Sección 7'),
    ('no_meta', 'Clientes nuevos al mes que no vienen de Meta', 47, NUM, 'Encuesta: 22 + 15 + 10'),
    ('tostadora', 'Segunda tostadora', 14000, USD, 'Sección 7'),
]:
    S.texto(r, 1, t); S.entrada(r, 2, v, f, k); S.texto(r, 5, fu, GRIS); r += 1
r += 1

S.seccion(r, '6. Palancas de cada escenario (nivel 1)'); r += 1
S.encabezado(r, ['Palanca', 'Hoy', 'Agencia', 'Propuesta', 'Explicación']); r += 1
PAL = {}
for k, t, vals, f, ex in [
    ('inv', 'Inversión en Meta al mes', (8000, 16000, 4000), USD, 'Propuesta: bajar a $4.000 y apagar el retargeting'),
    ('desc', 'Descuento en el primer pedido (pedidos sueltos)', (0, 0.30, 0), PCT, 'Agencia: 30 % (supuesto 3: optimista)'),
    ('ps', 'Clientes nuevos que se suscriben', (0.15, 0.15, 0.15), PCT, 'Supuesto 2: la mezcla 85/15 no cambia'),
    ('pack', 'Pedidos sueltos que pasan al pack de 3 bolsas', (0, 0, 0.5), PCT, 'SUPUESTO PROPIO: la mitad elige el pack; los de 2 bolsas pagan su envío'),
    ('fee_on', 'Se paga la agencia (1 = sí, 0 = no)', (1, 1, 1), NUM, 'El fee solo se paga si hay inversión'),
]:
    S.texto(r, 1, t)
    for j, v in enumerate(vals):
        S.entrada(r, 2 + j, v, f, f"{k}{j}")
    S.texto(r, 5, ex, GRIS); r += 1
S.texto(r + 1, 1, 'Supuestos permitidos usados: 1 ($34 de primer pedido para el ROAS), 2 (mezcla 85/15 fija), 3 (el descuento no cambia los clientes que llegan: optimista), 4 (interpolación lineal), 5 (sin temporadas).', GRIS)
S.texto(r + 2, 1, 'Supuesto propio del pack: si un cliente pide 2 bolsas paga él el envío y Tueste deja de pagar $4,50; se mantiene la misma frecuencia de pedidos. Es un riesgo: algunos clientes podrían comprar menos.', GRIS)

def sref(k):
    a = S.ref[k]
    if '!' in a: return a
    if a.startswith('$'): return 'Supuestos!' + a
    return f"Supuestos!${a[0]}${a[1:]}"

# ------------------------------------------------------------------ RESULTADOS
wr = wb.create_sheet('Resultados'); R = Hoja(wr); R.ancho(A=52, B=15, C=15, D=15, E=60)
R.titulo(1, 'Tueste · Resultados (se calculan solos)', 'Cambiá cualquier celda amarilla de Supuestos y todo se actualiza.')
R.encabezado(3, ['Métrica', 'Hoy ($8.000)', 'Agencia ($16.000, −30 %)', 'Propuesta', 'Cómo se calcula'])
row = 4
RES = {}
P = lambda k, j: f"Supuestos!{S.ref[f'{k}{j}'][0]}${S.ref[f'{k}{j}'][1:]}"
def fila(nombre, fn, fmt, como, clave, negrita=False):
    global row
    R.texto(row, 1, nombre, NEG if negrita else NORMAL)
    for j in range(3):
        R.formula(row, 2 + j, '=' + fn(j), fmt, None, negrita)
    R.texto(row, 5, como, GRIS)
    RES[clave] = row; row += 1
def c(k, j): return f"{L(2 + j)}{RES[k]}"
def sec(t):
    global row
    row += 1; R.seccion(row, t); row += 1

pre, bol, caf, env, pas, caj = (sref(x) for x in ['precio', 'bolsas', 'cafe', 'envio', 'pasarela', 'caja'])
sec('1. ¿Cuánto deja cada pedido?')
fila('Valor de un pedido de lista (2 bolsas)', lambda j: f"{pre}*{bol}", USD2, 'Precio × bolsas', 'lista')
fila('Contribución de un pedido suelto (envío gratis)', lambda j: f"{c('lista',j)}-{bol}*{caf}-{env}-{pas}*{c('lista',j)}-{caj}", USD2, 'Lo que paga − café − envío − pasarela − caja', 'c2', True)
fila('Margen de contribución del pedido suelto', lambda j: f"{c('c2',j)}/{c('lista',j)}", PCT, 'Contribución ÷ lo que paga el cliente', 'pc2')
fila('ROAS de break-even del pedido suelto', lambda j: f"1/{c('pc2',j)}", NUM2, '1 ÷ margen de contribución', 'be2', True)
fila('Precio de la suscripción', lambda j: f"{c('lista',j)}*(1-{sref('desc_sub')})", USD2, 'Pedido de lista − 10 %', 'subp')
fila('Contribución de un pedido de suscripción', lambda j: f"{c('subp',j)}-{bol}*{caf}-{env}-{pas}*{c('subp',j)}-{caj}", USD2, 'Igual, sobre $30,60', 'csub', True)
fila('Margen de contribución de la suscripción', lambda j: f"{c('csub',j)}/{c('subp',j)}", PCT, '', 'pcsub')
fila('ROAS de break-even de la suscripción', lambda j: f"1/{c('pcsub',j)}", NUM2, '', 'besub')
fila('Primer pedido con el descuento del escenario', lambda j: f"{c('lista',j)}*(1-{P('desc',j)})", USD2, 'Lo que paga el cliente nuevo de pedidos sueltos', 'pp')
fila('Contribución del primer pedido con descuento (2 bolsas)', lambda j: f"{c('pp',j)}-{bol}*{caf}-{env}-{pas}*{c('pp',j)}-{caj}", USD2, 'El café no baja con el descuento', 'cpp')
fila('ROAS de break-even con ese descuento', lambda j: f"{c('pp',j)}/{c('cpp',j)}", NUM2, 'Con 30 % sube a 3,87: hay que vender casi el doble por cada dólar', 'bepp', True)

sec('2. Con el pack de 3 bolsas (si la palanca está activa)')
fila('Contribución del pedido de 2 bolsas si el cliente paga su envío', lambda j: f"IF({P('pack',j)}>0,{c('lista',j)}-{bol}*{caf}-{pas}*{c('lista',j)}-{caj},{c('c2',j)})", USD2, 'Con pack, el envío de 2 bolsas lo paga el cliente', 'c2p')
fila('Contribución del pack de 3 bolsas', lambda j: f"{sref('pack_precio')}-{sref('pack_bolsas')}*{caf}-{env}-{pas}*{sref('pack_precio')}-{sref('pack_caja')}", USD2, '$48 − 3 × $5,44 − $4,50 − 4,5 % − $1,40', 'c3', True)
fila('Contribución promedio de un pedido suelto', lambda j: f"(1-{P('pack',j)})*{c('c2p',j)}+{P('pack',j)}*{c('c3',j)}", USD2, 'Mezcla según el % que elige el pack', 'cs', True)
fila('Contribución promedio del primer pedido', lambda j: f"(1-{P('pack',j)})*({c('pp',j)}-{bol}*{caf}-IF({P('pack',j)}>0,0,{env})-{pas}*{c('pp',j)}-{caj})+{P('pack',j)}*({sref('pack_precio')}*(1-{P('desc',j)})-{sref('pack_bolsas')}*{caf}-{env}-{pas}*{sref('pack_precio')}*(1-{P('desc',j)})-{sref('pack_caja')})", USD2, 'Incluye el descuento del escenario', 'cps')

sec('3. ¿Cuánto cuesta un cliente nuevo?')
fila('Inversión en Meta', lambda j: f"{P('inv',j)}", USD, 'Palanca', 'inv')
fila('Clientes nuevos de Meta (historial)', lambda j: interp_formula(c('inv', j), S.ref['hx'], S.ref['hy']), NUM1, 'Interpolación lineal en el historial', 'cli', True)
fila('Fee de la agencia del mes', lambda j: f"IF(AND({c('inv',j)}>0,{P('fee_on',j)}=1),{sref('fee')},0)", USD, '$1.000 fijos si hay inversión', 'feem')
fila('CAC de anuncios', lambda j: f"{c('inv',j)}/{c('cli',j)}", USD2, 'Inversión ÷ clientes nuevos de Meta', 'cacads', True)
fila('CAC real', lambda j: f"({c('inv',j)}+{c('feem',j)})/{c('cli',j)}", USD2, '(Inversión + fee) ÷ clientes nuevos de Meta', 'cac', True)

sec('4. La trampa: ¿por qué el ROAS de 3,0 no cuadra con el banco?')
fila('ROAS de Ads Manager (lo que reporta Meta)', lambda j: f"{sref('roas_meta')}", NUM2, 'Dato de la captura (solo aplica a septiembre)', 'roasm')
fila('ROAS real del primer pedido de los clientes nuevos', lambda j: f"{c('cli',j)}*{c('lista',j)}*(1-{P('desc',j)}*(1-{P('ps',j)}))/{c('inv',j)}", NUM2, 'Clientes nuevos × $34 ÷ inversión (supuesto 1)', 'roasr', True)
fila('ROAS de break-even del primer pedido', lambda j: f"{c('bepp',j)}", NUM2, 'Si el ROAS real está por debajo, cada primer pedido pierde plata', 'roasbe')
fila('Parte de las ventas de la tienda que Meta se atribuye', lambda j: f"{sref('ventas_meta')}/{sref('ventas_tienda')}", PCT, '$24.000 ÷ $28.000: Meta se adjudica casi todo, incluidas recompras', 'atrib')
fila('Inversión que va a gente que ya conoce o ya compró (retargeting)', lambda j: f"{sref('rtg')}/{sref('inv0')}", PCT, '$2.400 de $8.000 en septiembre', 'rtgp')

sec('5. ¿Cuánto vale un cliente en 12 meses? (sobre contribución, no ventas)')
fila('LTV del cliente de pedidos sueltos', lambda j: f"{c('cps',j)}+{c('cs',j)}*({sref('ped12')}-INDEX({sref('ords12')},1))", USD2, 'Primer pedido + (3 − 1) pedidos × contribución', 'ltvs', True)
fila('LTV del suscriptor', lambda j: f"{c('csub',j)}*(1-(1-{sref('churn')})^12)/{sref('churn')}", USD2, 'Suma mes a mes: c × (1 + 0,91 + 0,91² + … + 0,91¹¹)', 'ltvsub', True)
fila('LTV promedio', lambda j: f"(1-{P('ps',j)})*{c('ltvs',j)}+{P('ps',j)}*{c('ltvsub',j)}", USD2, '0,85 × suelto + 0,15 × suscriptor', 'ltv', True)
fila('LTV:CAC', lambda j: f"{c('ltv',j)}/{c('cac',j)}", X2, 'LTV promedio ÷ CAC real', 'lc', True)
fila('Semáforo LTV:CAC', lambda j: f"IF({c('lc',j)}<1,\"ROJO: pierde plata\",IF({c('lc',j)}<3,\"AMARILLO: deja poco\",\"VERDE: sano\"))", None, 'Rojo < 1 · amarillo 1 a 3 · verde ≥ 3', 'sem')
fila('Payback (meses para recuperar el CAC)', lambda j: f"IF(COUNTIF(Curva!{L(2 + j)}4:{L(2 + j)}16,\"<0\")>12,\"No recupera en 12 meses\",COUNTIF(Curva!{L(2 + j)}4:{L(2 + j)}16,\"<0\"))", NUM, 'Primer mes en que la curva de caja cruza el cero', 'pb', True)
fila('¿El primer pedido paga el CAC?', lambda j: f"IF({c('cps',j)}>={c('cac',j)},\"Sí\",\"No: deja \"&TEXT({c('cps',j)},\"$0.00\")&\" de \"&TEXT({c('cac',j)},\"$0.00\"))", None, 'Contribución del primer pedido frente al CAC real', 'pm')

sec('6. ¿Qué pasa con los clientes extra? (CAC marginal)')
base_inv = sref('inv0')
fila('Clientes extra frente a hoy', lambda j: f"{c('cli',j)}-{c('cli',0)}", NUM1, '', 'extra')
fila('CAC marginal frente a hoy', lambda j: f"IF({c('extra',j)}=0,\"—\",({c('inv',j)}-{c('inv',0)})/{c('extra',j)})", USD2, 'Plata extra ÷ clientes extra', 'mg', True)
fila('¿Cada cliente extra deja plata?', lambda j: f"IF({c('extra',j)}=0,\"—\",IF({c('extra',j)}<0,\"Se dejan de traer clientes que costaban \"&TEXT({c('mg',j)},\"$0.00\")&\" c/u\",IF({c('ltv',j)}>{c('mg',j)},\"Sí\",\"No: cuesta más de lo que deja\")))", None, 'Compara el LTV con el CAC marginal', 'mgok')
row += 1
R.texto(row, 1, 'CAC marginal por tramo del historial', NEG); row += 1
R.encabezado(row, ['Tramo', 'Plata extra', 'Clientes extra', 'CAC marginal']); row += 1
for a, b in [(0, 4000), (4000, 8000), (8000, 12000), (8000, 16000), (12000, 16000), (16000, 20000)]:
    fa = interp_formula(str(a), S.ref['hx'], S.ref['hy']); fb = interp_formula(str(b), S.ref['hx'], S.ref['hy'])
    R.texto(row, 1, f"De ${a:,} a ${b:,}".replace(',', '.'))
    R.formula(row, 2, f"={b}-{a}", USD); R.formula(row, 3, f"={fb}-{fa}", NUM1)
    R.formula(row, 4, f"=B{row}/C{row}", USD2, None, True); row += 1
wr.freeze_panes = 'B4'

# ------------------------------------------------------------------ CURVA DE CAJA
wc = wb.create_sheet('Curva'); C = Hoja(wc); C.ancho(A=10, B=16, C=16, D=16, E=12)
C.titulo(1, 'Curva de caja de un cliente promedio', 'Mes 0 = se paga el CAC real. Desde el mes 1 se suma la contribución de cada pedido.')
C.encabezado(3, ['Mes', 'Hoy', 'Agencia', 'Propuesta', 'Cero'])
for m in range(13):
    rr = 4 + m
    C.texto(rr, 1, m)
    for j in range(3):
        col = L(2 + j); R_ = lambda k: f"Resultados!{L(2 + j)}{RES[k]}"
        if m == 0:
            f = f"=-{R_('cac')}"
        else:
            f = (f"={col}{rr - 1}+(1-{P('ps', j)})*IF(A{rr}=1,{R_('cps')},{R_('cs')}*INDEX({sref('ords12')},A{rr}))"
                 f"+{P('ps', j)}*{R_('csub')}*(1-{sref('churn')})^(A{rr}-1)")
        C.formula(rr, 2 + j, f, USD2)
    C.formula(rr, 5, '=0', USD)
ch = LineChart(); ch.title = 'Curva de caja de un cliente (12 meses)'; ch.height = 9; ch.width = 18
for k, n in [(2, 'Hoy'), (3, 'Agencia'), (4, 'Propuesta'), (5, 'Cero')]:
    ch.series.append(Series(Reference(wc, min_col=k, min_row=4, max_row=16), title=n))
ch.set_categories(Reference(wc, min_col=1, min_row=4, max_row=16)); ch.x_axis.title = 'Mes'; ch.y_axis.title = 'Caja acumulada ($)'
ch.x_axis.delete = False; ch.y_axis.delete = False
wc.add_chart(ch, 'G3')

# ------------------------------------------------------------------ SIMULADOR (4 planes)
PLANES = [
    ('Plan 1', '$8.000 fijos (hoy)', [8000] * 24, 0, 1),
    ('Plan 2', 'Agencia: $16.000 fijos', [16000] * 24, 0, 1),
    ('Plan 3', 'Propio: $4.000 fijos, sin otros cambios', [4000] * 24, 0, 1),
    ('Plan 4', 'Propio: pack (50 %) desde el mes 1; $4.000 los meses 1-3 para probarlo y $8.000 después', [4000] * 3 + [8000] * 21, 0.5, 1),
    ('Plan 5', 'Propio: pack (50 %) desde el mes 1 y $8.000 fijos (el de más caja)', [8000] * 24, 0.5, 1),
]
SIMS = []
for nombre, desc, plan, pk, pk_desde in PLANES:
    w = wb.create_sheet(nombre); H = Hoja(w)
    H.ancho(A=7, B=13, C=12, D=12, E=14, F=14, G=13, H=14, I=12, J=12, K=4)
    H.titulo(1, f'Simulador de caja · {nombre}: {desc}', 'Editá la inversión de cada mes (columna B) y las palancas de la fila 3. Cada grupo de clientes nuevos se sigue por separado (matriz a la derecha).')
    H.texto(3, 1, 'Pack (%)'); H.entrada(3, 2, pk, PCT, 'pk')
    H.texto(3, 3, 'Desde mes'); H.entrada(3, 4, pk_desde, NUM, 'pkd')
    H.texto(3, 5, '% suscriptores'); H.entrada(3, 6, 0.15, PCT, 'ps')
    pkc, pkdc, psc = '$B$3', '$D$3', '$F$3'
    H.encabezado(5, ['Mes', 'Inversión en Meta', 'Clientes de Meta', 'Clientes nuevos (total)', 'Contribución clientes actuales',
                     'Contribución grupos nuevos', 'Salidas', 'Caja final', 'Alerta', 'Suscriptores activos'])
    c2 = f"Resultados!B{RES['c2']}"; c2p = f"(Resultados!B{RES['lista']}-{bol}*{caf}-{pas}*Resultados!B{RES['lista']}-{caj})"
    c3 = f"Resultados!B{RES['c3']}"; csub = f"Resultados!B{RES['csub']}"
    # matriz de cohortes: filas = grupo (mes de llegada), columnas = mes calendario
    M0C = 13  # columna M
    H.texto(4, M0C, 'Matriz de cohortes: contribución de cada grupo (fila = mes en que llegó) en cada mes (columna)', NEG)
    H.texto(5, M0C - 1, 'Grupo', NEG)
    for t in range(1, 25):
        cc = w.cell(5, M0C + t - 1, t); cc.font = BLANCO; cc.fill = F_HEAD
    for t in range(1, 25):
        rr = 5 + t
        H.texto(rr, 1, t)
        H.entrada(rr, 2, plan[t - 1], USD)
        H.formula(rr, 3, '=' + interp_formula(f"B{rr}", S.ref['hx'], S.ref['hy']), NUM1)
        H.formula(rr, 4, f"=C{rr}+{sref('no_meta')}", NUM1)
        H.formula(rr, 5, f"={sref('actuales')}*(1-{sref('caida')})^(A{rr}-1)", USD)
        H.formula(rr, 6, f"=SUM({L(M0C)}{rr + 0}:{L(M0C)}{rr})" if False else f"=SUM({L(M0C + t - 1)}$6:{L(M0C + t - 1)}$29)", USD)
        H.formula(rr, 7, f"=B{rr}+IF(B{rr}>0,{sref('fee')},0)+{sref('fijos')}", USD)
        H.formula(rr, 8, f"={sref('caja0') if t == 1 else f'H{rr - 1}'}+E{rr}+F{rr}-G{rr}", USD, None, True)
        H.formula(rr, 9, f"=IF(H{rr}<{sref('piso')},\"BAJO EL PISO\",\"\")")
        H.formula(rr, 10, f"=SUMPRODUCT(($A$6:$A$29<=A{rr})*$D$6:$D$29*{psc}*(1-{sref('churn')})^(A{rr}-$A$6:$A$29))", NUM1)
        # fila de la matriz para el grupo que llegó en el mes t
        H.texto(rr, M0C - 1, t)
        for tt in range(1, 25):
            col = L(M0C + tt - 1)
            if tt < t:
                w.cell(rr, M0C + tt - 1, 0).number_format = USD
            else:
                edad = tt - t + 1
                cs = f"IF($A{rr}>={pkdc},(1-{pkc})*IF({pkc}>0,{c2p},{c2})+{pkc}*{c3},{c2})"
                f = (f"=$D{rr}*((1-{psc})*INDEX({sref('ords24')},{edad})*{cs}+{psc}*{csub}*(1-{sref('churn')})^{edad - 1})")
                w.cell(rr, M0C + tt - 1, f).number_format = USD
    w.conditional_formatting.add('H6:H29', CellIsRule(operator='lessThan', formula=[sref('piso')], fill=F_ALERTA))
    # resumen del plan
    H.texto(31, 1, 'Resumen', SUB)
    H.texto(32, 1, 'Caja mínima'); H.formula(32, 4, '=MIN(H6:H29)', USD, None, True)
    H.texto(33, 1, 'Mes de la caja mínima'); H.formula(33, 4, '=MATCH(MIN(H6:H29),H6:H29,0)', NUM)
    H.texto(34, 1, 'Caja del mes 24'); H.formula(34, 4, '=H29', USD, None, True)
    H.texto(35, 1, 'Suscriptores activos en el mes 24'); H.formula(35, 4, '=J29', NUM1)
    H.texto(36, 1, 'Promedio de inversión meses 1 a 12'); H.formula(36, 4, '=AVERAGE(B6:B17)', USD)
    H.texto(37, 1, '¿Desde el mes 13 invierte al menos ese promedio?'); H.formula(37, 4, '=IF(MIN(B18:B29)>=D36-0.0001,"Sí","No")')
    H.texto(38, 1, '¿Cumple todas las reglas?'); H.formula(38, 4, f'=IF(AND(D32>={sref("piso")},D37="Sí",MIN(B6:B29)>=0,MAX(B6:B29)<=20000),"Sí","No")', None, None, True)
    H.texto(39, 1, 'Reglas revisadas: caja ≥ piso todos los meses, inversión de $0 a $20.000 y desde el mes 13 ≥ promedio de los meses 1 a 12.')
    w.freeze_panes = 'B6'
    SIMS.append((nombre, desc))

# ------------------------------------------------------------------ PLANES
wp = wb.create_sheet('Planes'); Pp = Hoja(wp); Pp.ancho(A=12, B=50, C=14, D=10, E=14, F=14, G=12)
Pp.titulo(1, 'Comparación de planes (nivel 3)', 'Gana el plan que termina con más caja en el mes 24 sin romper reglas; si empatan, el de más suscriptores activos.')
Pp.encabezado(3, ['Plan', 'Descripción', 'Caja mínima', 'Mes', 'Caja mes 24', 'Suscriptores mes 24', '¿Cumple?'])
for i, (n, d) in enumerate(SIMS):
    rr = 4 + i; q = f"'{n}'"
    Pp.texto(rr, 1, n, NEG); Pp.texto(rr, 2, d)
    Pp.formula(rr, 3, f"={q}!D32", USD); Pp.formula(rr, 4, f"={q}!D33", NUM)
    Pp.formula(rr, 5, f"={q}!D34", USD, None, True); Pp.formula(rr, 6, f"={q}!D35", NUM1); Pp.formula(rr, 7, f"={q}!D38")
Pp.texto(10, 1, 'Caja mes a mes', SUB)
Pp.encabezado(11, ['Mes'] + [n for n, _ in SIMS] + ['Piso'])
for t in range(1, 25):
    rr = 11 + t; Pp.texto(rr, 1, t)
    for i, (n, _) in enumerate(SIMS):
        Pp.formula(rr, 2 + i, f"='{n}'!H{5 + t}", USD)
    Pp.formula(rr, 2 + len(SIMS), f"={sref('piso')}", USD)
ch = LineChart(); ch.title = 'Caja mes a mes con el piso de $5.000'; ch.height = 9; ch.width = 20
for k in range(2, 3 + len(SIMS)):
    ch.series.append(Series(Reference(wp, min_col=k, min_row=12, max_row=35), title=wp.cell(11, k).value))
ch.set_categories(Reference(wp, min_col=1, min_row=12, max_row=35)); ch.x_axis.title = 'Mes'; ch.y_axis.title = 'Caja ($)'
ch.x_axis.delete = False; ch.y_axis.delete = False
wp.add_chart(ch, 'I3')

wb._sheets = [wb[n] for n in ['Supuestos', 'Resultados', 'Curva', 'Planes'] + [n for n, _ in SIMS]]
wb.save('Caso_A_Tueste.xlsx')
print('ok', RES['lc'])
