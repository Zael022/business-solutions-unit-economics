# -*- coding: utf-8 -*-
"""Modelos de referencia de los tres casos (para verificar las hojas y buscar el mejor plan del nivel 3)."""
import math

def interp(x, pts):
    """Interpolación lineal sobre puntos ordenados [(x, y)], incluyendo (0, 0)."""
    if x <= pts[0][0]: return pts[0][1]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if x <= x1: return y0 + (x - x0) * (y1 - y0) / (x1 - x0)
    return pts[-1][1]

# =============================== CASO A · TUESTE ===============================
A = dict(precio=17, bolsas=2, cafe_bolsa=5.44, envio=4.50, pasarela=0.045, caja=1.20, desc_sub=0.10,
         pct_sub=0.15, churn=0.09, fee=1000, pack_precio=48, pack_caja=1.40, pack_bolsas=3)
A_ORD = [1.00, .15, .20, .20, .20, .20, .20, .15, .15, .15, .20, .20]
A_HIST = [(0, 0), (4000, 100), (8000, 165), (12000, 210), (16000, 235), (20000, 250)]

def a_contrib(paga, bolsas=2, envio=None, caja=None, p=A):
    envio = p['envio'] if envio is None else envio
    caja = p['caja'] if caja is None else caja
    return paga - bolsas * p['cafe_bolsa'] - envio - p['pasarela'] * paga - caja

def a_escenario(inv=8000, desc=0.0, pct_sub=0.15, pack=0.0, fee=1000, clientes=None, p=A):
    """pack = fracción de pedidos sueltos que pasan a ser pack de 3 a $48 (y los de 2 bolsas pagan envío)."""
    lista = p['precio'] * p['bolsas']
    c_suelto_2 = a_contrib(lista, 2, envio=(0 if pack == 0 else 0) + (p['envio'] if pack == 0 else 0))
    # con el pack: los pedidos de 2 bolsas pagan su envío (Tueste no lo paga)
    c2 = a_contrib(lista, 2) if pack == 0 else a_contrib(lista, 2, envio=0)
    c3 = a_contrib(p['pack_precio'], 3, envio=p['envio'], caja=p['pack_caja'])
    c_suelto = (1 - pack) * c2 + pack * c3
    c_primer = (1 - pack) * a_contrib(lista * (1 - desc), 2, envio=(p['envio'] if pack == 0 else 0)) + pack * a_contrib(p['pack_precio'] * (1 - desc), 3, envio=p['envio'], caja=p['pack_caja'])
    sub_paga = lista * (1 - p['desc_sub'])
    c_sub = a_contrib(sub_paga, 2)
    clientes = clientes if clientes is not None else interp(inv, A_HIST)
    cac_ads = inv / clientes
    cac_real = (inv + (fee if inv > 0 else 0)) / clientes
    ltv_suelto = c_primer + c_suelto * (sum(A_ORD) - 1)
    ltv_sub = sum(c_sub * (1 - p['churn']) ** k for k in range(12))
    ltv = (1 - pct_sub) * ltv_suelto + pct_sub * ltv_sub
    # curva de caja de un cliente promedio, mes 0 = -CAC real
    curva = [-cac_real]
    for m in range(1, 13):
        cs = (c_primer if m == 1 else c_suelto * A_ORD[m - 1])
        curva.append(curva[-1] + (1 - pct_sub) * cs + pct_sub * c_sub * (1 - p['churn']) ** (m - 1))
    payback = next((m for m, v in enumerate(curva) if v >= 0), None)
    roas_real = clientes * lista * (1 - desc * (1 - pct_sub)) / inv if inv else None
    return dict(c2=c2, c3=c3, c_suelto=c_suelto, c_primer=c_primer, c_sub=c_sub,
                pct_c_suelto=c2 / lista, roas_be=lista / c2, roas_be_sub=sub_paga / c_sub,
                roas_be_desc=(lista * (1 - desc)) / a_contrib(lista * (1 - desc), 2) if desc else None,
                clientes=clientes, cac_ads=cac_ads, cac_real=cac_real, ltv_suelto=ltv_suelto, ltv_sub=ltv_sub,
                ltv=ltv, ltv_cac=ltv / cac_real, curva=curva, payback=payback, roas_real=roas_real)

