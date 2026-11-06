# -*- coding: utf-8 -*-
"""Agrega la pestaña «Recomendación» (decisión, trampa con números vivos, cambios, supuestos y errores de la IA)."""
from openpyxl import load_workbook
from xl import *

def fila_de(ws, etiqueta):
    for r in range(1, ws.max_row + 1):
        if str(ws.cell(r, 1).value).strip() == etiqueta: return r
    raise KeyError(etiqueta)

CASOS = {
 'Caso_A_Tueste.xlsx': dict(
  decision='No firmar la propuesta de la agencia. Arreglar antes de escalar.',
  numeros=[('ROAS que reporta Ads Manager', 'ROAS de Ads Manager (lo que reporta Meta)', 'B', X2), ('ROAS real del primer pedido (hoy)', 'ROAS real del primer pedido de los clientes nuevos', 'B', X2),
           ('ROAS de break-even del pedido', 'ROAS de break-even del pedido suelto', 'B', X2), ('LTV:CAC hoy', 'LTV:CAC', 'B', X2), ('LTV:CAC con la agencia', 'LTV:CAC', 'C', X2),
           ('LTV:CAC con la propuesta (pack + $4.000)', 'LTV:CAC', 'D', X2), ('Payback hoy (meses)', 'Payback (meses para recuperar el CAC)', 'B', NUM), ('Payback con la propuesta (meses)', 'Payback (meses para recuperar el CAC)', 'D', NUM)],
  trampa='El ROAS de 3,0 de Ads Manager: Meta se atribuye el 86 % de las ventas de la tienda (recompras y retargeting incluidos). Contando solo el primer pedido de los clientes nuevos, el ROAS real queda muy debajo del break-even (filas de arriba).',
  cambios=['Pack de 3 bolsas a $48 con envío gratis solo desde $45 (supuesto propio: la mitad de los pedidos sueltos lo elige).', 'Bajar a $4.000 mientras se prueba el pack y apagar primero el retargeting a compradores; volver a $8.000 cuando el pack funcione (plan 4 y 5 del nivel 3).'],
  ia=['La fila «¿Cada cliente extra deja plata?» decía «Sí» con 65 clientes menos: comparaba con el valor absoluto del CAC marginal. Se corrigió.', 'El nivel 1 recomendaba $4.000 y el nivel 3 encontraba más caja con $8.000: se unificó en un camino ($4.000 mientras se prueba, $8.000 después).', 'La revisión de reglas del simulador no miraba el rango $0–$20.000. Se agregó.']),
 'Caso_B_Agendo.xlsx': dict(
  decision='Valeria no tiene razón todavía: no triplicar. Primero el plan anual y el precio, después escalar de a poco.',
  numeros=[('LTV:CAC de la lámina de Valeria', 'LTV:CAC de la lámina de Valeria', 'B', X2), ('LTV:CAC blended (hoy)', 'LTV:CAC blended', 'B', X2), ('LTV:CAC paid (hoy)', 'LTV:CAC paid (el que sirve para decidir sobre anuncios)', 'B', X2),
           ('LTV:CAC paid con $30.000 (historial)', 'LTV:CAC paid (el que sirve para decidir sobre anuncios)', 'C', X2), ('LTV:CAC paid de la propuesta', 'LTV:CAC paid (el que sirve para decidir sobre anuncios)', 'E', X2),
           ('CAC marginal con $30.000', 'CAC marginal frente a hoy', 'C', USD2), ('Payback hoy (meses)', 'Payback del cliente del escenario (meses)', 'B', NUM), ('Payback de la propuesta (meses)', 'Payback del cliente del escenario (meses)', 'E', NUM)],
  trampa='El LTV:CAC de 2,4 usa el CAC blended, que mezcla 50 clientes orgánicos gratis. Para decidir sobre anuncios vale el CAC paid. El costo por registro de $20 es el de un trial, no el de un cliente.',
  cambios=['Ofrecer el plan anual durante el trial para llegar al 40 % de los clientes nuevos (supuesto propio): el prepago devuelve el CAC el primer mes.', 'Subir el plan mensual a $29, todavía debajo de CitaYa ($35), suponiendo que la cancelación no cambia (supuesto propio).'],
  ia=['La revisión de reglas del simulador solo miraba el piso de caja y no el rango $0–$30.000. Se agregó.', 'La transcripción automática de la clase dice «6.150 negocios»; el PDF dice 1.150. Se usó el PDF.']),
 'Caso_C_Sol_de_Casa.xlsx': dict(
  decision='Rechazar la propuesta de Leadly. Arreglar el embudo de Meta y sumar capacidad de visitas.',
  numeros=[('El lead de Meta es N veces más barato', 'LA TRAMPA: el lead de Meta es N veces más barato…', 'B', X2), ('…pero el cliente de Meta cuesta este % más', '…pero el cliente de Meta cuesta este % más', 'B', PCT),
           ('Ventas al mes hoy', 'Ventas totales', 'B', NUM1), ('Ventas al mes con la agencia (historial)', 'Ventas totales', 'C', NUM1), ('Ventas al mes con la propuesta', 'Ventas totales', 'E', NUM1),
           ('LTV:CAC de Meta hoy', 'Meta · LTV:CAC', 'B', X2), ('LTV:CAC de Meta con la propuesta', 'Meta · LTV:CAC', 'E', X2)],
  trampa='El costo por lead: el lead de Meta es 5 veces más barato, pero el cliente de Meta cuesta 34 % más, porque contesta menos y hacen falta más visitas por venta.',
  cambios=['Llamar en menos de 5 minutos y filtrar el formulario de Meta (supuesto 7 del caso).', 'Contratar técnicos extra para pasar de 100 a 150 o 200 visitas (el plan 5 contrata en los meses 1 y 2).'],
  ia=['La IA presentó como mejor un plan de inversión fija ($649.095); probando caminos con el mismo modelo apareció uno mejor ($681.010, plan 5).', 'El payback en caja se contaba desde el mes siguiente a la firma; se unificó con los otros casos (firma = mes 1, payback = mes 2).', 'La revisión de reglas no miraba el máximo de 2 técnicos ni los rangos de inversión por canal. Se agregaron.']),
}
for f, c in CASOS.items():
    wb = load_workbook(f)
    if 'Recomendación' in wb.sheetnames: del wb['Recomendación']
    ws = wb.create_sheet('Recomendación', 2); H = Hoja(ws); H.ancho(A=58, B=16, C=70)
    H.titulo(1, 'Recomendación', 'Los números de esta pestaña salen de «Resultados»: si cambian los supuestos, cambian solos.')
    H.texto(3, 1, c['decision'], SUB)
    H.texto(5, 1, 'La trampa', SUB); H.texto(6, 1, c['trampa'], wrap=True)
    res = wb['Resultados']; r = 8
    H.encabezado(r, ['Número', 'Valor']); r += 1
    for etq, fila, col, fmt in c['numeros']:
        H.texto(r, 1, etq); H.formula(r, 2, f"=Resultados!{col}{fila_de(res, fila)}", fmt, None, True); r += 1
    r += 1; H.texto(r, 1, 'Los dos cambios', SUB); r += 1
    for t in c['cambios']: H.texto(r, 1, '• ' + t, wrap=True); r += 1
    r += 1; H.texto(r, 1, 'El detalle, los planes de 24 meses y el pitch están en el PDF de la recomendación.', GRIS); r += 2
    H.texto(r, 1, 'En qué se equivocó o nos confundió la IA', SUB); r += 1
    for t in c['ia']: H.texto(r, 1, '• ' + t, wrap=True); r += 1
    H.texto(r, 1, 'Ejemplo del equipo (qué dijo la IA, por qué estaba mal y cómo lo corrigieron):', NEG); H.entrada(r + 1, 1, '')
    for rr in range(6, r + 2): ws.row_dimensions[rr].height = 30 if ws.cell(rr, 1).alignment.wrap_text else None
    wb.save(f)
print('ok')
