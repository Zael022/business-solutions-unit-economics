# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright

CSS = """
@page{size:Letter;margin:1.6cm 1.8cm}
body{font-family:'Carlito','Calibri',Arial,sans-serif;font-size:10.8pt;line-height:1.34;color:#1d1d1f}
h1{font-size:19pt;margin:0;color:#1f3a5f}.sub{color:#5f6b7a;margin:2pt 0 10pt}
h2{font-size:12.5pt;color:#1f3a5f;margin:11pt 0 4pt;border-bottom:1pt solid #c9d3e0;padding-bottom:2pt}
.decision{background:#1f3a5f;color:#fff;padding:9pt 12pt;border-radius:4pt;font-size:12.5pt;margin:6pt 0 8pt}
.decision b{font-size:14pt}
.trampa{background:#fff3f1;border-left:4pt solid #c0392b;padding:7pt 10pt;margin:6pt 0}
table{width:100%;border-collapse:collapse;font-size:9.8pt;margin:4pt 0 6pt}th{background:#1f3a5f;color:#fff;text-align:left;padding:4pt 6pt}
td{padding:4pt 6pt;border-bottom:.6pt solid #c9d3e0}td.n{text-align:right;white-space:nowrap}
ul{margin:2pt 0 4pt;padding-left:16pt}li{margin-bottom:2pt}
.salto{break-before:page}.p2{font-size:9.1pt;line-height:1.22}.p2 h2{margin:8pt 0 3pt}
.ia{border:1pt dashed #9aa5b1;padding:7pt 10pt;border-radius:4pt;margin-top:4pt}
.rell{border-bottom:1pt solid #9aa5b1;height:13pt;margin:2pt 0}
small{color:#5f6b7a}
"""

