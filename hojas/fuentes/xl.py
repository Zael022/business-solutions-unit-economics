# -*- coding: utf-8 -*-
"""Utilidades comunes para armar las hojas de cálculo."""
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as L
from openpyxl.chart import LineChart, BarChart, Reference, Series
from openpyxl.formatting.rule import CellIsRule, FormulaRule

F = 'Arial'
AZUL = Font(name=F, color='0000FF')
NEG = Font(name=F, bold=True)
NORMAL = Font(name=F)
TIT = Font(name=F, bold=True, size=14, color='1F3A5F')
SUB = Font(name=F, bold=True, size=11, color='1F3A5F')
GRIS = Font(name=F, color='666666', italic=True, size=9)
BLANCO = Font(name=F, bold=True, color='FFFFFF')
F_INPUT = PatternFill('solid', fgColor='FFF2CC')
F_HEAD = PatternFill('solid', fgColor='1F3A5F')
F_RES = PatternFill('solid', fgColor='E2EFDA')
F_ALERTA = PatternFill('solid', fgColor='F8CBAD')
LINEA = Border(bottom=Side(style='thin', color='C9D3E0'))
WRAP = Alignment(wrap_text=True, vertical='top')

USD = '$#,##0;($#,##0);-'
USD2 = '$#,##0.00;($#,##0.00);-'
PCT = '0.0%;(0.0%);-'
X2 = '0.00"x"'
NUM = '#,##0;(#,##0);-'
NUM1 = '#,##0.0;(#,##0.0);-'
NUM2 = '0.00'


class Hoja:
    def __init__(self, ws):
        self.ws = ws
        self.ref = {}

    def ancho(self, **k):
        for c, w in k.items(): self.ws.column_dimensions[c].width = w

    def titulo(self, fila, texto, sub=None):
        self.ws.cell(fila, 1, texto).font = TIT
        if sub: self.ws.cell(fila + 1, 1, sub).font = GRIS

    def seccion(self, fila, texto):
        self.ws.cell(fila, 1, texto).font = SUB

    def encabezado(self, fila, valores, col=1):
        for i, v in enumerate(valores):
            c = self.ws.cell(fila, col + i, v)
            c.font = BLANCO; c.fill = F_HEAD; c.alignment = Alignment(wrap_text=True, vertical='center')

    def entrada(self, fila, col, valor, fmt=None, clave=None):
        c = self.ws.cell(fila, col, valor)
        c.font = AZUL; c.fill = F_INPUT
        if fmt: c.number_format = fmt
        if clave: self.ref[clave] = f"{L(col)}{fila}"
        return c

    def formula(self, fila, col, f, fmt=None, clave=None, negrita=False):
        c = self.ws.cell(fila, col, f)
        c.font = NEG if negrita else NORMAL
        if fmt: c.number_format = fmt
        if clave: self.ref[clave] = f"{L(col)}{fila}"
        return c

    def texto(self, fila, col, t, font=None, wrap=False):
        c = self.ws.cell(fila, col, t)
        c.font = font or NORMAL
        if wrap: c.alignment = WRAP
        return c


def interp_formula(x, xs, ys):
    """Interpolación lineal en una tabla ordenada (xs, ys rangos absolutos que empiezan en 0)."""
    n = f"MATCH({x},{xs},1)"
    return (f"IF({x}>=MAX({xs}),INDEX({ys},COUNT({xs})),"
            f"INDEX({ys},{n})+({x}-INDEX({xs},{n}))*(INDEX({ys},{n}+1)-INDEX({ys},{n}))/(INDEX({xs},{n}+1)-INDEX({xs},{n})))")


def grafico_lineas(ws, titulo, cats, series, ancla, y_titulo='', x_titulo='Mes', alto=9, ancho=18):
    ch = LineChart()
    ch.title = titulo; ch.y_axis.title = y_titulo; ch.x_axis.title = x_titulo
    ch.height = alto; ch.width = ancho
    for ref, nombre in series:
        s = Series(ref, title=nombre)
        ch.series.append(s)
    ch.set_categories(cats)
    ch.y_axis.majorGridlines = None
    ch.x_axis.delete = False; ch.y_axis.delete = False
    ws.add_chart(ch, ancla)
    return ch
