# Sesión 2 · Reto 2: crecer sin pagar más por cada cliente

Rossman Doan Rivera Cano · Business Solutions · Prof. Steven Ledezma. Los tres casos: Tueste, Agendo y Sol de Casa.

| Carpeta | Qué hay |
|---|---|
| `prototipos/` | Los tres prototipos (`tueste.html`, `agendo.html`, `sol-de-casa.html`): se abren con doble clic, en el celular o en la computadora. Arriba está el «Mapa de la demo» para saltar entre pantallas. En `fuentes/` está el código y `armar.py`; `publicar/` tiene la versión que se publicó como página |
| `fichas/` | La ficha de growth de una página de cada caso (`.docx`: Drive → Nuevo → Subir archivo → Abrir con Documentos de Google) y los dibujos del ciclo |
| `cuentas/` | `Cuentas_growth.xlsx` (fórmulas; datos del caso en azul sobre amarillo; pestañas por caso, matriz de 90 días, cuatro preguntas y guion de la demo de 3 minutos) y `cuentas.js`, que hace las mismas cuentas con el motor del Skill |

## Respuestas de cada caso
- **Tueste.** Donde más se pierde: del correo a la página del programa (34 %); el 88 % nunca ve el programa. Tope por referido: $25 (la mitad de $50 de Meta). Peor combinación de recompensas: $23,10. Meta: de 6 a 21,9 referidos por cada 100 clientes. Meta queda en «Largo plazo» con $4.000.
- **Agendo.** Donde más se pierde: compartir el link (48 %, 32 de 62), y datos fiscales en la primera pantalla (74 %). Donde más tiempo se va: servicios (12 de 28 minutos). Meta: configuran 90 de cada 100 y el 70 % comparte. La conversión pasa de 13,9 % a 22,7 % y el CAC paid baja de $181 a $119.
- **Sol de Casa.** Retener = mantener la relación. Número de la semana: tarjetas compartidas. Una venta referida hoy cuesta $133 en visitas; con recompensas, $298 (tope $300). Para llenar un técnico hacen falta 69 leads referidos, o sea 459 familias: más que las 420 que hay.

## Pruebas
- `node business-unit-economics/pruebas/pruebas-growth.js`: 55 cuentas contra cálculos a mano (coinciden con las encuestas de la clase: 10 socios; 718 contra 657).
- `node business-unit-economics/pruebas/verificar_prototipos.js`: recorre cada prototipo en un iPhone simulado tocando solo los botones, desde la primera pantalla hasta el panel.

## Lo que falta hacer a ustedes
- Revisar los supuestos del equipo, que están marcados en la hoja: Tueste 35 % ve el programa y 50 % de los amigos compra; Agendo 90 configuran y 70 % comparte; Sol de Casa 40 % de las familias comparte y cada una rinde como un letrero.
- Escribir su propio ejemplo de error de la IA en la ficha.
- Ensayar la demo de 3 minutos con el guion de la hoja.