A = """
<h1>Tueste · Recomendación para Diego</h1><p class="sub">Caso A · ¿Firmo la propuesta de Black Friday? · Cifras mensuales en dólares</p>
<div class="decision"><b>No firmar. Arreglar antes de escalar.</b> Hoy cada cliente nuevo apenas devuelve lo que cuesta (LTV:CAC 1,00). Duplicar la inversión con 30 % de descuento lo deja en 0,64: cada cliente extra pierde plata y la caja rompe el piso de $5.000 en el mes 4.</div>
<div class="trampa"><b>La trampa: el ROAS de 3,0.</b> Meta se atribuye $24.000 de los $28.000 de la tienda (86 %), incluidas recompras de clientes que ya existían: el 30 % de la inversión ($2.400) va a retargeting de gente que ya visitó o ya compró. Contando solo el primer pedido de los 165 clientes nuevos, el ROAS real es <b>0,70</b>, cuando el mínimo para no perder plata es <b>2,14</b> (y <b>3,87</b> con el descuento de la agencia). Por eso el banco baja aunque Meta diga 3,0.</div>
<h2>Los números</h2>
<table><tr><th>Indicador</th><th>Hoy ($8.000)</th><th>Agencia ($16.000, −30 %)</th><th>Propuesta</th></tr>
<tr><td>Contribución del pedido suelto / primer pedido</td><td class="n">$15,89 / $15,89</td><td class="n">$15,89 / $6,15</td><td class="n">$22,01 / $22,01</td></tr>
<tr><td>CAC de anuncios / CAC real (con el fee)</td><td class="n">$48,48 / $54,55</td><td class="n">$68,09 / $72,34</td><td class="n">$40,00 / $50,00</td></tr>
<tr><td>LTV a 12 meses (sobre contribución)</td><td class="n">$54,80</td><td class="n">$46,52</td><td class="n">$70,39</td></tr>
<tr><td><b>LTV:CAC</b></td><td class="n"><b>1,00</b></td><td class="n"><b>0,64</b></td><td class="n"><b>1,41</b></td></tr>
<tr><td>Payback</td><td class="n">12 meses</td><td class="n">no recupera en 12</td><td class="n">7 meses</td></tr>
<tr><td>CAC marginal</td><td class="n">$88,89 si sube a $12.000</td><td class="n">$114,29 por cliente extra</td><td class="n">—</td></tr></table>
<h2>Los dos cambios</h2>
<ul><li><b>Pack de 3 bolsas a $48 con envío gratis solo desde $45.</b> El pack deja $23,62 y el pedido de 2 bolsas pasa a dejar $20,39 porque el cliente paga su envío. Suponiendo que la mitad elige el pack, la contribución del pedido suelto sube de $15,89 a $22,01 y el LTV de $54,80 a $70,39.</li>
<li><b>Bajar a $4.000 mientras se prueba el pack</b> y apagar primero el retargeting a compradores. El historial dice que con $4.000 llegan 100 clientes: el CAC real baja de $54,55 a $50,00. Juntos: LTV:CAC de 1,00 a 1,41 y payback de 12 a 7 meses.</li></ul>
<div class="salto p2"><h2>Plan de 24 meses (nivel 3)</h2>
<table><tr><th>Plan</th><th>Caja mínima (mes)</th><th>Caja mes 24</th><th>Suscriptores mes 24</th></tr>
<tr><td>$8.000 fijos (hoy)</td><td class="n">$24.448 (6)</td><td class="n">$79.596</td><td class="n">317</td></tr>
<tr><td>Agencia: $16.000 fijos</td><td class="n">−$35.879 (16) · rompe el piso en el mes 4</td><td class="n">−$26.217</td><td class="n">421</td></tr>
<tr><td>$4.000 fijos, sin otros cambios</td><td class="n">$34.764 (1)</td><td class="n">$95.566</td><td class="n">220</td></tr>
<tr><td><b>Pack desde el mes 1; $4.000 los meses 1-3 y $8.000 después</b></td><td class="n">$35.528 (1)</td><td class="n"><b>$147.770</b></td><td class="n">313</td></tr>
<tr><td>Pack desde el mes 1 y $8.000 fijos (el de más caja)</td><td class="n">$30.847 (3)</td><td class="n"><b>$154.362</b></td><td class="n">317</td></tr></table>
<p><b>Riesgos:</b> que menos de la mitad elija el pack, o que los clientes de 2 bolsas compren menos al pagar el envío (supuesto propio). El historial es de meses sin promociones, y el descuento podría no traer más clientes (supuesto 3, optimista). La segunda tostadora ($14.000) se paga sin tocar el piso solo si el pack funciona.</p>

<h2>Pitch de 2 minutos (Diego le pide un préstamo a su tío)</h2>
<p>«Tío, Tueste tiene un café que la gente ama: 4,8 estrellas en 1.100 reseñas. Pero descubrimos que Meta nos estaba contando como suyas ventas que ya eran nuestras: decía ROAS 3,0 y, contando solo a los clientes nuevos, el anuncio devuelve 70 centavos en el primer pedido. Hoy cada cliente nos cuesta $54,55 y deja $54,80 en un año: no se gana nada. Por eso <b>no voy a duplicar los anuncios</b>.</p>
<p>Lo que sí vamos a hacer: lanzar el pack de 3 bolsas a $48, con envío gratis solo desde $45, que sube lo que deja cada pedido de $15,89 a $22. Durante tres meses invertimos $4.000 para medir cuánta gente lo elige. Si la mitad lo elige, volvemos a $8.000: en dos años la caja pasa de $35.000 a unos $148.000 y nunca baja de $35.000. <b>El riesgo</b> es que la gente no elija el pack. <b>Para subir la inversión</b> necesito ver que cada cliente devuelva al menos 1,5 veces lo que cuesta y que el pack llegue al 50 %. No le pido plata para anuncios: le pido respaldo para comprar la tostadora cuando el pack funcione.»</p>
<h2>Supuestos usados</h2>
<ul><li>Permitidos: 1 ($34 de primer pedido para el ROAS), 2 (mezcla 85/15 fija), 3 (el descuento no cambia los clientes que llegan, optimista), 4 (interpolación lineal, con $0 = 0 clientes), 5 (sin temporadas).</li>
<li>Propio: la mitad de los pedidos sueltos pasa al pack; el pedido de 2 bolsas paga su envío y mantiene la misma frecuencia.</li></ul>
<h2>En qué se equivocó o nos confundió la IA</h2>
<div class="ia"><p><b>Ejemplo 1.</b> En la hoja, la fila «¿Cada cliente extra deja plata?» decía «Sí» para la propuesta de bajar a $4.000, aunque ahí no hay clientes extra: hay 65 clientes menos. La IA comparaba el LTV con el valor absoluto del CAC marginal sin mirar el signo. Lo corregimos para que diga «Se dejan de traer clientes que costaban $61,54 cada uno».</p>
<p><b>Ejemplo 2.</b> La IA propuso en el nivel 1 bajar a $4.000 con el pack, pero en el nivel 3 el plan con más caja era $8.000 con el pack. Eran dos recomendaciones distintas. Lo resolvimos con un camino: $4.000 mientras se prueba el pack y $8.000 después.</p>
<p><b>Ejemplo 3.</b> En la auditoría final vimos que la columna «¿Cumple todas las reglas?» del simulador solo revisaba el piso de caja y el promedio desde el mes 13; no revisaba que la inversión estuviera entre $0 y $20.000. Un plan de $25.000 salía como válido. Agregamos esa regla a la fórmula.</p>
<p><b>Ejemplo del equipo</b> (qué dijo la IA, por qué estaba mal y cómo lo corrigieron):</p><div class="rell"></div><div class="rell"></div></div></div>
"""

