# Fuentes: Los satélites no saben dónde estás

| Dato del guion | Cifra usada | Fuente |
|---|---|---|
| El receptor GPS solo escucha: no envía nada a los satélites, así que ellos no saben dónde estás | | [MIT Engineering, Ask an Engineer](https://engineering.mit.edu/ask-an-engineer/could-a-gps-device-reveal-my-location-to-others) |
| Hay unos 31 satélites GPS en servicio | 31 satélites operativos (a 3 de julio de 2023, sin contar los de reserva) | [gps.gov, Space Segment (archivo)](https://archive.gps.gov/systems/gps/space/) |
| A más de 20.000 km de altura | Unos 20.200 km (órbita media, 2 vueltas al día) | [gps.gov, Space Segment (archivo)](https://archive.gps.gov/systems/gps/space/) |
| Llevan relojes atómicos y emiten su posición y la hora | | [Navipedia (ESA): GPS Space Segment](https://gssc.esa.int/navipedia/index.php/GPS_Space_Segment), [Ashby, Living Reviews in Relativity (2003)](https://link.springer.com/article/10.12942/lrr-2003-1) |
| La señal tarda menos de una décima de segundo | 20.200 km / 299.792 km/s = 0,067 s con el satélite justo encima; unos 0,086 s si está en el horizonte | Cálculo con la velocidad de la luz |
| El móvil calcula la distancia con el tiempo que tarda la señal | 0,067 s × 299.792 km/s = 20.200 km | Cálculo |
| Una millonésima de segundo de error son unos 300 metros | 0,000001 s × 299.792.458 m/s = 300 m (299,8 m) | Cálculo; [Naciones Unidas, UNGEGN: sistemas de referencia](https://unstats.un.org/UNSD/geoinfo/UNGEGN/docs/_data_ICAcourses/_HtmlModules/_Selfstudy/S06/S06_05b.html) |
| Con 1 satélite, una esfera; con 2, un círculo; con 3, dos puntos (uno lejos de la Tierra) | 1, 2 y 3 satélites | [Navipedia (ESA): An intuitive approach to the GNSS positioning](https://gssc.esa.int/navipedia/index.php/An_intuitive_approach_to_the_GNSS_positioning) |
| El reloj del móvil no es atómico: con un 4.º satélite corrige su propia hora | 4 satélites: 3 coordenadas más el desfase del reloj | [Navipedia (ESA): Code Based Positioning](https://gssc.esa.int/navipedia/index.php/Code_Based_Positioning_(SPS)), [Penn State GEOG 862](https://www.e-education.psu.edu/geog862/node/1724) |
| En Europa, los móviles nuevos tienen que funcionar también con Galileo | Desde el 17 de marzo de 2022 (Reglamento Delegado (UE) 2019/320, para la localización en las llamadas al 112) | [EUR-Lex, Reglamento Delegado (UE) 2019/320](https://eur-lex.europa.eu/eli/reg_del/2019/320/oj) |
| Allí arriba el tiempo pasa más deprisa | La gravedad los adelanta unos 45 µs al día y la velocidad los atrasa unos 7: en total, unos 38 | [Richard Pogge, Ohio State University: Real-World Relativity, the GPS](https://www.astronomy.ohio-state.edu/pogge.1/Ast162/Unit5/gps.html), [Ashby (2003)](https://link.springer.com/article/10.12942/lrr-2003-1) |
| Ganan 38 millonésimas de segundo al día | 38 µs = 0,000038 s al día | [Pogge, OSU](https://www.astronomy.ohio-state.edu/pogge.1/Ast162/Unit5/gps.html) |
| Por eso sus relojes se ajustan para ir más lentos antes del lanzamiento | | [Pogge, OSU](https://www.astronomy.ohio-state.edu/pogge.1/Ast162/Unit5/gps.html) |
| Sin corregirlo, el error crecería unos 10 km cada día | 10 km al día (38 µs × la velocidad de la luz = 11 km) | [Pogge, OSU](https://www.astronomy.ohio-state.edu/pogge.1/Ast162/Unit5/gps.html): "about 10 kilometers each day" |

Cifras solo de la ilustración: la hora que marcan los relojes, el contador de satélites y las órbitas (dibujadas mucho más cerca de la Tierra de lo que están). Las señales se dibujan muchísimo más lentas que la luz.

Matiz: los 10 km al día son la estimación divulgativa habitual (38 µs a la velocidad de la luz). Cuánto se notaría de verdad en la posición depende de cómo el receptor corrige su propio reloj; por eso en pantalla sale como estimación.

Notas en pantalla: "Ojo: las apps sí pueden mandar tu ubicación por internet", "Ilustración, no a escala", "Señal dibujada muchísimo más lenta", "Simplificado: el móvil usa más satélites si los ve" y "Estimación: 38 µs a la velocidad de la luz son unos 11 km".
