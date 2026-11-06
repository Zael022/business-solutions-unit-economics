#!/usr/bin/env python3
"""Hoja de cuentas de la Sesión 2 (se abre en Google Sheets). Datos en azul sobre amarillo; todo lo demás son fórmulas.
Uso: python3 hoja_cuentas.py salida.xlsx"""
import sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

AR = 'Arial'
F_T = Font(name=AR, size=14, bold=True); F_S = Font(name=AR, size=11, bold=True, color='FFFFFF'); F_N = Font(name=AR, size=10)
F_B = Font(name=AR, size=10, bold=True); F_IN = Font(name=AR, size=10, color='0000FF'); F_G = Font(name=AR, size=9, italic=True, color='555555')
AMA = PatternFill('solid', fgColor='FFF2CC'); OSC = PatternFill('solid', fgColor='1F3A5F'); GRIS = PatternFill('solid', fgColor='EEF1F5')
L = Side(style='thin', color='C9CED6'); B = Border(top=L, bottom=L, left=L, right=L)
USD = '$#,##0.00;-$#,##0.00'; PCT = '0.0%'; NUM = '#,##0.0'; N2 = '0.000'

class H:
    def __init__(s, ws, anchos):
        s.ws = ws; s.r = 1
        for col, w in anchos.items(): ws.column_dimensions[col].width = w
    def titulo(s, t, sub):
        s.ws.cell(s.r, 1, t).font = F_T; s.r += 1
        s.ws.cell(s.r, 1, sub).font = F_G; s.r += 2
    def seccion(s, t, ncols=4):
        for c in range(1, ncols + 1): s.ws.cell(s.r, c).fill = OSC
        s.ws.cell(s.r, 1, t).font = F_S; s.r += 1
    def enc(s, cols):
        for i, c in enumerate(cols, 1):
            x = s.ws.cell(s.r, i, c); x.font = F_B; x.fill = GRIS; x.border = B; x.alignment = Alignment(wrap_text=True)
        s.r += 1
    def fila(s, etiqueta, valores, fmt=None, entrada=False, nota=None, negrita=False):
        x = s.ws.cell(s.r, 1, etiqueta); x.font = F_B if negrita else F_N; x.border = B; x.alignment = Alignment(wrap_text=True, vertical='top')
        for i, v in enumerate(valores, 2):
            c = s.ws.cell(s.r, i, v); c.border = B
            es_dato = entrada and not (isinstance(v, str) and v.startswith('='))
            c.font = F_IN if es_dato else (F_B if negrita else F_N)
            if es_dato and v is not None: c.fill = AMA
            if fmt and not isinstance(v, str) or (fmt and isinstance(v, str) and v.startswith('=')): c.number_format = fmt
        if nota: n = s.ws.cell(s.r, len(valores) + 2, nota); n.font = F_G; n.alignment = Alignment(wrap_text=True, vertical='top')
        s.r += 1; return s.r - 1
    def texto(s, t, fuente=F_N):
        c = s.ws.cell(s.r, 1, t); c.font = fuente; c.alignment = Alignment(wrap_text=True, vertical='top'); s.r += 1

wb = Workbook()
# ======================================================== A
ws = wb.active; ws.title = 'A Tueste'; h = H(ws, {'A': 52, 'B': 14, 'C': 14, 'D': 14, 'E': 60})
h.titulo('Tueste · Programa de referidos', 'Datos de la Parte 1 y la Parte 2 en azul sobre amarillo. Lo demás se calcula. Supuestos del equipo marcados en la nota.')
h.seccion('1. El embudo de hoy, por cada 1.000 clientes que hacen su primera compra', 5); h.enc(['Paso', 'Llegan', 'Pasan del paso anterior', '', 'Fuente'])
r0 = h.r
pasos = [('Reciben el correo', 1000), ('Abren el correo', 350), ('Entran a la página del programa', 120), ('Mandan invitaciones (clientes)', 100), ('Invitaciones enviadas', 300), ('Amigos que abren la tienda', 150), ('Amigos que compran', 60)]
for i, (n, v) in enumerate(pasos):
    h.fila(n, [v, None if i == 0 else f'=B{h.r}/B{h.r - 1}'], None, entrada=True, nota='Parte 2, «Cómo funciona hoy»')
    ws.cell(h.r - 1, 3).number_format = PCT if i != 4 else '0.0"×"'
