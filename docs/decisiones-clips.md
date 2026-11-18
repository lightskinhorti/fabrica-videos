# Cuenta de clips @gta6sinparar: decisiones tomadas por Claude

Javier dejó a Claude trabajando solo el 18 de noviembre de 2026 por la noche, con este encargo: cuenta con biografía, foto de perfil y los 3 primeros clips subidos, y una forma automática de sacar clips del directo y subirlos. Pidió que las dudas las resolviera Claude y que apuntara aquí cada decisión y su porqué.

## Decisiones

| # | Decisión | Por qué |
|---|---|---|
| 1 | La cuenta es `@gta6sinparar`, en el perfil de Chrome que era de El contador loco (deviceId `cd1bc28b…`). | Lo decidió Javier. El nombre visible se queda igual: TikTok no deja cambiarlo hasta el 25 de noviembre. |
| 2 | Biografía: "Los mejores momentos de GTA 6 en directo. Clips nuevos cada día". | Dice qué es la cuenta y lleva "GTA 6" y "clips", que es lo que se busca. |
| 3 | Foto de perfil con texto propio ("GTA 6 CLIPS") sobre naranja, hecha con código (`perfiles/clips/foto.py`). | Sin logotipos de Rockstar ni caras de streamers, para no dar motivos de retirada. Se lee en pequeño. |
| 4 | Solo streamers españoles. Los clips de Kai Cenat se descartan. | Lo decidió Javier: los ingleses están saturados (31 clips de GTA de Kai Cenat en un día). |
| 5 | Subtítulos en el idioma del streamer (español). | La decisión de "en inglés" era para streamers ingleses. |
| 6 | Los clips buenos se eligen leyendo lo que se dice, no solo por visualizaciones. | El más visto en Twitch muchas veces no se entiende fuera del directo ("MIRA MIRA MIRA" eran frases sueltas). |
| 7 | El título de arriba lo escribe Claude: quién y qué pasa, sin afirmar nada que no se vea o se oiga. | El título del espectador no sirve de gancho. En el clip del hackeo quité "en GTA 6" porque no pude confirmar qué juego se veía. |
| 8 | Cada descripción nombra el canal de Twitch del streamer, y el vídeo lleva su canal escrito. | Es contenido suyo: el crédito es lo mínimo y reduce el riesgo de queja. |
| 9 | No se activa la etiqueta de contenido con IA ni se cambia ningún ajuste de la cuenta. Al aviso "Turn on automatic content checks?" se le dio a cancelar. | No es contenido generado con IA, y los ajustes de la cuenta son de Javier. |
| 10 | Publicar al momento, sin programar. | Javier: "aquí dan igual los horarios". |
| 11 | Tope: 10 clips al día y 2 por ejecución. Javier hablaba de hasta 30. | Una cuenta recién creada que sube 30 vídeos al día se parece a spam y TikTok puede limitarla. Se puede subir el tope cambiando el número en la tarea programada. |
| 12 | Si no hay ningún clip bueno, no se sube nada. | Subir relleno baja la media de la cuenta y no trae seguidores. |
| 13 | No se suben finales, escenas de la historia ni revelaciones del juego. | Rockstar los retira (ver PRD, opción de GTA 6). |
| 14 | Si TikTok avisa de una infracción o retira un vídeo, la subida automática se para sola y lo apunta aquí abajo. | Tres avisos pueden cerrar una cuenta; es mejor parar y que decida Javier. |
| 15 | Momentos del directo: se sacan de los picos del chat del directo grabado (`clips.py directo`). | Es la señal gratuita de que ha pasado algo; así no dependemos de que un espectador haga el clip y se pueden hacer vídeos de más de 60 s. |
| 16 | La subida automática la hace una tarea programada de Claude (`clips-gta6sinparar`), no un script. | La subida a TikTok va por la extensión de Chrome, que solo puede manejar Claude. La tarea solo corre con la app de Claude abierta. |
| 18 | Con chats muy rápidos (Rubius: 80 mensajes cada 10 s) se acepta un pico de 1,5 o 1,3 veces lo normal, y solo se mira la última media hora. | Con el umbral de 2 veces no salía ningún momento, y bajar más chat tardaba más de 7 minutos por hora. |
| 19 | El VOD de DjMaRiiO que da Twitch era de hace dos días (fútbol): sus momentos del directo se descartaron. | No eran de GTA 6. Sus clips de espectadores sí valen. |
| 17 | La tanda completa (con directos) solo a las 14:20 y a las 22:20; el resto de ejecuciones, solo clips. | Bajar el chat de un directo grande tarda mucho (el de Rubius, más de 20 minutos por 2 horas de directo). |

## Cómo funciona la automatización

1. `herramientas/clips_tanda.py` recorre los canales de `datos/clips_canales.json` y fabrica clips (los más vistos del día y los picos de chat del último directo).
2. `herramientas/clips_cola.py pendientes` enseña lo fabricado con lo que se dice en cada uno.
3. La tarea programada elige, titula (`preparar`), sube con Chrome y apunta (`subido` o `descartar`).
4. Todo queda en `datos/clips_hechos.json`. Repetir cualquier paso no duplica nada.

Para parar la subida automática: en la app de Claude, sección "Scheduled", desactivar "Clips de GTA 6". Para cambiar canales: editar `datos/clips_canales.json`.

## Subidos el 18 de noviembre

| Hora | Clip | Título |
|---|---|---|
| 22:18 | djmariio `1235621977` | DjMaRiiO mata un pelícano en GTA 6 sin querer |
| 22:19 | rubius `764429081` | Rubius finge estar en Nueva Zelanda para jugar GTA 6 |
| 22:20 | rubius `3735558195` | A Rubius le hackean en directo nada más entrar |
| 22:24 | thegrefg `746928124` | TheGrefg pide denunciar a quien juegue GTA 6 antes de las 12 |
| 22:41 | vegetta777 `directo-2932422696-6238` | Vegetta la lía en un bar de GTA 6 y acaba pidiendo perdón |
| 22:42 | rubius `directo-2932415021-20078` | Rubius salta en paracaídas en GTA 6 y lo hace al revés |
| 22:43 | vegetta777 `directo-2932422696-4918` | Vegetta alucina con la ciudad de GTA 6 desde el aire |
| 22:44 | rubius `directo-2932415021-20138` | Rubius reaparece en el hospital en GTA 6 y no sabe dónde está |

Los cuatro últimos salen del propio directo (picos del chat), no de clips de espectadores. Paré en 8 el primer día, por debajo del tope de 10 (decisión 11).

## Riesgos que siguen abiertos

- Son vídeos de otros, sin permiso expreso. Claude avisó; Javier decidió seguir y cuenta con que TikTok pagará.
- Según las guías consultadas (no la página oficial de TikTok), el programa de pagos no paga contenido no original.
- En las portadas del perfil el título de arriba queda cortado por el recorte de TikTok. Pendiente de bajar el título en el montaje.

## Avisos de TikTok

Ninguno hasta ahora.
