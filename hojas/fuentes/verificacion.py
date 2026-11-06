# -*- coding: utf-8 -*-
"""Agrega la hoja 'Verificación' (cuentas a mano) a cada libro."""
from openpyxl import load_workbook
from xl import *

V = {
 'Caso_A_Tueste.xlsx': [
   ('Nivel 1 · CAC real (hoy)', '(inversión + fee) ÷ clientes nuevos de Meta = (8.000 + 1.000) ÷ 165', 9000 / 165, "Resultados!B29"),
   ('Nivel 1 · Contribución de un pedido suelto', '34 − 2 × 5,44 − 4,50 − 4,5 % × 34 − 1,20 = 34 − 10,88 − 4,50 − 1,53 − 1,20', 34 - 10.88 - 4.5 - 1.53 - 1.2, "Resultados!B7"),
   ('Nivel 1 · LTV del suscriptor', '12,643 × (1 − 0,91¹²) ÷ 0,09 = 12,643 × 7,528', 12.643 * (1 - 0.91 ** 12) / 0.09, "Resultados!B40"),
   ('Nivel 3 · Mes 1, clientes nuevos', '165 de Meta + 47 que no vienen de Meta', 212, "'Plan 1'!D6"),
   ('Nivel 3 · Mes 1, contribución de los clientes actuales', '9.000 (dato)', 9000, "'Plan 1'!E6"),
   ('Nivel 3 · Mes 1, contribución del grupo nuevo', '212 × 0,85 × 1 × 15,89 + 212 × 0,15 × 12,643 = 2.863,4 + 402,0', 212 * 0.85 * 15.89 + 212 * 0.15 * 12.643, "'Plan 1'!F6"),
   ('Nivel 3 · Mes 1, salidas', '8.000 de Meta + 1.000 de fee + 6.500 fijos', 15500, "'Plan 1'!G6"),
   ('Nivel 3 · Mes 1, caja final', '35.000 + 9.000 + 3.265,4 − 15.500', 35000 + 9000 + 212 * 0.85 * 15.89 + 212 * 0.15 * 12.643 - 15500, "'Plan 1'!H6"),
 ],
 'Caso_B_Agendo.xlsx': [
   ('Nivel 1 · CAC paid (hoy)', '(10.000 + 1 × 1.200 + 70 × 20) ÷ 70 = 12.600 ÷ 70', 180, "Resultados!B16"),
   ('Nivel 1 · CAC blended (hoy)', '12.600 ÷ (70 + 50)', 105, "Resultados!B17"),
   ('Nivel 1 · LTV a 24 meses', '19,5 × (1 − 0,94²⁴) ÷ 0,06 = 19,5 × 12,892', 19.5 * (1 - 0.94 ** 24) / 0.06, "Resultados!B21"),
   ('Nivel 3 · Mes 1, trials', '$10.000 → 500 trials (historial)', 500, "'Plan 1'!C6"),
   ('Nivel 3 · Mes 1, vendedoras', '500 ÷ 500 = 1', 1, "'Plan 1'!D6"),
   ('Nivel 3 · Mes 1, clientes nuevos', '500 × 14 % + 50 orgánicos = 70 + 50', 120, "'Plan 1'!F6"),
   ('Nivel 3 · Mes 1, clientes activos', '1.150 × 0,94 + 120 = 1.081 + 120', 1201, "'Plan 1'!K6"),
   ('Nivel 3 · Mes 1, entradas', '1.201 × 19,50', 1201 * 19.5, "'Plan 1'!L6"),
   ('Nivel 3 · Mes 1, salidas', '10.000 + 1.200 + 70 × 20 + 14.000', 26600, "'Plan 1'!M6"),
   ('Nivel 3 · Mes 1, caja final', '60.000 + 23.419,5 − 26.600', 56819.5, "'Plan 1'!N6"),
 ],
 'Caso_C_Sol_de_Casa.xlsx': [
   ('Nivel 1 · Contribución de una venta', '6.500 × 28 % − 3 % × 6.500 = 1.820 − 195', 1625, "Resultados!B8"),
   ('Nivel 1 · CAC real de Meta (hoy)', '(4.000 + 57,75 visitas × 60) ÷ 10,395 ventas = 7.465 ÷ 10,395', 7465 / 10.395, "Resultados!B39"),
   ('Nivel 1 · CAC real de Google (hoy)', '(4.000 + 39,74 × 60) ÷ 11,92 = 6.384,4 ÷ 11,92', (4000 + 100 * .85 * .55 * .85 * 60) / (100 * .85 * .55 * .85 * .30), "Resultados!B40"),
   ('Nivel 3 · Mes 1, visitas pedidas', 'Meta 500 × 0,55 × 0,30 × 0,70 = 57,75; Google 100 × 0,85 × 0,55 × 0,85 = 39,74', 57.75 + 39.7375, "'Plan 1'!J6"),
   ('Nivel 3 · Mes 1, ventas', '57,75 × 18 % + 39,74 × 30 % = 10,40 + 11,92', 57.75 * .18 + 39.7375 * .30, "'Plan 1'!N6"),
   ('Nivel 3 · Mes 1, entradas', '3.250 × 22,32 ventas del mes + 3.250 × 22 ventas del mes 0', 3250 * (57.75 * .18 + 39.7375 * .30) + 3250 * 22, "'Plan 1'!O6"),
   ('Nivel 3 · Mes 1, salidas', '3.770 × 22,32 + 1.105 × 22 + 60 × 97,49 + 8.000 + 18.000', 3770 * (57.75 * .18 + 39.7375 * .30) + 1105 * 22 + 60 * 97.4875 + 26000, "'Plan 1'!P6"),
   ('Nivel 3 · Mes 1, caja final', '12.000 + entradas − salidas', None, "'Plan 1'!Q6"),
 ],
}
for f, filas in V.items():
    wb = load_workbook(f)
    if 'Verificación' in wb.sheetnames: del wb['Verificación']
    ws = wb.create_sheet('Verificación', 4); H = Hoja(ws); H.ancho(A=46, B=70, C=15, D=15, E=14, F=14)
    H.titulo(1, 'Verificación a mano', 'Rehagan estas cuentas con la calculadora del celular y escriban el resultado en la columna amarilla «Su cuenta».')
    H.encabezado(3, ['Qué se verifica', 'Cuenta escrita', 'Resultado a mano', 'Su cuenta', 'Modelo', '¿Coincide?'])
    for i, (q, cuenta, val, ref) in enumerate(filas):
        r = 4 + i
        H.texto(r, 1, q, NEG); H.texto(r, 2, cuenta, wrap=True)
        if val is None:
            H.formula(r, 3, f"=12000+C{r - 2}-C{r - 1}", USD2)
        else:
            H.texto(r, 3, round(val, 2)).number_format = '#,##0.00'
        H.entrada(r, 4, None, '#,##0.00')
        H.formula(r, 5, f"={ref}", '#,##0.00')
        H.formula(r, 6, f"=IF(ABS(C{r}-E{r})<=MAX(0.01,0.001*ABS(E{r})),\"Sí\",\"REVISAR\")", None, None, True)
    wb.save(f)
print('ok')
