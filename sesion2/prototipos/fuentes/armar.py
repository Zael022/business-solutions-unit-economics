#!/usr/bin/env python3
"""Arma cada prototipo en dos versiones a partir de fuentes/*.html + base.css + base.js:
- ../publicar/<caso>.html : contenido para publicar como página (el servidor agrega el esqueleto <html>).
- ../<caso>.html          : archivo autónomo para abrir con doble clic (con <!doctype html>)."""
import os, re
AQUI = os.path.dirname(os.path.abspath(__file__)); SALE = os.path.dirname(AQUI)
css = open(os.path.join(AQUI, 'base.css'), encoding='utf-8').read()
js = open(os.path.join(AQUI, 'base.js'), encoding='utf-8').read()
os.makedirs(os.path.join(SALE, 'publicar'), exist_ok=True)
for caso in ['tueste', 'agendo', 'sol-de-casa']:
    src = os.path.join(AQUI, caso + '.html')
    if not os.path.exists(src): continue
    t = open(src, encoding='utf-8').read().replace('/*BASE*/', css).replace('/*BASEJS*/', js)
    open(os.path.join(SALE, 'publicar', caso + '.html'), 'w', encoding='utf-8').write(t)
    titulo = re.search(r'<title>.*?</title>', t).group(0)
    cabeza, cuerpo = t.split('</style>', 1)
    cabeza = cabeza.replace(titulo, '')
    completo = ('<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
                + titulo + cabeza + '</style></head>\n<body>' + cuerpo + '</body></html>\n')
    open(os.path.join(SALE, caso + '.html'), 'w', encoding='utf-8').write(completo)
    print('armado', caso)