rUlt = h.r - 1
h.fila('Paso con menor tasa', [f'=INDEX(A{r0+1}:A{rUlt},MATCH(MIN(C{r0+1}:C{r0+3},C{r0+5}:C{rUlt}),C{r0+1}:C{rUlt},0))'], negrita=True, nota='Sin contar el paso de invitaciones, que multiplica (3 por cliente)')
rVen = h.fila('Clientes que ven el programa', [f'=B{r0+2}/B{r0}'], PCT, nota='88 % nunca lo ve')
rK = h.fila('K de hoy: referidos por cliente', [f'=B{rUlt}/B{r0}'], N2, negrita=True, nota='Igual a 10 % invita × 3 invitaciones × 20 % compra')
h.r += 1
h.seccion('2. La regla de Diego', 5)
rInv = h.fila('Inversión en Meta (Parte 1, hoy)', [4000], USD, entrada=True); rFee = h.fila('Fee de la agencia', [1000], USD, entrada=True)
rCli = h.fila('Clientes nuevos de Meta con $4.000 (historial)', [100], NUM, entrada=True)
rCac = h.fila('CAC real de Meta', [f'=(B{rInv}+B{rFee})/B{rCli}'], USD, negrita=True)
rTope = h.fila('Tope por cliente referido (la mitad)', [f'=B{rCac}/2'], USD, negrita=True)
h.r += 1
h.seccion('3. Recompensas por nivel', 5); h.enc(['Recompensa', 'Costo', 'Se reparte entre', 'Por referido', 'Cuándo'])
rCafe = h.fila('Costo del café de 2 bolsas', [10.88], USD, entrada=True, nota='Parte 1: 2 × $5,44')
rEnv = h.fila('Envío', [4.5], USD, entrada=True); rCaja = h.fila('Caja', [1.2], USD, entrada=True)
rec = [('Amigo: $8 de descuento ya aplicado', 8, 1, 'siempre'), ('Quien invita: $5 de crédito por amigo que compra', 5, 1, 'siempre'),
       ('Quien invita: bolsa de 340 g al 3.er amigo', 5.44, 3, 'al tercer amigo'), ('Quien invita: un mes gratis con 2 amigos suscritos', f'=B{rCafe}+B{rEnv}+B{rCaja}', 2, 'si el amigo se suscribe')]
rr = []
for n, c, e, cu in rec:
    rr.append(h.fila(n, [c, e, f'=B{h.r}/C{h.r}'], USD, entrada=True, nota=cu)); ws.cell(rr[-1], 3).number_format = '0'
h.enc(['Combinación', '', '', 'Costo', '¿Cumple?'])
combos = [('Amigo que compra un pedido suelto', rr[:2]), ('… y es el 3.er amigo', rr[:3]), ('Amigo que se suscribe', [rr[0], rr[1], rr[3]]), ('Todo junto (peor caso)', rr)]
for n, lst in combos:
    f = '=' + '+'.join(f'D{x}' for x in lst)
    h.fila(n, [None, None, f, f'=IF(D{h.r}<=$B${rTope},"Sí","NO")'], USD, negrita=(n.startswith('Todo')))
h.fila('Costo por referido hoy ($8 + $8)', [None, None, 16], USD, entrada=True)
h.r += 1
h.seccion('4. La meta (supuestos del equipo)', 5); h.enc(['', 'Hoy', 'Meta', '', 'Por qué'])
rM1 = h.fila('Clientes que ven el programa', [f'=B{rVen}', 0.35], PCT, entrada=True, nota='Supuesto: el aviso al llegar el café lo abre como hoy el correo (35 %) y lleva directo a invitar')
rM2 = h.fila('De los que ven, invitan', [f'=B{r0+3}/B{r0+2}', f'=B{h.r}'], PCT, nota='Igual que hoy (83 %)')
rM3 = h.fila('Invitaciones por cliente', [f'=B{r0+4}/B{r0+3}', f'=B{h.r}'], NUM)
rM4 = h.fila('Amigos que abren', [f'=B{r0+5}/B{r0+4}', f'=B{h.r}'], PCT, nota='Igual que hoy (50 %)')
rM5 = h.fila('Amigos que compran (de los que abren)', [f'=B{rUlt}/B{r0+5}', 0.5], PCT, entrada=True, nota='Supuesto: la página con el regalo aplicado sube la compra de 40 % a 50 %')
rKm = h.fila('K (referidos por cliente)', [f'=PRODUCT(B{rM1}:B{rM5})', f'=PRODUCT(C{rM1}:C{rM5})'], N2, negrita=True)
h.fila('Referidos por cada 100 clientes', [f'=B{rKm}*100', f'=C{rKm}*100'], NUM)
rBase = h.fila('Clientes nuevos al mes por Meta y otras vías', [147, f'=B{h.r}'], '0', entrada=True, nota='Parte 1 con $4.000: 100 de Meta + 47')
rRef = h.fila('Referidos al mes (base × K ÷ (1 − K))', [f'=B{rBase}*B{rKm}/(1-B{rKm})', f'=C{rBase}*C{rKm}/(1-C{rKm})'], NUM)
h.fila('Parte de los clientes nuevos que viene de Meta', [f'=100/B{rBase}', f'=100/(C{rBase}+C{rRef})'], PCT)

