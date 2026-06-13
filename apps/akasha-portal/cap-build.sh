#!/bin/bash
# cap-build.sh — Build local Capacitor APK com assets Next.js
# Uso: ./cap-build.sh  (de apps/akasha-portal/ ou da raiz)
set -e

# Resolve absolute paths relative to script location
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CAPACITOR_DIR="$SCRIPT_DIR"
NEXT_OUTPUT_DIR="$CAPACITOR_DIR/.next/standalone/apps/akasha-portal"
WEB_DIR="$CAPACITOR_DIR/capacitor"

# Detect Java and Android SDK
JAVA_HOME_DIR="$(ls -d /home/skynet/java/jdk-* 2>/dev/null | sort -V | tail -1)"
ANDROID_HOME_DIR="/home/skynet/android-sdk"

if [ -z "$JAVA_HOME_DIR" ]; then
  echo "ERRO: Java não encontrado em /home/skynet/java/"
  echo "Instale OpenJDK 21: apt install openjdk-21-jdk"
  exit 1
fi

if [ ! -d "$ANDROID_HOME_DIR" ]; then
  echo "ERRO: Android SDK não encontrado em $ANDROID_HOME_DIR"
  exit 1
fi

export JAVA_HOME="$JAVA_HOME_DIR"
export ANDROID_HOME="$ANDROID_HOME_DIR"
export PATH="$JAVA_HOME_DIR/bin:$PATH"

echo "=== Akasha Capacitor Build ==="
echo "Java: $JAVA_HOME_DIR"
echo "Android SDK: $ANDROID_HOME_DIR"
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

# 5. Build APK
echo "Build APK Android..."
cd "$CAPACITOR_DIR/android"
./gradlew assembleDebug

APK_PATH="$CAPACITOR_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
  echo ""
  echo "=== APK gerado com sucesso ==="
  echo "Caminho: $APK_PATH"
  echo "Tamanho: $APK_SIZE"
else
  echo "ERRO: APK não encontrado em $APK_PATH"
  exit 1
fi
