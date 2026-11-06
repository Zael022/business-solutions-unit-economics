#!/bin/sh
# Regenera las cuatro calculadoras a partir de los perfiles. Uso: sh construir-calculadoras.sh [carpeta_salida]
cd "$(dirname "$0")"
OUT="${1:-../calculadoras}"; mkdir -p "$OUT"
node motor/construir.js perfiles/tueste.json "$OUT/calculadora-tueste.html"
node motor/construir.js perfiles/agendo.json "$OUT/calculadora-agendo.html"
node motor/construir.js perfiles/sol-de-casa.json "$OUT/calculadora-sol-de-casa.html"
node motor/construir.js --universal "$OUT/calculadora-universal.html" perfiles/ejemplo-gimnasio.json perfiles/plantilla-ecommerce.json perfiles/plantilla-suscripcion.json perfiles/plantilla-leadgen.json perfiles/tueste.json perfiles/agendo.json perfiles/sol-de-casa.json