# ======================================================== B
ws = wb.create_sheet('B Agendo'); h = H(ws, {'A': 52, 'B': 14, 'C': 14, 'D': 14, 'E': 60})
h.titulo('Agendo · Puesta en marcha nueva', 'Datos de la Parte 1 y la Parte 2 en azul sobre amarillo. Lo demás se calcula.')
h.seccion('1. Pantallas de hoy, por cada 100 trials', 5); h.enc(['Pantalla', 'Llegan / terminan', 'Pasan', 'Minutos', 'Fuente'])
r0 = h.r
pant = [('Empiezan la prueba', 100, None), ('Datos fiscales', 74, 4), ('Datos del negocio', 70, 3), ('Servicios', 65, 12), ('Horarios («¡Listo!»)', 62, 9), ('Comparten el link el primer día', 30, None)]
for i, (n, v, m) in enumerate(pant):
    h.fila(n, [v, None if i == 0 else f'=B{h.r}/B{h.r-1}', m], None, entrada=True, nota='Parte 2'); ws.cell(h.r - 1, 3).number_format = PCT
rU = h.r - 1
h.fila('Paso con menor tasa', [f'=INDEX(A{r0+1}:A{rU},MATCH(MIN(C{r0+1}:C{rU}),C{r0+1}:C{rU},0))'], negrita=True)
h.fila('Minutos hasta «¡Listo!»', [None, None, f'=SUM(D{r0+1}:D{rU})'], '0', nota='Servicios se lleva 12 de 28')
h.r += 1
h.seccion('2. Hábito, aha y setup (de atrás para adelante)', 5)
for t in ['Hábito: 20 citas o más en 14 días (22 de cada 100 trials llegan; pagan el 45 %).', 'Aha: la primera reserva que hace un cliente solo, por el link.', 'Setup: servicios, horario y el link compartido. Los datos fiscales solo hacen falta para cobrar al final de la prueba.']: h.texto(t)
h.r += 1
h.seccion('3. Conversión a pago y CAC paid', 5); h.enc(['', 'Hoy', 'Meta', '', 'Por qué'])
rConf = h.fila('Configuran su página (de 100)', [f'=B{r0+4}', 90], '0.0', entrada=True, nota='Supuesto: plantillas y datos fiscales al final → 90 de 100')
rPct = h.fila('Comparten el link el primer día (de los que configuran)', [f'=B{rU}/B{r0+4}', 0.7], PCT, entrada=True, nota='Supuesto: botón de WhatsApp con el mensaje listo → 70 %')
rComp = h.fila('Comparten', [f'=B{rConf}*B{rPct}', f'=C{rConf}*C{rPct}'], '0.0')
rT1 = h.fila('Reservan si comparten', [27/30, f'=B{h.r}'], PCT, entrada=True, nota='27 de 30'); rT2 = h.fila('Reservan si no comparten', [11/32, f'=B{h.r}'], PCT, entrada=True, nota='11 de 32')
rRes = h.fila('Reciben su primera reserva', [f'=B{rComp}*B{rT1}+(B{rConf}-B{rComp})*B{rT2}', f'=C{rComp}*C{rT1}+(C{rConf}-C{rComp})*C{rT2}'], '0.0')
rHab = h.fila('Uso habitual (22 de cada 38 que reservan)', [f'=B{rRes}*22/38', f'=C{rRes}*22/38'], '0.0')
tp = [h.fila(n, [v, f'=B{h.r}'], PCT, entrada=True) for n, v in [('Pagan: no configuran', .01), ('Pagan: configuran sin reserva', .05), ('Pagan: reservan sin hábito', .15), ('Pagan: uso habitual', .45)]]
grupos = lambda c: f'((100-{c}{rConf})*{c}{tp[0]}+({c}{rConf}-{c}{rRes})*{c}{tp[1]}+({c}{rRes}-{c}{rHab})*{c}{tp[2]}+{c}{rHab}*{c}{tp[3]})/100'
rConv = h.fila('Conversión a pago', ['=' + grupos('B'), '=' + grupos('C')], PCT, negrita=True)
rTr = h.fila('Trials por anuncios con $10.000', [500, f'=B{h.r}'], '0', entrada=True)
rCl = h.fila('Clientes que pagan', [f'=B{rTr}*B{rConv}', f'=C{rTr}*C{rConv}'], '0.0')
rCo = h.fila('Costo: anuncios + Mariela', [11200, f'=B{h.r}'], USD, entrada=True); rCm = h.fila('Comisión por cliente', [20, f'=B{h.r}'], USD, entrada=True)
rCac = h.fila('CAC paid', [f'=(B{rCo}+B{rCm}*B{rCl})/B{rCl}', f'=(C{rCo}+C{rCm}*C{rCl})/C{rCl}'], USD, negrita=True)
h.fila('LTV:CAC paid (LTV a 24 meses $251,39)', [f'=251.39/B{rCac}', f'=251.39/C{rCac}'], '0.00', nota='LTV de la Parte 1')
h.r += 1
h.seccion('4. La insignia', 5)
h.fila('Visitas al mes por página de reservas', [250], '0', entrada=True); h.fila('Barberías nuevas al mes que llegan por la insignia hoy', [8], '0', entrada=True, nota='El caso no dice si son trials o clientes que pagan')