B = """
<h1>Agendo · Recomendación para Ricardo</h1><p class="sub">Caso B · ¿Triplicar los anuncios de $10.000 a $30.000? · Cifras mensuales en dólares</p>
<div class="decision"><b>Valeria no tiene razón todavía: no triplicar.</b> Arreglar el valor de cada cliente y escalar de a poco. Con $30.000 al mes, cada cliente de anuncios devuelve 0,91 de lo que cuesta y la caja de $60.000 se acaba en el mes 3.</div>
<div class="trampa"><b>La trampa: el LTV:CAC de 2,4.</b> Sale de dividir los $12.600 de adquisición entre los 70 clientes de anuncios <b>y los 50 orgánicos que no costaron nada</b> (CAC blended de $105). Para decidir sobre anuncios hay que mirar solo a los clientes de anuncios: <b>CAC paid de $180 y LTV:CAC de 1,40</b>. El «costo por registro de $20» es el costo de una prueba gratis, no de un cliente: el CAC paid es 9 veces eso.</div>
<h2>Los números</h2>
<table><tr><th>Indicador</th><th>Hoy ($10.000)</th><th>Valeria con el historial</th><th>Valeria (CAC constante)</th><th>Propuesta</th></tr>
<tr><td>Trials / vendedoras / clientes de anuncios</td><td class="n">500 / 1 / 70</td><td class="n">900 / 2 / 126</td><td class="n">1.500 / 3 / 210</td><td class="n">500 / 1 / 70</td></tr>
<tr><td>CAC paid / CAC blended</td><td class="n">$180 / $105</td><td class="n">$277 / $198</td><td class="n">$180 / $145</td><td class="n">$180 / $105</td></tr>
<tr><td>LTV a 24 meses (sin tope: $325)</td><td class="n">$251,39</td><td class="n">$251,39</td><td class="n">$251,39</td><td class="n">$302,26</td></tr>
<tr><td><b>LTV:CAC paid</b> (blended)</td><td class="n"><b>1,40</b> (2,39)</td><td class="n"><b>0,91</b> (1,27)</td><td class="n"><b>1,40</b> (1,73)</td><td class="n"><b>1,68</b> (2,88)</td></tr>
<tr><td>Payback</td><td class="n">14 meses</td><td class="n">no recupera en 24</td><td class="n">14 meses</td><td class="n">11 meses</td></tr>
<tr><td>CAC marginal / caja atrapada al mes</td><td class="n">—</td><td class="n">$398,57 / $21.228</td><td class="n">$180 / $22.470</td><td class="n">—</td></tr></table>
<p><small>El LTV sin tope ($325) supone que el cliente se queda para siempre; usamos el de 24 meses ($251,39), como pide el caso. Un cliente del plan anual paga $187,20 de margen el primer día, más que el CAC: su payback es de 1 mes, contra 14 del cliente mensual.</small></p>
<h2>Los dos cambios</h2>
<ul><li><b>Ofrecer el plan anual durante el trial</b> para llevarlo del 10 % al 40 % de los clientes nuevos (supuesto propio). El prepago devuelve el CAC el primer mes y el cliente anual deja $318,24 en 24 meses, contra $251,39 del mensual.</li>
<li><b>Subir el plan mensual a $29</b>, todavía 17 % debajo de CitaYa ($35), con NPS 61 (supuesto: la cancelación no sube). El margen mensual pasa de $19,50 a $22,62.</li></ul>
<p>Juntos: LTV:CAC paid de 1,40 a 1,68 y payback de 14 a 11 meses, con la misma inversión.</p>
<div class="salto p2"><h2>Plan de 24 meses (nivel 3) · gana el que tiene más clientes activos sin bajar de $10.000</h2>
<table><tr><th>Plan</th><th>Caja mínima (mes)</th><th>Clientes activos mes 24</th><th>Caja mes 24</th></tr>
<tr><td>$10.000 fijos (hoy)</td><td class="n">$52.666 (4)</td><td class="n">1.807</td><td class="n">$156.741</td></tr>
<tr><td>Valeria: $30.000 fijos</td><td class="n">bajo el piso y negativa en el mes 3</td><td class="n">2.529</td><td class="n">−$162.689</td></tr>
<tr><td>$15.000 los meses 1-18 y $27.000 después</td><td class="n">$14.262 (24)</td><td class="n">2.229</td><td class="n">$14.262</td></tr>
<tr><td><b>Plan anual al 40 %, $23.000 los meses 1-12 y $30.000 después</b></td><td class="n">$10.108 (12)</td><td class="n"><b>2.978</b></td><td class="n">$37.134</td></tr></table>
<p><b>Riesgos:</b> la conversión del 14 % no cambia con más inversión (supuesto 3, optimista); el 40 % de plan anual y el precio de $29 son supuestos propios. El último plan pasa a $108 del piso en el mes 12: no deja margen de error y hay que revisarlo mes a mes.</p>

<h2>Pitch de 2 minutos para Ricardo</h2>
<p>«Ricardo, la lámina dice LTV:CAC 2,4, pero ese número mezcla a los 50 clientes que llegan solos con los que pagamos. Un cliente de anuncios nos cuesta $180 y deja $251 en dos años: 1,4 veces, y tarda 14 meses en devolver lo que costó. Si triplicamos ya, el historial dice que $30.000 traen 126 clientes, no 210; cada cliente extra cuesta $399 y en tres meses nos quedamos sin caja.</p>
<p>Nuestra propuesta: <b>primero arreglar el cliente y después escalar</b>. Ofrecemos el plan anual durante la prueba, que paga el año por adelantado y devuelve el CAC el primer mes, y subimos el mensual a $29, todavía debajo de CitaYa. Con eso, cada cliente devuelve 1,7 veces lo que cuesta y recupera su costo en 11 meses. Con 40 % de plan anual podemos subir a $23.000 este año y a $30.000 el próximo: llegaríamos a casi 3.000 clientes en 24 meses sin bajar de $10.000 en el banco. <b>El riesgo</b> es que la conversión baje al invertir más, o que menos gente elija el plan anual. <b>Para triplicar de verdad</b> necesitamos que el 40 % elija el plan anual, que la conversión se mantenga en 14 % con $20.000 y contratar a la segunda vendedora antes de pasar de 500 trials.»</p>
<h2>Supuestos usados</h2>
<ul><li>Permitidos: 1 (base todo mensual), 2 (paga el primer mes al llegar), 3 (conversión fija, optimista), 4 (interpolación con $0 = 0), 5 (orgánicos fijos), 6 (versión de Valeria con CAC constante, comparada con el historial).</li>
<li>Propios: 40 % elige el plan anual si se ofrece en el trial; el precio de $29 no cambia la cancelación; el plan anual se mantiene en $240.</li></ul>
<h2>En qué se equivocó o nos confundió la IA</h2>
<div class="ia"><p><b>Ejemplo 1.</b> La columna «¿Cumple?» del simulador de 24 meses solo revisaba el piso de $10.000. No revisaba que la inversión estuviera entre $0 y $30.000, así que un plan de $35.000 salía como válido. Lo encontramos en la auditoría y agregamos esa regla.</p>
<p><b>Ejemplo 2.</b> La transcripción automática de la clase dice que Agendo tiene «6.150 negocios» y que las ventas de Tueste subieron «de $1.000 a $28.000». El PDF dice 1.150 clientes y $9.000. Usamos siempre el PDF, porque es la fuente de las cifras.</p>
<p><b>Ejemplo del equipo</b> (qué dijo la IA, por qué estaba mal y cómo lo corrigieron):</p><div class="rell"></div><div class="rell"></div></div></div>
"""

