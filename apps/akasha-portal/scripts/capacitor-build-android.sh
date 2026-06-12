#!/usr/bin/env bash
# =============================================================================
# Akasha — Build Android APK via Capacitor
# =============================================================================
# Requer:
#   - JDK 21+  (baixado em /home/skynet/java/jdk-21)
#   - Android SDK (baixado em /home/skynet/android-sdk)
#   - Node.js + pnpm
#
# Fluxo:
#   1. Build Next.js
#   2. Sync Capacitor → Android
#   3. Build Gradle APK
#
# Output: android/app/build/outputs/apk/debug/app-debug.apk

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CAPACITOR_DIR="$PROJECT_ROOT/apps/akasha-portal"

# ── JAVA & ANDROID SDK ────────────────────────────────────────────────────

export JAVA_HOME="${JAVA_HOME:-/home/skynet/java/jdk-21}"
export ANDROID_HOME="${ANDROID_HOME:-/home/skynet/android-sdk}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# Verificações
for bin in java sdkmanager gradle; do
  if ! command -v $bin &>/dev/null; then
    echo "[ERROR] $bin não encontrado. Verifique JAVA_HOME e ANDROID_HOME."
    exit 1
  fi
done

echo "Java: $(java -version 2>&1 | head -1)"
echo "Android SDK: $ANDROID_HOME"

# ── Build Next.js ────────────────────────────────────────────────────────

echo ""
echo "▶ Build Next.js..."
cd "$CAPACITOR_DIR"
NODE_OPTIONS='--max-old-space-size=4096' pnpm build

# ── Sync Capacitor ────────────────────────────────────────────────────────

echo ""
echo "▶ Sync Capacitor → Android..."
# O capacitor/index.html redireciona para o servidor de dev (localhost:3131)
# Para produção, configurar CAPACITOR_SERVER_URL no ambiente
pnpm exec cap sync android

# ── Build APK ─────────────────────────────────────────────────────────────

echo ""
echo "▶ Build APK..."
cd "$CAPACITOR_DIR/android"

# Usa o JDK 21 do sistema se disponível, caso contrário o default
if [ -x "$JAVA_HOME/bin/java" ]; then
  export PATH="$JAVA_HOME/bin:$PATH"
fi

./gradlew assembleDebug

APK=$(find . -name "*.apk" -type f -path "*/outputs/apk/*" | head -1)
if [ -f "$APK" ]; then
  echo ""
  echo "✅ APK gerado: $APK"
  ls -lh "$APK"
else
  echo "[ERROR] APK não encontrado após build."
  exit 1
fi
