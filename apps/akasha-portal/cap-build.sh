#!/bin/bash
# cap-build.sh — Build local Capacitor APK com assets Next.js
# Uso: ./cap-build.sh  (de apps/akasha-portal/ ou da raiz)
set -e

# Resolve absolute paths relative to script location
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CAPACITOR_DIR="$SCRIPT_DIR"
NEXT_OUTPUT_DIR="$CAPACITOR_DIR/.next/standalone/apps/akasha-portal"
WEB_DIR="$CAPACITOR_DIR/capacitor"

echo "=== Akasha Capacitor Build ==="
echo "Script dir: $CAPACITOR_DIR"
echo "Next output: $NEXT_OUTPUT_DIR"

# 1. Verifica se existe build standalone
if [ ! -d "$NEXT_OUTPUT_DIR/public" ]; then
  echo "ERRO: Build standalone não encontrado em $NEXT_OUTPUT_DIR/public"
  echo "Rode: cd apps/akasha-portal && pnpm build"
  exit 1
fi

# 2. Copia assets para webDir do Capacitor
echo "Copiando assets de $NEXT_OUTPUT_DIR/public → $WEB_DIR/"
rm -rf "$WEB_DIR"
cp -r "$NEXT_OUTPUT_DIR/public" "$WEB_DIR"
echo "OK: $(ls "$WEB_DIR" | wc -l) arquivos copiados"

# 3. Copia package.json se existir
if [ -f "$NEXT_OUTPUT_DIR/package.json" ]; then
  cp "$NEXT_OUTPUT_DIR/package.json" "$WEB_DIR/package.json"
fi

# 4. Sync para Android
echo "Sync Capacitor → Android..."
cd "$CAPACITOR_DIR"
npx cap sync android

echo ""
echo "=== Build concluído ==="
echo "Para gerar APK: cd android && ./gradlew assembleDebug"
echo "APK em: android/app/build/outputs/apk/debug/"