def a_sim(plan, pack_desde=None, pack=0.0, pct_sub=0.15, sub_desde=None):
    """plan: lista de 24 inversiones. Devuelve filas mensuales."""
    c2 = a_contrib(34, 2); c_sub = a_contrib(30.6, 2)
    c3 = a_contrib(48, 3, envio=4.5, caja=1.4)
    caja = 35000.0; filas = []; cohortes = []  # (mes_llegada, nuevos, pct_sub, pack)
    for t in range(1, 25):
        inv = plan[t - 1]
        nuevos = interp(inv, A_HIST) + 47
        ps = pct_sub if (sub_desde and t >= sub_desde) else 0.15
        pk = pack if (pack_desde and t >= pack_desde) else 0.0
        cohortes.append((t, nuevos, ps, pk))
        actuales = 9000 * 0.97 ** (t - 1)
        contrib_new = 0.0; subs_activos = 0.0
        for (s, n, ps_, pk_) in cohortes:
            edad = t - s + 1
            ords = A_ORD[edad - 1] if edad <= 12 else 0.10
            cs = (1 - pk_) * (c2 if pk_ == 0 else a_contrib(34, 2, envio=0)) + pk_ * c3
            contrib_new += n * (1 - ps_) * ords * cs + n * ps_ * c_sub * 0.91 ** (edad - 1)
            subs_activos += n * ps_ * 0.91 ** (edad - 1)
        salidas = inv + (1000 if inv > 0 else 0) + 6500
        caja = caja + actuales + contrib_new - salidas
        filas.append(dict(mes=t, inv=inv, nuevos=nuevos, actuales=actuales, nuevos_contrib=contrib_new,
                          salidas=salidas, caja=caja, subs=subs_activos))
    return filas

def a_valido(plan):
    prom = sum(plan[:12]) / 12
    return all(x >= prom - 1e-9 for x in plan[12:])

# =============================== CASO B · AGENDO ===============================
B_HIST = [(0, 0), (5000, 290), (10000, 500), (15000, 650), (20000, 760), (30000, 900)]

def b_escenario(inv=10000, conv=0.14, precio=25, mb=0.78, churn=0.06, comision=20, sueldo=1200, cap=500,
                organicos=50, trials=None):
    trials = trials if trials is not None else interp(inv, B_HIST)
    vend = math.ceil(trials / cap - 1e-9) if trials > 0 else 0
    cli = trials * conv
    costo = inv + vend * sueldo + cli * comision
    m = precio * mb
    ltv24 = sum(m * (1 - churn) ** k for k in range(24))
    ltv_sin = m / churn
    cac_paid = costo / cli; cac_bl = costo / (cli + organicos)
    curva = [-cac_paid]
    for k in range(24): curva.append(curva[-1] + m * (1 - churn) ** k)
    payback = next((i for i, v in enumerate(curva) if v >= 0), None)
    return dict(trials=trials, vend=vend, cli=cli, costo=costo, margen=m, ltv24=ltv24, ltv_sin=ltv_sin,
                cac_paid=cac_paid, cac_bl=cac_bl, lc_paid=ltv24 / cac_paid, lc_bl=ltv24 / cac_bl,
                curva=curva, payback=payback)

def b_sim(plan, conv=0.14, anual=0.0, anual_desde=None, conv_desde=None, conv_base=0.14):
    caja = 60000.0; act_m = 1150.0; filas = []; anual_new = []
    m = 25 * 0.78; m_an = 240 * 0.78
    for t in range(1, 25):
        inv = plan[t - 1]
        tr = interp(inv, B_HIST)
        vend = math.ceil(tr / 500 - 1e-9) if tr > 0 else 0
        cv = conv if (conv_desde and t >= conv_desde) else conv_base
        cli_ads = tr * cv
        nuevos = cli_ads + 50
        a = anual if (anual_desde and t >= anual_desde) else 0.0
        an = nuevos * a; mn = nuevos - an
        anual_new.append(an)
        act_m = act_m * 0.94 + mn
        renov = 0.7 * anual_new[t - 13] if t > 12 else 0.0
        act_an = sum(anual_new[max(0, t - 12):t]) + (0.7 * sum(anual_new[max(0, t - 24):t - 12]) if t > 12 else 0)
        entradas = act_m * m + (an + renov) * m_an
        salidas = inv + vend * 1200 + 20 * cli_ads + 14000
        caja += entradas - salidas
        filas.append(dict(mes=t, inv=inv, trials=tr, vend=vend, nuevos=nuevos, activos=act_m + act_an,
                          entradas=entradas, salidas=salidas, caja=caja))
    return filas

