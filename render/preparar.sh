#!/bin/bash
# Instala three.js y GSAP en local y los copia a lib/ (la plantilla no usa CDN).
set -e
cd "$(dirname "$0")"
if [ ! -f package.json ]; then npm init -y > /dev/null; fi
npm install --silent three@0.170.0 gsap@3.15.0
mkdir -p lib
cp node_modules/three/build/three.module.js lib/
rm -rf lib/addons
cp -R node_modules/three/examples/jsm lib/addons
cp node_modules/gsap/dist/gsap.min.js lib/
echo "Listo. Ya puedes medir el render."
