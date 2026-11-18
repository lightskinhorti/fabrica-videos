"""Pruebas de la lógica de herramientas/clips.py (sin red).

    python3 -m unittest tests.test_clips
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "herramientas"))
import clips  # noqa: E402


def clip(i, titulo, visitas, dur=30.0):
    return {"id": str(i), "title": titulo, "view_count": visitas, "duration": dur,
            "url": f"https://www.twitch.tv/x/clip/{i}"}


class Elegir(unittest.TestCase):
    def setUp(self):
        self.lista = [clip(1, "Kai plays GTA 6", 900), clip(2, "just chatting", 5000),
                      clip(3, "gta chase", 4000), clip(4, "GTA fail", 100),
                      clip(5, "gta long", 9000, dur=90), clip(6, "GTA ending", 7000)]

    def test_ordena_por_visitas_y_filtra(self):
        r = clips.elegir(self.lista, ["gta"], 500, 15, 60, 3, set())
        self.assertEqual([e["id"] for e in r], ["6", "3", "1"])

    def test_salta_los_ya_hechos(self):
        r = clips.elegir(self.lista, ["gta"], 500, 15, 60, 3, {"6"})
        self.assertEqual([e["id"] for e in r], ["3", "1"])

    def test_sin_palabras_vale_cualquier_titulo(self):
        r = clips.elegir(self.lista, [], 500, 15, 60, 1, set())
        self.assertEqual(r[0]["id"], "6")

    def test_entradas_incompletas_no_rompen(self):
        r = clips.elegir([{"title": "gta"}, {"id": "9", "url": "u", "title": None}], ["gta"], 0, 0, 60, 5, set())
        self.assertEqual(r, [])


class Texto(unittest.TestCase):
    def test_titulo_limpio(self):
        self.assertEqual(clips.titulo_limpio("  Kai   reacts 🔥🔥 to GTA 6!! "), "Kai reacts to GTA 6!!")
        largo = clips.titulo_limpio("palabra " * 20, 30)
        self.assertLessEqual(len(largo), 31)
        self.assertTrue(largo.endswith("…"))

    def test_canal(self):
        self.assertEqual(clips.validar_canal("KaiCenat"), "kaicenat")
        for malo in ("a", "kai cenat", "x/../y", "kai?range=1"):
            with self.assertRaises(ValueError):
                clips.validar_canal(malo)

    def test_partir_lineas(self):
        self.assertEqual(clips.partir_lineas("uno dos tres cuatro", len, 8), ["uno dos", "tres", "cuatro"])


class Grupos(unittest.TestCase):
    def test_agrupa_y_corta_en_pausas(self):
        ps = [{"text": "a", "start": 0.0, "end": 0.2}, {"text": "b", "start": 0.2, "end": 0.4},
              {"text": "c", "start": 2.0, "end": 2.2}, {"text": "", "start": 2.2, "end": 2.3},
              {"text": "d", "start": 2.2, "end": 2.4}, {"text": "e", "start": 2.4, "end": 2.6},
              {"text": "f", "start": 2.6, "end": 2.8}]
        g = clips.grupos(ps, por_grupo=3, pausa=0.6)
        self.assertEqual([x["text"] for x in g], ["A B", "C D E", "F"])
        for a, b in zip(g, g[1:]):
            self.assertLessEqual(a["end"], b["start"])

    def test_vacio(self):
        self.assertEqual(clips.grupos([]), [])


class Hechos(unittest.TestCase):
    def test_apuntar_dos_veces_no_duplica(self):
        with tempfile.TemporaryDirectory() as d:
            ruta = Path(d) / "hechos.json"
            archivo = clips.RAIZ / "exports" / "clips" / "x" / "7.mp4"
            for _ in range(2):
                clips.apuntar_hecho(clip(7, "gta", 10), "x", archivo, ruta)
            datos = json.loads(ruta.read_text(encoding="utf-8"))
            self.assertEqual(list(datos), ["7"])
            self.assertEqual(clips.leer_hechos(ruta)["7"]["canal"], "x")

    def test_formato_malo_avisa(self):
        with tempfile.TemporaryDirectory() as d:
            ruta = Path(d) / "hechos.json"
            ruta.write_text("[]", encoding="utf-8")
            with self.assertRaises(ValueError):
                clips.leer_hechos(ruta)


def rafaga(t0, n, paso=0.5):
    return [t0 + i * paso for i in range(n)]


class Momentos(unittest.TestCase):
    def setUp(self):
        # chat tranquilo: 4 mensajes cada 10 s durante 1 hora, con tres picos
        base = [w * 10 + k * 2.4 for w in range(360) for k in range(4)]
        self.marcas = sorted(base + rafaga(1000, 30) + rafaga(2000, 100, 0.25) + rafaga(2600, 20))

    def test_elige_los_picos_del_mejor_al_peor(self):
        r = clips.momentos(self.marcas, cuantos=3)
        self.assertEqual([round(m["pico"]) for m in r], [2000, 1000, 2600])
        self.assertGreater(r[0]["veces"], r[1]["veces"])

    def test_empieza_antes_del_pico_y_dura_lo_pedido(self):
        m = clips.momentos(self.marcas, cuantos=1, antes=22, dura=45)[0]
        self.assertEqual(m["inicio"], 2000 - 22)
        self.assertGreaterEqual(m["fin"] - m["inicio"], 45)
        self.assertLessEqual(m["fin"] - m["inicio"], 75)

    def test_duracion_dentro_de_los_limites(self):
        corto = clips.momentos(self.marcas, cuantos=1, dura=5)[0]
        largo = clips.momentos(self.marcas, cuantos=1, dura=500)[0]
        self.assertGreaterEqual(corto["fin"] - corto["inicio"], 30)
        self.assertLess(corto["fin"] - corto["inicio"], 75)  # cubre la reacción, no más
        self.assertEqual(largo["fin"] - largo["inicio"], 75)

    def test_no_se_solapan(self):
        r = clips.momentos(self.marcas + rafaga(1030, 40), cuantos=5)
        r.sort(key=lambda m: m["inicio"])
        for a, b in zip(r, r[1:]):
            self.assertLessEqual(a["fin"], b["inicio"])

    def test_excluye_lo_ya_hecho(self):
        r = clips.momentos(self.marcas, cuantos=3, excluir=[(1970, 2030)])
        self.assertNotIn(2000, [round(m["pico"]) for m in r])

    def test_ventanas_contiguas_son_un_solo_momento(self):
        marcas = [w * 10 + k * 2.4 for w in range(100) for k in range(4)] + rafaga(500, 80, 0.5)
        r = clips.momentos(sorted(marcas), cuantos=5)
        self.assertEqual(len(r), 1)

    def test_sin_picos_o_vacio(self):
        plano = [w * 10 + k * 2.4 for w in range(100) for k in range(4)]
        self.assertEqual(clips.momentos(plano), [])
        self.assertEqual(clips.momentos([]), [])

    def test_chat_muy_rapido_necesita_umbral_mas_bajo(self):
        # chat de directo grande: 80 mensajes por ventana y un pico de 120 (1,5 veces)
        marcas = [w * 10 + k * 0.125 for w in range(200) for k in range(80)] + rafaga(1000, 40, 0.2)
        marcas.sort()
        self.assertEqual(clips.momentos(marcas, cuantos=1), [])
        self.assertEqual(round(clips.momentos_con_umbrales(marcas, cuantos=1)[0]["pico"]), 1000)

    def test_umbrales_prefiere_el_mas_exigente(self):
        r = clips.momentos_con_umbrales(self.marcas, cuantos=3)
        self.assertEqual([round(m["pico"]) for m in r], [2000, 1000, 2600])

    def test_pico_cerca_del_principio_no_da_inicio_negativo(self):
        marcas = [w * 10 + k * 2.4 for w in range(100) for k in range(4)] + rafaga(5, 40)
        self.assertEqual(clips.momentos(sorted(marcas), cuantos=1)[0]["inicio"], 0)


class ChatYVod(unittest.TestCase):
    def test_marcas_quitan_comandos_bots_y_repetidos(self):
        ms = [{"id": "1", "t": 5, "usuario": "ana", "texto": "jajaja"},
              {"id": "2", "t": 4, "usuario": "bob", "texto": "!sorteo"},
              {"id": "3", "t": 6, "usuario": "Nightbot", "texto": "sigue en redes"},
              {"id": "1", "t": 5, "usuario": "ana", "texto": "jajaja"},
              {"id": "4", "t": 3, "usuario": "eva", "texto": "  "}]
        self.assertEqual(clips.marcas_de_chat(ms), [5.0])

    def test_parsear_comentarios(self):
        resp = [{"data": {"video": {"comments": {"pageInfo": {"hasNextPage": True}, "edges": [
            {"node": {"id": "a", "contentOffsetSeconds": 10, "commenter": {"login": "ana"},
                      "message": {"fragments": [{"text": "hola "}, {"text": "mundo"}]}}},
            {"node": {"id": "b", "contentOffsetSeconds": 12, "commenter": None,
                      "message": {"fragments": []}}}]}}}}]
        ms, ultimo, mas = clips.parsear_comentarios(resp)
        self.assertEqual([m["texto"] for m in ms], ["hola mundo", ""])
        self.assertEqual((ultimo, mas), (12, True))

    def test_parsear_error_de_twitch(self):
        resp = [{"errors": [{"message": "failed integrity check"}], "data": {"video": {"comments": None}}}]
        with self.assertRaises(RuntimeError) as c:
            clips.parsear_comentarios(resp)
        self.assertIn("integrity", str(c.exception))
        with self.assertRaises(RuntimeError):
            clips.parsear_comentarios({})

    def test_elegir_vod(self):
        lista = [{"id": "v3", "duration": 16}, {"id": "v2", "duration": 8000, "title": "t"},
                 {"id": "v1", "duration": 9000}]
        self.assertEqual(clips.elegir_vod(lista)["id"], "2")
        self.assertEqual(clips.elegir_vod(lista)["url"], "https://www.twitch.tv/videos/2")
        self.assertEqual(clips.elegir_vod(lista, "v1")["id"], "1")
        with self.assertRaises(ValueError):
            clips.elegir_vod(lista, "99")
        with self.assertRaises(ValueError):
            clips.elegir_vod([])


class TituloTranscripcion(unittest.TestCase):
    def palabras(self, texto):
        return [{"text": t, "start": i, "end": i + 1} for i, t in enumerate(texto.split())]

    def test_salta_muletillas_y_corta_en_punto(self):
        p = self.palabras("Eh, pues bueno no me lo puedo creer. Mira esto otra vez")
        self.assertEqual(clips.titulo_de_transcripcion(p), "no me lo puedo creer.")

    def test_limita_palabras(self):
        p = self.palabras("uno dos tres cuatro cinco seis siete ocho nueve diez")
        self.assertEqual(clips.titulo_de_transcripcion(p, max_palabras=5), "uno dos tres cuatro cinco")

    def test_muy_corto_o_vacio_da_cadena_vacia(self):
        self.assertEqual(clips.titulo_de_transcripcion(self.palabras("eh vale pues")), "")
        self.assertEqual(clips.titulo_de_transcripcion([]), "")


if __name__ == "__main__":
    unittest.main()
