#!/usr/bin/env python3
"""Compara el motor (JS) con las hojas de Excel recalculadas y con el modelo de referencia en Python.
También cambia un supuesto en una copia de cada hoja, la recalcula con LibreOffice y verifica que
hoja y motor se muevan igual.  Uso: python3 pruebas/verificar_excel.py <carpeta_hojas> [recalc.py]"""
import json, os, shutil, subprocess, sys, tempfile
from openpyxl import load_workbook

AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.dirname(AQUI)
HOJAS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(RAIZ, '..', 'hojas')
RECALC = sys.argv[2] if len(sys.argv) > 2 else None
sys.path.insert(0, AQUI)
import referencia_python as ref  # noqa: E402

ok = mal = 0; fallas = []
def cerca(nombre, a, b, tol=0.001):
    """tol relativa (0,1 %), más estricta que el 1 % que pide el reto."""
    global ok, mal
    if a is None or b is None or isinstance(a, str) or isinstance(b, str):
        pasa = (a in (None, '—') or isinstance(a, str)) and b is None
    else:
        pasa = abs(a - b) <= tol * max(1.0, abs(b))
    if pasa: ok += 1
    else: mal += 1; fallas.append(nombre)
    print(f"{'PASA ' if pasa else 'FALLA'} {nombre}: hoja/ref={a} motor={b}")

def motor(perfil, cambios=None):
    r = subprocess.run(['node', os.path.join(AQUI, 'exportar.js'), os.path.join(RAIZ, 'perfiles', perfil), json.dumps(cambios or {})], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)

def filas(ws):
    return {str(ws.cell(r, 1).value).strip(): r for r in range(1, ws.max_row + 1) if ws.cell(r, 1).value is not None}

def num(v):
    return v if isinstance(v, (int, float)) else None

CASOS = {
  'A': dict(xlsx='Caso_A_Tueste.xlsx', perfil='tueste.json', escs=['hoy', 'agencia', 'propuesta'], caja='H', resumen=('C', 'D', 'E', 'F'),
            filas=[('Contribución promedio de un pedido suelto', 'contribPedido'), ('Contribución promedio del primer pedido', 'contribPrimer'), ('Clientes nuevos de Meta (historial)', 'pagados'),
                   ('CAC de anuncios', 'cacAnuncios'), ('CAC real', 'cacReal'), ('ROAS real del primer pedido de los clientes nuevos', 'roasReal'), ('LTV del cliente de pedidos sueltos', 'ltvSuelto'),
                   ('LTV del suscriptor', 'ltvSub'), ('LTV promedio', 'ltv'), ('LTV:CAC', 'ltvCac'), ('Payback (meses para recuperar el CAC)', 'payback'), ('CAC marginal frente a hoy', 'marginal')],
            mes1=[('D6', 'nuevos'), ('E6', 'baseDecae'), ('F6', 'contribNuevos'), ('G6', 'salidas'), ('H6', 'caja')]),
  'B': dict(xlsx='Caso_B_Agendo.xlsx', perfil='agendo.json', escs=['hoy', 'valeria', 'valeria_cte', 'propuesta'], caja='N', resumen=('C', 'D', 'G', 'F'),
            filas=[('Trials por anuncios', 'tope0'), ('Vendedoras necesarias', 'vendedoras'), ('Clientes nuevos de anuncios', 'pagados'), ('Costo total de adquisición', 'total'),
                   ('CAC paid (solo clientes de anuncios)', 'cacReal'), ('CAC blended (mezcla con orgánicos)', 'cacBlended'), ('LTV a 24 meses del cliente mensual', 'ltvMensual'),
                   ('LTV sin tope de meses (solo para comparar)', 'ltvSinTope'), ('LTV a 24 meses del cliente anual', 'ltvPrepago'), ('LTV promedio del escenario', 'ltv'), ('LTV:CAC blended', 'ltvCacBlended'),
                   ('LTV:CAC paid (el que sirve para decidir sobre anuncios)', 'ltvCac'), ('Payback del cliente del escenario (meses)', 'payback'), ('CAC marginal frente a hoy', 'marginal'),
                   ('Caja que queda atrapada cada mes (sale y no vuelve ese mes)', 'atrapada')],
            mes1=[('C6', 'tope'), ('F6', 'nuevos'), ('K6', 'activos'), ('L6', 'entradas'), ('M6', 'salidas'), ('N6', 'caja')]),
  'C': dict(xlsx='Caso_C_Sol_de_Casa.xlsx', perfil='sol-de-casa.json', escs=['hoy', 'agencia', 'agencia_cpl', 'propuesta'], caja='Q', resumen=('C', 'D', 'E', 'F'),
            filas=[('Leads de Meta', 'c0.leads'), ('Visitas pedidas en total', 'pedidas'), ('Visitas hechas de Google', 'c1.hechas'), ('Visitas hechas de Meta', 'c0.hechas'), ('Ventas de Meta', 'c0.ventas'),
                   ('Ventas de Google', 'c1.ventas'), ('Ventas totales', 'pagados'), ('Meta · CPL', 'c0.cpl'), ('Meta · CAC de anuncios', 'c0.cacAnuncios'), ('Meta · CAC real', 'c0.cacReal'),
                   ('Google · CAC real', 'c1.cacReal'), ('CAC real total', 'cacReal'), ('Meta · LTV:CAC', 'c0.ltvCac'), ('Google · LTV:CAC', 'c1.ltvCac'), ('Meta · valor de una visita', 'c0.valorVisita'),
                   ('Google · valor de una visita', 'c1.valorVisita'), ('…pero el cliente de Meta cuesta este % más', 'cacMasCaro'),
                   ('Contribución del mes después de marketing, visitas y técnicos', 'resultadoMes'), ('Mes en que se recupera el cliente (payback en caja)', 'payback')],
            mes1=[('J6', 'pedidas'), ('N6', 'clientesPagados'), ('O6', 'entradas'), ('P6', 'salidas'), ('Q6', 'caja')]),
}