# ======================================================== C
ws = wb.create_sheet('C Sol de Casa'); h = H(ws, {'A': 56, 'B': 14, 'C': 14, 'D': 14, 'E': 58})
h.titulo('Sol de Casa · El ahorro que se comparte', 'Datos de la Parte 1 y la Parte 2 en azul sobre amarillo. Lo demás se calcula.')
h.seccion('1. Venta referida', 5)
t = [h.fila(n, [v], PCT, entrada=True, nota='Parte 2') for n, v in [('Referidos contactados', .95), ('Contactados que agendan', .85), ('Visitas agendadas que se hacen', .90), ('Visitas que cierran', .45)]]
rVpl = h.fila('Ventas por lead referido', [f'=PRODUCT(B{t[0]}:B{t[3]})'], N2, negrita=True)
rVpv = h.fila('Visitas por venta', [f'=1/B{t[3]}'], '0.00'); rApv = h.fila('Visitas agendadas por venta', [f'=1/(B{t[2]}*B{t[3]})'], '0.00')
rCv = h.fila('Costo de una visita', [60], USD, entrada=True)
rCvv = h.fila('Costo de visitas por venta referida (hoy, sin recompensas)', [f'=B{rVpv}*B{rCv}'], USD, negrita=True)
rTope = h.fila('Regla de Andrés: máximo por venta referida', [300], USD, entrada=True)
h.fila('Queda para recompensas', [f'=B{rTope}-B{rCvv}'], USD, negrita=True)
h.r += 1
h.seccion('2. Recompensas', 5); h.enc(['Recompensa', 'Costo', 'Veces por venta', 'Por venta', 'Cuándo'])
x1 = h.fila('$10 en el plan por vecino que agenda', [10, f'=B{rApv}', f'=B{h.r}*C{h.r}'], USD, entrada=True, nota='por agendar')
x2 = h.fila('Limpieza de paneles gratis', [60, 1, f'=B{h.r}*C{h.r}'], USD, entrada=True, nota='cuando el vecino firma')
x3 = h.fila('$80 de descuento en el plan de mantenimiento', [80, 1, f'=B{h.r}*C{h.r}'], USD, entrada=True, nota='cuando el vecino firma')
h.fila('Total con visitas', [None, None, f'=B{rCvv}+D{x1}+D{x2}+D{x3}', f'=IF(D{h.r}<=B{rTope},"Sí","NO")'], USD, negrita=True)
h.r += 1
h.seccion('3. Capacidad y técnico nuevo (pregunta 4)', 5)
rLh = h.fila('Referidos al mes hoy: 420 × 8 % ÷ 12', ['=420*0.08/12'], '0.00'); h.fila('Ventas referidas al mes hoy', [f'=B{rLh}*B{rVpl}'], '0.00')
rVl = h.fila('Visitas hechas por lead referido', [f'=B{t[0]}*B{t[1]}*B{t[2]}'], N2)
rLt = h.fila('Leads para llenar 50 visitas de un técnico', [f'=50/B{rVl}'], NUM, negrita=True)
rLe = h.fila('Leads por casa al mes con un letrero (6 de 20 casas en 2 meses)', ['=6/20/2'], N2)
h.fila('Familias que harían falta compartiendo', [f'=B{rLt}/B{rLe}'], NUM, negrita=True, nota='Más que las 420 que hay: el ciclo solo no llena un técnico')
for n, c in [('Valor de una visita referida (45 % × $1.625 − $60)', '=0.45*1625-60'), ('Valor de una visita de Google (30 %)', '=0.30*1625-60'), ('Valor de una visita de Meta (18 %)', '=0.18*1625-60')]: h.fila(n, [c], USD)
h.r += 1
h.seccion('4. La meta (supuesto del equipo)', 5)
rCo = h.fila('Familias que comparten (las que hoy ya enseñan su recibo)', ['=420*0.4'], '0', nota='Supuesto: 40 %')
rLm = h.fila('Leads referidos al mes (0,15 por familia)', [f'=B{rCo}*B{rLe}'], NUM); h.fila('Visitas hechas', [f'=B{rLm}*B{rVl}'], NUM); h.fila('Ventas referidas al mes', [f'=B{rLm}*B{rVpl}'], NUM, negrita=True)
h.fila('Ahorro de la familia promedio al mes ($110 × 70 %)', ['=110*0.7'], USD); h.fila('Años para recuperar $6.500', ['=6500/(110*0.7*12)'], '0.0')