C = """
<h1>Sol de Casa · Recomendación para Andrés</h1><p class="sub">Caso C · ¿Pasar todo el presupuesto a Meta? · Cifras mensuales en dólares</p>
<div class="decision"><b>Rechazar la propuesta de Leadly.</b> Más leads no es más ventas: con $8.000 en Meta las ventas bajan de 22,3 a 17,5 al mes y la caja rompe el piso de $5.000 en el mes 5. Proponemos arreglar el embudo de Meta y sumar capacidad de visitas.</div>
<div class="trampa"><b>La trampa: el CPL.</b> El lead de Meta cuesta $8 y el de Google $40 (5 veces menos), pero <b>el cliente de Meta cuesta 34 % más</b>: CAC real de $718 frente a $536. En Meta solo contesta el 55 % y hacen falta 5,6 visitas para vender una (en Google, 3,3). Cada visita cuesta $60 y solo hay 100 al mes: una visita de Google vale $427,50 y una de Meta $232,50.</div>
<h2>Los números</h2>
<table><tr><th>Indicador</th><th>Hoy ($4.000 + $4.000)</th><th>Agencia con el historial</th><th>Agencia como la cuenta</th><th>Propuesta</th></tr>
<tr><td>Leads (Meta + Google)</td><td class="n">600</td><td class="n">840</td><td class="n">1.000</td><td class="n">500</td></tr>
<tr><td>Visitas pedidas / capacidad</td><td class="n">97,5 / 100</td><td class="n">97,0 / 100</td><td class="n">115,5 / 100</td><td class="n">135,7 / 150</td></tr>
<tr><td><b>Ventas al mes</b></td><td class="n"><b>22,3</b></td><td class="n"><b>17,5</b></td><td class="n"><b>18,0</b></td><td class="n"><b>33,0</b></td></tr>
<tr><td>CAC real (Meta · Google)</td><td class="n">$718 · $536</td><td class="n">$791 · —</td><td class="n">$778 · —</td><td class="n">$462 · $536</td></tr>
<tr><td>LTV:CAC (Meta · Google)</td><td class="n">2,26 · 3,03</td><td class="n">2,05 · —</td><td class="n">2,09 · —</td><td class="n">3,52 · 3,03</td></tr>
<tr><td>Resultado del mes (después de anuncios, visitas y técnicos)</td><td class="n">$22.415</td><td class="n">$14.557</td><td class="n">$15.250</td><td class="n">$35.748</td></tr></table>
<p><small>Una venta deja $1.625 (28 % de $6.500 menos 3 % de comisión). En caja, contando el CAC real de $621, el mes de la firma Andrés queda $1.141 abajo por cliente (cobra el 50 % y paga equipos y comisión). Lo recupera en el mes 2, el de la instalación. Por eso la caja aprieta aunque el negocio deje plata.</small></p>
<h2>Los dos cambios</h2>
<ul><li><b>Llamar en menos de 5 minutos y filtrar el formulario de Meta</b> («¿Es dueño de la casa?», «¿Su recibo pasa de $80?»). Según el supuesto 7, hay 20 % menos leads pero mejores: el CAC real de Meta baja de $718 a $462 y su LTV:CAC sube de 2,26 a 3,52.</li>
<li><b>Contratar un técnico más</b> ($1.800 al mes, +50 visitas). Con el filtro se piden 136 visitas y hoy caben 100. Con 150 de capacidad, las ventas pasan de 22,3 a 33,0 al mes.</li></ul>
<div class="salto p2"><h2>Plan de 24 meses (nivel 3) · gana el de más caja en el mes 24 sin bajar de $5.000</h2>
<table><tr><th>Plan</th><th>Caja mínima (mes)</th><th>Caja mes 24</th><th>Instalaciones</th></tr>
<tr><td>Actual: $4.000 + $4.000</td><td class="n">$15.736 (1)</td><td class="n">$117.273</td><td class="n">536</td></tr>
<tr><td>Agencia: $8.000 en Meta, $0 en Google</td><td class="n">bajo el piso en el mes 5</td><td class="n">−$60.898</td><td class="n">419</td></tr>
<tr><td>$6.000 Meta + $8.000 Google, 1 técnico desde el mes 2</td><td class="n">$5.089 (3)</td><td class="n">$249.550</td><td class="n">782</td></tr>
<tr><td>Respuesta y filtro desde el mes 1, $7.000 Meta + $6.000 Google, técnicos en los meses 2 y 3</td><td class="n">$5.846 (3)</td><td class="n">$649.095</td><td class="n">1.102</td></tr>
<tr><td><b>Respuesta y filtro desde el mes 1, Meta $4.000 los meses 1-2 y $7.000 después, Google $6.000, técnicos en los meses 1 y 2</b></td><td class="n">$6.184 (2)</td><td class="n"><b>$681.010</b></td><td class="n">1.124</td></tr></table>
<p><small>Este último plan fue el mejor de 15.750 combinaciones probadas con el mismo modelo y las mismas reglas. No es un óptimo garantizado.</small></p>
<p><b>Riesgos:</b> el efecto de la respuesta rápida y el filtro viene de casos parecidos (supuesto 7), no de Sol de Casa. En el mes 2 la caja queda a $1.184 del piso, porque los equipos se pagan al firmar y el técnico se paga un mes antes de rendir. Las tasas del embudo podrían bajar al invertir más.</p>

<h2>Pitch de 2 minutos ante el banco</h2>
<p>«Sol de Casa lleva 420 casas y 4,9 estrellas. Cada instalación deja $1.625. Nuestra agencia quiere pasar todo a Meta porque el lead cuesta $8 en vez de $40, pero esos leads casi no contestan: el cliente de Meta nos sale 34 % más caro y, con la propuesta, venderíamos 17 casas al mes en lugar de 22.</p>
<p>Nuestro plan: <b>llamar a cada lead en menos de 5 minutos y filtrar a quien no es dueño o paga poco de luz</b>, mantener Google, que es el canal que más cierra, con $6.000, y contratar un técnico en el mes 1 y otro en el mes 2 para pasar de 100 a 200 visitas. Meta queda en $4.000 mientras se capacitan y sube a $7.000 desde el mes 3. Con eso pasamos de 22 a 48 instalaciones al mes y, en dos años, la caja crece de $12.000 a unos $680.000. <b>El riesgo</b> está en los primeros dos meses: pagamos equipos y técnicos antes de cobrar, y la caja baja a $6.184. <b>Le pedimos al banco</b> una línea de crédito de capital de trabajo para cubrir ese hueco. <b>Para crecer más</b>, necesitamos que Meta cierre al 22 % después del filtro y contratar un tercer técnico cuando las visitas pedidas pasen la capacidad dos meses seguidos.»</p>
<h2>Supuestos usados</h2>
<ul><li>Permitidos: 1 (LTV = una venta), 2 (embudo en el mismo mes), 3 (tasas fijas), 4 (si no caben, primero Google), 5 (interpolación con $0 = 0), 6 (CPL de $8 de la agencia, comparado con el historial), 7 (respuesta y filtro).</li>
<li>Propio: en el nivel 1, el técnico extra rinde sus 50 visitas desde el primer mes (en el simulador, desde el mes siguiente, como pide el caso). La batería no se usa: la prueba de 3 de 20 es una muestra muy chica.</li></ul>
<h2>En qué se equivocó o nos confundió la IA</h2>
<div class="ia"><p><b>Ejemplo 1.</b> La IA presentó «$7.000 Meta + $6.000 Google con técnicos en los meses 2 y 3» como el mejor plan ($649.095). Solo había probado inversiones fijas. Con el mismo modelo probamos caminos de dos tramos y apareció uno mejor: $681.010, que empieza con menos Meta y contrata antes. Ahora la entrega dice «mejor encontrado» y cuántas combinaciones probó.</p>
<p><b>Ejemplo 2.</b> La hoja contaba el payback en caja desde el mes siguiente a la firma («mes 1»), pero en Tueste y Agendo el mes 1 es el mes en que llega el cliente. Unificamos: la firma es el mes 1 y el payback es el mes 2.</p>
<p><b>Ejemplo del equipo</b> (qué dijo la IA, por qué estaba mal y cómo lo corrigieron):</p><div class="rell"></div><div class="rell"></div></div></div>
"""

with sync_playwright() as p:
    b = p.chromium.launch()
    for f, h in [('Recomendacion_A_Tueste.pdf', A), ('Recomendacion_B_Agendo.pdf', B), ('Recomendacion_C_Sol_de_Casa.pdf', C)]:
        pg = b.new_page(); pg.set_content(f'<html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{h}</body></html>')
        pg.pdf(path=f, format='Letter', print_background=True); pg.close()
    b.close()
print('ok')
