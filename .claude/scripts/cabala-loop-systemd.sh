#!/usr/bin/env bash
# cabala-loop-systemd.sh — Instala e ativa systemd user services para os crons do Cabala
# Requer: systemd (Linux) com --user session ativa
# Uso: ./cabala-loop-systemd.sh [install|uninstall|status]

set -euo pipefail

ACTION="${1:-status}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="/home/skynet/cabala-dos-caminhos"
SYSTEMD_DIR="${HOME}/.config/systemd/user"

install() {
  echo "=== Installing Cabala Loop systemd services ==="

  mkdir -p "$SYSTEMD_DIR"

  # ─── cabala-quick ──────────────────────────────────────────────────────────
  cat > "${SYSTEMD_DIR}/cabala-quick.service" <<'EOF'
[Unit]
Description=Cabala Quick Cycle — every 20 min
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/home/skynet/cabala-dos-caminhos/.claude/scripts/cabala-loop-runner.sh quick
Environment=CLAUDE_MODEL=MiniMax-M2.7
StandardOutput=append:/home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-quick.log
StandardError=append:/home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-quick.err
EOF

  cat > "${SYSTEMD_DIR}/cabala-quick.timer" <<'EOF'
[Unit]
Description=Cabala Quick Cycle — every 20 min (:13, :33, :53)
After=network-online.target

[Timer]
OnCalendar=*:13,33,53
Persistent=true
Unit=cabala-quick.service

[Install]
WantedBy=timers.target
EOF

  # ─── cabala-hourly ─────────────────────────────────────────────────────────
  cat > "${SYSTEMD_DIR}/cabala-hourly.service" <<'EOF'
[Unit]
Description=Cabala Hourly Cycle — top of every hour at :07
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/home/skynet/cabala-dos-caminhos/.claude/scripts/cabala-loop-runner.sh hourly
Environment=CLAUDE_MODEL=MiniMax-M2.7
StandardOutput=append:/home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-hourly.log
StandardError=append:/home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-hourly.err
EOF

  cat > "${SYSTEMD_DIR}/cabala-hourly.timer" <<'EOF'
[Unit]
Description=Cabala Hourly Cycle — every hour at :07
After=network-online.target

[Timer]
OnCalendar=*:07
Persistent=true
Unit=cabala-hourly.service

[Install]
WantedBy=timers.target
EOF

  # ─── cabala-night ──────────────────────────────────────────────────────────
  cat > "${SYSTEMD_DIR}/cabala-night.service" <<'EOF'
[Unit]
Description=Cabala Night Shift — long-running overnight
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/home/skynet/cabala-dos-caminhos/.claude/scripts/cabala-loop-runner.sh night
Environment=CLAUDE_MODEL=MiniMax-M2.7
StandardOutput=append:/home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-night.log
StandardError=append:/home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-night.err
EOF

  cat > "${SYSTEMD_DIR}/cabala-night.timer" <<'EOF'
[Unit]
Description=Cabala Night Shift — 23:00 every day
After=network-online.target

[Timer]
OnCalendar=*-*-* 23:00:00
Persistent=true
Unit=cabala-night.service

[Install]
WantedBy=timers.target
EOF

  # ─── cabala-standup ────────────────────────────────────────────────────────
  cat > "${SYSTEMD_DIR}/cabala-standup.service" <<'EOF'
[Unit]
Description=Cabala Daily Standup — weekdays 9am
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/home/skynet/cabala-dos-caminhos/.claude/scripts/cabala-loop-runner.sh standup
Environment=CLAUDE_MODEL=MiniMax-M2.7
StandardOutput=append:/home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-standup.log
StandardError=append:/home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-standup.err
EOF

  cat > "${SYSTEMD_DIR}/cabala-standup.timer" <<'EOF'
[Unit]
Description=Cabala Daily Standup — weekdays at 9am
After=network-online.target

[Timer]
OnCalendar=Mon..Fri *-*-* 09:00:00
Persistent=true
Unit=cabala-standup.service

[Install]
WantedBy=timers.target
EOF

  echo "Services installed. Now run:"
  echo "  systemctl --user daemon-reload"
  echo "  systemctl --user enable --now cabala-quick.timer"
  echo "  systemctl --user enable --now cabala-hourly.timer"
  echo "  systemctl --user enable --now cabala-night.timer"
  echo "  systemctl --user enable --now cabala-standup.timer"
  echo ""
  echo "View status with: systemctl --user list-timers"
}

uninstall() {
  echo "=== Uninstalling Cabala Loop systemd services ==="
  for svc in cabala-quick cabala-hourly cabala-night cabala-standup; do
    systemctl --user stop "${svc}.timer" 2>/dev/null || true
    systemctl --user disable "${svc}.timer" 2>/dev/null || true
    rm -f "${SYSTEMD_DIR}/${svc}.service" "${SYSTEMD_DIR}/${svc}.timer"
  done
  echo "Done."
}

status() {
  echo "=== Cabala Loop systemd status ==="
  if command -v systemctl &>/dev/null; then
    echo ""
    echo "--- Active timers ---"
    systemctl --user list-timers --all 2>/dev/null | grep cabala || echo "No cabala timers active"
    echo ""
    echo "--- Next runs ---"
    systemctl --user list-timers 2>/dev/null | grep -E "cabala|NEXT" | head -20
    echo ""
    echo "--- Recent service outputs ---"
    for svc in cabala-quick cabala-hourly cabala-night cabala-standup; do
      LOG="${HOME}/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/${svc}.log"
      if [ -f "$LOG" ]; then
        echo "=== ${svc}.log (last 3 lines) ==="
        tail -3 "$LOG"
        echo ""
      fi
    done
  else
    echo "systemd not available — use cron fallback instead"
  fi
}

case "$ACTION" in
  install)   install ;;
  uninstall) uninstall ;;
  status)    status ;;
  *)         echo "Usage: $0 [install|uninstall|status]" ;;
esac