# ======================================================== Matriz, cuatro preguntas, demo
ws = wb.create_sheet('Matriz 90 días'); h = H(ws, {'A': 14, 'B': 58, 'C': 18, 'D': 22, 'E': 60})
h.titulo('Matriz de canales a 90 días', '«Vuelve rápido»: devuelve lo que cuesta en 3 meses o menos (payback de la Parte 1). Se calcula con el módulo growth del motor.')
import json, os
M = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cuentas.json')))['matriz']
for caso, nombre in [('A', 'Tueste'), ('B', 'Agendo'), ('C', 'Sol de Casa')]:
    h.seccion(nombre, 5); h.enc(['Caso', 'Canal', 'Payback (meses)', 'Cuadrante', 'Por qué'])
    for c in M[caso]: h.fila(nombre, [c['canal'], c['paybackMeses'] if c['paybackMeses'] is not None else 'no recupera', c['cuadrante'], c['porque']])
ws = wb.create_sheet('Cuatro preguntas'); h = H(ws, {'A': 26, 'B': 22, 'C': 70, 'D': 10})
h.titulo('Las cuatro preguntas del cliente', 'Revisión de cada prototipo, desde cada lado.')
P = [('Tueste', 'Quien invita', '¿Es para mí?', 'El aviso llega con su nombre cuando su café está en la puerta.'), ('Tueste', 'Quien invita', '¿Hace lo que quiero?', 'Regalar café sin copiar códigos: un botón y el mensaje listo.'), ('Tueste', 'Quien invita', '¿Me importa ahora?', 'Lo pide con la primera taza, cuando tiene ganas de contarlo.'), ('Tueste', 'Quien invita', '¿Sé cómo lograrlo?', 'Un botón de WhatsApp y una barra que dice cuántos amigos faltan.'),
     ('Tueste', 'El amigo', '¿Es para mí?', 'La página dice que Camila le regaló $8 a él.'), ('Tueste', 'El amigo', '¿Hace lo que quiero?', 'El regalo ya está aplicado: el precio baja de $34 a $26.'), ('Tueste', 'El amigo', '¿Me importa ahora?', 'El regalo es para su primer pedido, hoy.'), ('Tueste', 'El amigo', '¿Sé cómo lograrlo?', 'Elegir el café y pagar: dos pantallas.'),
     ('Agendo', 'El barbero', '¿Es para mí?', 'Arranca con «Más clientes empiezan con una página para reservar», lo mismo que el anuncio.'), ('Agendo', 'El barbero', '¿Hace lo que quiero?', 'En menos de 5 minutos tiene su página y la manda.'), ('Agendo', 'El barbero', '¿Me importa ahora?', 'La primera reserva llega el mismo día si comparte el link.'), ('Agendo', 'El barbero', '¿Sé cómo lograrlo?', '3 pasos con barra de avance y plantillas: nunca una pantalla vacía.'),
     ('Agendo', 'El cliente de la barbería', '¿Es para mí?', 'Ve la barbería que ya conoce y sus precios.'), ('Agendo', 'Otro barbero (insignia)', '¿Sé cómo lograrlo?', 'La insignia lo lleva al paso 1 con «Probá gratis».'),
     ('Sol de Casa', 'La familia', '¿Es para mí?', 'Su ahorro, con el nombre de su casa.'), ('Sol de Casa', 'La familia', '¿Hace lo que quiero?', 'Ver cuánto ahorró y contarlo sin buscar el recibo.'), ('Sol de Casa', 'La familia', '¿Me importa ahora?', 'Llega el día 1 del mes, con el ahorro de octubre.'), ('Sol de Casa', 'La familia', '¿Sé cómo lograrlo?', 'Un botón: mandar la tarjeta por WhatsApp.'),
     ('Sol de Casa', 'El vecino', '¿Es para mí?', 'Ve el ahorro de su vecina, alguien como él.'), ('Sol de Casa', 'El vecino', '¿Hace lo que quiero?', 'Calcula su ahorro con lo que paga de luz.'), ('Sol de Casa', 'El vecino', '¿Me importa ahora?', 'Agenda la visita en el mismo momento.'), ('Sol de Casa', 'El vecino', '¿Sé cómo lograrlo?', 'Tres datos y un día. Lo llaman el mismo día, no en 31 horas.')]
