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


if __name__ == "__main__":
    unittest.main()