def valor(e, clave):
    if clave == 'tope0': return e['tope'][0]
    if clave.startswith('c0.') or clave.startswith('c1.'):
        c = e['canales'][int(clave[1])]; v = c[clave[3:]]
        return v if (c['ventas'] or 0) > 1e-9 or clave.endswith(('leads', 'hechas', 'ventas', 'valorVisita')) else None
    return e.get(clave)

def comparar(caso, wb, M, sufijo=''):
    cfg = CASOS[caso]; ws = wb['Resultados']; idx = filas(ws)
    for etq, clave in cfg['filas']:
        r = idx.get(etq)
        if r is None: cerca(f'{caso}{sufijo} · fila «{etq}» existe en la hoja', None, 0); continue
        for j, esc in enumerate(cfg['escs']):
            v = ws.cell(r, 2 + j).value
            e = valor(M['escenarios'][esc], clave)
            if clave == 'cacMasCaro' and esc != 'hoy': continue
            if clave == 'marginal' and esc == 'hoy': continue
            cerca(f'{caso}{sufijo} · {etq} · {esc}', num(v) if num(v) is not None else (None if v in ('—', None) or isinstance(v, str) else v), e)
    # planes: resumen y caja de los 24 meses
    P = wb['Planes']
    for i, pl in enumerate(M['planes']):
        cmin, mes, cfin, act = (P[f'{c}{4 + i}'].value for c in cfg['resumen'])
        cerca(f'{caso}{sufijo} · {pl["nombre"][:40]} · caja mínima', cmin, pl['cajaMin'])
        cerca(f'{caso}{sufijo} · {pl["nombre"][:40]} · caja mes 24', cfin, pl['cajaFinal'])
        cerca(f'{caso}{sufijo} · {pl["nombre"][:40]} · ' + ('instalaciones' if caso == 'C' else 'activos mes 24'), act, pl['clientesTotal'] if caso == 'C' else pl['activosFinal'])
        hoja = wb[f'Plan {i + 1}']
        dif = max(abs(hoja[f"{cfg['caja']}{6 + t}"].value - pl['caja'][t]) for t in range(24))
        cerca(f'{caso}{sufijo} · {pl["nombre"][:40]} · máxima diferencia de caja en los 24 meses', dif, 0.0, tol=0.01)
    h1 = wb['Plan 1']
    for celda, clave in cfg['mes1']:
        cerca(f'{caso}{sufijo} · mes 1 del plan 1 · {clave} ({celda})', h1[celda].value, M['planes'][0]['mes1'][clave])

def recalcular(ruta):
    if not RECALC: return False
    r = subprocess.run([sys.executable, RECALC, ruta, '120'], capture_output=True, text=True)
    d = json.loads(r.stdout or '{}'); return d.get('status') == 'success'

print('## 1. Motor frente a las hojas de Excel (datos del caso)')
for caso, cfg in CASOS.items():
    wb = load_workbook(os.path.join(HOJAS, cfg['xlsx']), data_only=True)
    comparar(caso, wb, motor(cfg['perfil']))
    v = wb['Verificación']
    for r in range(4, v.max_row + 1):
        if v.cell(r, 1).value: cerca(f'{caso} · hoja Verificación · {v.cell(r, 1).value}', v.cell(r, 6).value == 'Sí' and 1.0 or 0.0, 1.0)