# =============================== CASO C · SOL DE CASA ===============================
C_META = [(0, 0), (2000, 280), (4000, 500), (6000, 680), (8000, 840), (10000, 960)]
C_GOO = [(0, 0), (2000, 55), (4000, 100), (6000, 135), (8000, 160)]
C_TASAS = dict(meta=(0.55, 0.30, 0.70, 0.18), google=(0.85, 0.55, 0.85, 0.30))
C_TASAS_MEJOR = (0.80, 0.40, 0.75, 0.22)

def c_contrib(precio=6500, mb=0.28, com=0.03, bat=0.0):
    return precio * mb - com * precio + bat * (3000 * 0.20 - 0.03 * 3000)

def c_escenario(meta=4000, goo=4000, cap=100, mejora=False, bat=0.0, leads_meta=None, leads_goo=None):
    lm = leads_meta if leads_meta is not None else interp(meta, C_META) * (0.8 if mejora else 1)
    lg = leads_goo if leads_goo is not None else interp(goo, C_GOO)
    tm = C_TASAS_MEJOR if mejora else C_TASAS['meta']; tg = C_TASAS['google']
    vm_ped = lm * tm[0] * tm[1] * tm[2]; vg_ped = lg * tg[0] * tg[1] * tg[2]
    vg = min(vg_ped, cap); vm = min(vm_ped, cap - vg)
    sm = vm * tm[3]; sg = vg * tg[3]
    con = c_contrib(bat=bat)
    def canal(inv, leads, v, s, cierre):
        return dict(leads=leads, visitas=v, ventas=s, cpl=inv / leads if leads else None,
                    cac_ads=inv / s if s else None, cac_real=(inv + 60 * v) / s if s else None,
                    lc=con / ((inv + 60 * v) / s) if s else None, visitas_venta=1 / cierre, valor_visita=cierre * con - 60)
    return dict(contrib=con, meta=canal(meta, lm, vm, sm, tm[3]), google=canal(goo, lg, vg, sg, tg[3]),
                ped=vm_ped + vg_ped, hechas=vm + vg, ventas=sm + sg,
                cac_real_total=(meta + goo + 60 * (vm + vg)) / (sm + sg))

def c_sim(meta_plan, goo_plan, tec_plan=None, mejora_desde=None, bat=0.0, bat_desde=None):
    """tec_plan: técnicos extra contratados (acumulado) en cada mes."""
    tec_plan = tec_plan or [0] * 24
    caja = 12000.0; ventas_prev = 22.0; filas = []
    for t in range(1, 25):
        mj = bool(mejora_desde and t >= mejora_desde)
        tec = tec_plan[t - 1]; tec_prev = tec_plan[t - 2] if t > 1 else 0
        cap = 100 + 50 * tec_prev
        lm = interp(meta_plan[t - 1], C_META) * (0.8 if mj else 1); lg = interp(goo_plan[t - 1], C_GOO)
        tm = C_TASAS_MEJOR if mj else C_TASAS['meta']; tg = C_TASAS['google']
        vm_ped = lm * tm[0] * tm[1] * tm[2]; vg_ped = lg * tg[0] * tg[1] * tg[2]
        vg = min(vg_ped, cap); vm = min(vm_ped, cap - vg)
        ventas = vm * tm[3] + vg * tg[3]
        b = bat if (bat_desde and t >= bat_desde) else 0.0
        ent = 0.5 * 6500 * (ventas + ventas_prev) + 0.5 * 3000 * b * (ventas + ventas_prev)
        sal = (0.55 + 0.03) * 6500 * ventas + 0.17 * 6500 * ventas_prev + 60 * (vm + vg) + meta_plan[t - 1] + goo_plan[t - 1] + 18000 + 1800 * tec \
              + b * ventas * (0.80 * 3000 + 0.03 * 3000)
        caja += ent - sal
        filas.append(dict(mes=t, meta=meta_plan[t - 1], goo=goo_plan[t - 1], tec=tec, leads=lm + lg, ped=vm_ped + vg_ped, cap=cap,
                          hechas=vm + vg, ventas=ventas, ent=ent, sal=sal, caja=caja))
        ventas_prev = ventas
    return filas

def c_valido(meta_plan, goo_plan):
    tot = [m + g for m, g in zip(meta_plan, goo_plan)]
    return all(tot[i] >= tot[i - 1] for i in range(18, 24))
