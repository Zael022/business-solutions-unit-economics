#!/bin/sh
# Corre las tres baterías de pruebas. Uso: sh pruebas/correr-todo.sh [ruta/a/recalc.py]
# Requiere Node; para Excel, Python con openpyxl y LibreOffice; para HTML, Playwright con Chromium.
cd "$(dirname "$0")/.."
echo "== Motor =="; node pruebas/pruebas-motor.js | tail -1
echo "== Excel =="; python3 pruebas/verificar_excel.py ../hojas "$1" | tail -2
echo "== Calculadoras HTML =="; node pruebas/verificar_html.js ../calculadoras | tail -1
echo "== Growth (Sesión 2) =="; node pruebas/pruebas-growth.js | tail -1
echo "== Prototipos (Sesión 2) =="; node pruebas/verificar_prototipos.js ../sesion2/prototipos | tail -1
