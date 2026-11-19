"""Pruebas de la lógica de herramientas/clips_cola.py (sin disco ni ffmpeg).

    voces/.venv/bin/python -m unittest tests.test_clips_cola
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "herramientas"))
import clips_cola  # noqa: E402

HECHOS = {
    "a": {"canal": "x", "hecho": "2026-11-18 10:00"},
    "b": {"canal": "x", "hecho": "2026-11-18 12:00", "subido": "2026-11-18 13:00"},
    "c": {"canal": "y", "hecho": "2026-11-18 14:00"},
    "d": {"canal": "y", "hecho": "2026-11-17 09:00", "descartado": "no se entiende"},
    "e": {"canal": "y", "hecho": "2026-11-17 08:00", "subido": "2026-11-17 20:00"},
}


class Cola(unittest.TestCase):
    def test_pendientes_sin_subidos_ni_descartados_y_nuevos_primero(self):
        self.assertEqual([i for i, _ in clips_cola.pendientes(HECHOS)], ["c", "a"])

    def test_pendientes_vacio(self):
        self.assertEqual(clips_cola.pendientes({}), [])

    def test_subidos_el_dia(self):
        self.assertEqual(clips_cola.subidos_el(HECHOS, "2026-11-18"), 1)
        self.assertEqual(clips_cola.subidos_el(HECHOS, "2026-11-17"), 1)
        self.assertEqual(clips_cola.subidos_el(HECHOS, "2026-11-16"), 0)

    def test_bitrate_cabe_en_el_tope(self):
        for dur in (20, 45, 75):
            kbps = clips_cola.kbps_para(dur)
            self.assertLess((kbps + 128) * 1000 / 8 * dur, clips_cola.TOPE_BYTES)
        self.assertGreater(clips_cola.kbps_para(20), clips_cola.kbps_para(75))

    def test_bitrate_duracion_mala(self):
        with self.assertRaises(ValueError):
            clips_cola.kbps_para(0)

    def test_censurar_tapa_los_insultos_fuertes_y_deja_el_resto(self):
        self.assertEqual(clips_cola.censurar("ME CAGO EN TU PUTA MADRE"), "ME CAGO EN TU P*** MADRE")
        self.assertEqual(clips_cola.censurar("hijo de puta, qué putada"), "hijo de p***, qué putada")
        self.assertEqual(clips_cola.censurar("Los putos coches"), "Los p**** coches")
        self.assertEqual(clips_cola.censurar("disputa computadora"), "disputa computadora")

    def test_texto_de(self):
        ps = [{"text": " hola "}, {"text": None}, {"text": "mundo"}]
        self.assertEqual(clips_cola.texto_de(ps), "hola  mundo")
        self.assertEqual(len(clips_cola.texto_de([{"text": "a" * 50}] * 20, 100)), 100)



class Tanda(unittest.TestCase):
    def setUp(self):
        import clips_tanda
        self.t = clips_tanda
        self.cfg = {"canales": [{"canal": "rubius", "min_visitas": 300, "horas_directo": 1},
                                {"canal": "kaicenat", "idioma": "en"}], "clips_por_canal": 2}

    def test_ordenes_por_canal(self):
        o = self.t.ordenes(self.cfg)
        self.assertEqual([x[:2] for x in o], [["hacer", "rubius"], ["directo", "rubius"],
                                             ["hacer", "kaicenat"], ["directo", "kaicenat"]])
        self.assertIn("en", o[2])
        self.assertEqual(o[0][o[0].index("--cuantos") + 1], "2")

    def test_solo_clips(self):
        self.assertEqual([x[0] for x in self.t.ordenes(self.cfg, solo_clips=True)], ["hacer", "hacer"])

    def test_config_mala(self):
        for mala in ({}, {"canales": []}, {"canales": [{"idioma": "es"}]}):
            with self.assertRaises(ValueError):
                self.t.ordenes(mala)


if __name__ == "__main__":
    unittest.main()