print('\n## 2. Las hojas recalculan solas al cambiar un supuesto (y el motor se mueve igual)')
CAMBIOS = {'A': ({'B8': 5.5}, {'envio': 5.5}), 'B': ({'B8': 0.08, 'B45': 0.08, 'C45': 0.08, 'D45': 0.08, 'E45': 0.08}, {'churn': 0.08}), 'C': ({'B22': 0.65}, {'m_contacto': 0.65})}
if RECALC:
    tmp = tempfile.mkdtemp()
    for caso, cfg in CASOS.items():
        dst = os.path.join(tmp, cfg['xlsx']); shutil.copy(os.path.join(HOJAS, cfg['xlsx']), dst)
        wb = load_workbook(dst)
        for celda, v in CAMBIOS[caso][0].items(): wb['Supuestos'][celda] = v
        wb.save(dst)
        if not recalcular(dst): cerca(f'{caso} · recálculo con LibreOffice', 0.0, 1.0); continue
        comparar(caso, load_workbook(dst, data_only=True), motor(cfg['perfil'], CAMBIOS[caso][1]), sufijo=f' (con {CAMBIOS[caso][1]})')
else:
    print('PENDIENTE: no se pasó la ruta de recalc.py; no se ejecutó la prueba de recálculo.')

print('\n## 3. Motor frente al modelo de referencia independiente en Python')
MA = motor('tueste.json'); MB = motor('agendo.json'); MC = motor('sol-de-casa.json')
for esc, kw in [('hoy', {}), ('agencia', dict(inv=16000, desc=0.3)), ('propuesta', dict(inv=4000, pack=0.5))]:
    r = ref.a_escenario(**kw)
    for k1, k2 in [('cac_real', 'cacReal'), ('ltv', 'ltv'), ('ltv_cac', 'ltvCac'), ('payback', 'payback'), ('roas_real', 'roasReal')]:
        cerca(f'A · ref Python · {esc} · {k1}', r[k1], MA['escenarios'][esc][k2])
for esc, kw in [('hoy', {}), ('valeria', dict(inv=30000)), ('valeria_cte', dict(inv=30000, trials=1500))]:
    r = ref.b_escenario(**kw)
    for k1, k2 in [('cac_paid', 'cacReal'), ('cac_bl', 'cacBlended'), ('ltv24', 'ltv'), ('payback', 'payback'), ('vend', 'vendedoras')]:
        cerca(f'B · ref Python · {esc} · {k1}', r[k1], MB['escenarios'][esc][k2])
for esc, kw in [('hoy', {}), ('agencia', dict(meta=8000, goo=0)), ('agencia_cpl', dict(meta=8000, goo=0, leads_meta=1000)), ('propuesta', dict(mejora=True, cap=150))]:
    r = ref.c_escenario(**kw)
    cerca(f'C · ref Python · {esc} · ventas', r['ventas'], MC['escenarios'][esc]['pagados'])
    cerca(f'C · ref Python · {esc} · CAC real total', r['cac_real_total'], MC['escenarios'][esc]['cacReal'])
sims = {'A': (MA, [ref.a_sim([8000] * 24), ref.a_sim([16000] * 24), ref.a_sim([4000] * 24), ref.a_sim([4000] * 3 + [8000] * 21, pack_desde=1, pack=0.5), ref.a_sim([8000] * 24, pack_desde=1, pack=0.5)]),
        'B': (MB, [ref.b_sim([10000] * 24), ref.b_sim([30000] * 24), ref.b_sim([15000] * 18 + [27000] * 6), ref.b_sim([23000] * 12 + [30000] * 12, anual=0.4, anual_desde=1)]),
        'C': (MC, [ref.c_sim([4000] * 24, [4000] * 24), ref.c_sim([8000] * 24, [0] * 24), ref.c_sim([6000] * 24, [8000] * 24, [0] + [1] * 23), ref.c_sim([7000] * 24, [6000] * 24, [0, 1] + [2] * 22, mejora_desde=1),
                   ref.c_sim([4000] * 2 + [7000] * 22, [6000] * 24, [1] + [2] * 23, mejora_desde=1)])}
for caso, (M, lst) in sims.items():
    for pl, f in zip(M['planes'], lst):
        cerca(f'{caso} · ref Python · {pl["nombre"][:45]} · caja mes 24', f[-1]['caja'], pl['cajaFinal'])

print(f'\nRESULTADO: {ok} pasan, {mal} fallan.' + ('\nFallan: ' + ' | '.join(fallas) if fallas else ''))
sys.exit(1 if mal else 0)