h.enc(['Caso', 'Desde', 'Pregunta y respuesta', '¿Pasa?'])
for c, d, q, a in P: h.fila(c, [d, f'{q} {a}', 'Sí'])
ws = wb.create_sheet('Guion de demo'); h = H(ws, {'A': 16, 'B': 110})
h.titulo('Guion de la demostración (3 minutos)', 'Qué problema ataca, el prototipo en vivo, qué número mueve y qué harían si el experimento sale mal.')
G = {'Tueste': ['0:00 · El problema: Meta trae 7 de cada 10 clientes nuevos y la cuenta se cayó 6 horas. El 88 % de los clientes nunca ve el programa de referidos, porque el correo llega antes que el café.',
                '0:30 · En vivo: aviso cuando llega el café → invitar por WhatsApp → página del amigo con $8 aplicados → pagar → aviso a Camila con su barra de avance → panel.',
                '2:00 · El número: referidos por cada 100 clientes, de 6 a 22. Cada uno cuesta como máximo $23,10, menos de la mitad de los $50 de Meta.',
                '2:30 · Si sale mal: si no sube la gente que ve el programa, probamos el aviso con la primera taza (día 4). Si sube pero no compran, cambiamos la página del amigo.'],
     'Agendo': ['0:00 · El problema: 26 de cada 100 se van en la primera pantalla y la mitad de los que terminan no comparte su link. Por eso convierte el 13,9 %.',
                '0:30 · En vivo: anuncio → 3 pasos con plantillas → página lista → WhatsApp → primera reserva → la página del cliente con la insignia nueva → panel.',
                '2:00 · El número: trials con su primera reserva, de 38 % a 55 % en la prueba. Si se cumple la meta completa, el CAC paid baja de $181 a $119 con los mismos anuncios.',
                '2:30 · Si sale mal: si suben los negocios sin datos fiscales al día 14, pedimos los datos el día 10 con un recordatorio. Si no comparten, probamos mandar el link por WhatsApp automático.'],
     'Sol de Casa': ['0:00 · El problema: las 420 familias no reciben nada después de instalar y el 75 % no sabe cuánto ahorró. Hoy entran 0,9 ventas referidas al mes.',
                '0:30 · En vivo: mensaje del mes → Mi ahorro → tarjeta por WhatsApp → calculadora del vecino → agendar → la familia gana su recompensa → panel.',
                '2:00 · El número: ventas de clientes actuales, de 0,9 a 8 al mes. Cada una cuesta $298 con visitas, contra $718 de Meta.',
                '2:30 · Si sale mal: si las 25 familias no traen más leads que las otras 25, probamos los letreros en el mismo barrio, que ya trajeron 6 leads de 20 casas.']}
for k, v in G.items():
    h.seccion(k, 2)
    for x in v: h.fila('', [x])
for w in wb.worksheets:
    for row in w.iter_rows():
        for c in row:
            if c.font is None or c.font.name != AR: c.font = Font(name=AR, size=c.font.size if c.font else 10, bold=c.font.bold if c.font else False, color=c.font.color if c.font else None, italic=c.font.italic if c.font else False)
wb.save(sys.argv[1]); print('ok')
