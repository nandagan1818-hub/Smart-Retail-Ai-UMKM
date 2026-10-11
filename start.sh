#!/bin/bash

# =============================================================
#  Smart Retail AI — Auto Start Script
#  Jalankan lokal  : bash start.sh
#  Jalankan online : bash start.sh --online
# =============================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Smart Retail AI — UMKM Dashboard   ║${NC}"
echo -e "${BLUE}║          Auto Start Script             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# --------------------------------------------------
# 1. Buka LangFlow Desktop
# --------------------------------------------------
echo -e "${YELLOW}[1/3] Membuka LangFlow Desktop...${NC}"

if [ -d "/Applications/Langflow .app" ]; then
  open "/Applications/Langflow .app"
  echo -e "${GREEN}  ✓ LangFlow Desktop dibuka${NC}"
else
  echo -e "${RED}  ✗ LangFlow Desktop tidak ditemukan di /Applications/${NC}"
  echo -e "    Pastikan LangFlow Desktop sudah terinstall."
fi

# --------------------------------------------------
# 2. Tunggu LangFlow siap (cek port 7860)
# --------------------------------------------------
echo -e "${YELLOW}[2/3] Menunggu LangFlow siap di port 7860...${NC}"
MAX_WAIT=30
COUNT=0
while ! curl -s --max-time 2 "http://localhost:7860/api/v1/version" > /dev/null 2>&1; do
  sleep 2
  COUNT=$((COUNT + 2))
  echo -e "    Menunggu... (${COUNT}s)"
  if [ $COUNT -ge $MAX_WAIT ]; then
    echo -e "${YELLOW}  ⚠ LangFlow belum merespons setelah ${MAX_WAIT}s, lanjut ke dashboard...${NC}"
    break
  fi
done

if curl -s --max-time 2 "http://localhost:7860/api/v1/version" > /dev/null 2>&1; then
  echo -e "${GREEN}  ✓ LangFlow siap!${NC}"
fi

# --------------------------------------------------
# 3. Jalankan dashboard React
# --------------------------------------------------
ONLINE_MODE=false
for arg in "$@"; do
  [[ "$arg" == "--online" ]] && ONLINE_MODE=true
done

if $ONLINE_MODE; then
  echo -e "${YELLOW}[3/3] Menjalankan Dashboard React + Tunnel Online...${NC}"
else
  echo -e "${YELLOW}[3/3] Menjalankan Dashboard React...${NC}"
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DASHBOARD_DIR="$SCRIPT_DIR/umkm-dashboard"

if [ ! -d "$DASHBOARD_DIR" ]; then
  echo -e "${RED}  ✗ Folder umkm-dashboard tidak ditemukan!${NC}"
  exit 1
fi

cd "$DASHBOARD_DIR"

# Install dependencies jika node_modules belum ada
if [ ! -d "node_modules" ]; then
  echo -e "    node_modules belum ada, install dulu..."
  npm install --silent
  echo -e "${GREEN}  ✓ Dependencies terinstall${NC}"
fi

# --------------------------------------------------
# Buka browser setelah server siap (deteksi port otomatis)
# --------------------------------------------------
(
  sleep 5
  # Deteksi port yang dipakai Vite
  PORT=5173
  for p in 5173 5174 5175 5176 5177; do
    if curl -s --max-time 2 "http://localhost:$p" > /dev/null 2>&1; then
      PORT=$p; break
    fi
  done

  LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "?.?.?.?")
  open "http://localhost:$PORT"

  if $ONLINE_MODE; then
    # Jalankan localtunnel di background (via npx — tidak perlu install lokal)
    TUNNEL_LOG="/tmp/lt_smartretail.log"
    npx --yes localtunnel@2 \
      --port "$PORT" --subdomain smartretailai-umkm > "$TUNNEL_LOG" 2>&1 &
    LT_PID=$!

    # Tunggu URL tunnel muncul
    TUNNEL_URL=""
    for i in $(seq 1 15); do
      sleep 1
      TUNNEL_URL=$(grep -o 'https://[^ ]*loca\.lt' "$TUNNEL_LOG" 2>/dev/null | head -1)
      [ -n "$TUNNEL_URL" ] && break
    done

    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     ✓ Dashboard + Tunnel Online aktif!           ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  Akses dari Mac ini:                             ║${NC}"
    echo -e "${GREEN}║    http://localhost:${PORT}                       ║${NC}"
    echo -e "${YELLOW}║                                                  ║${NC}"
    echo -e "${YELLOW}║  🌐 URL ONLINE (bagikan ke panitia):             ║${NC}"
    if [ -n "$TUNNEL_URL" ]; then
      echo -e "${YELLOW}║    ${TUNNEL_URL}${NC}"
    else
      echo -e "${YELLOW}║    Tunnel sedang terhubung... cek /tmp/lt_smartretail.log${NC}"
    fi
    echo -e "${YELLOW}║    ⚠ Panitia klik 'Click to Continue' dulu!     ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  Login:                                          ║${NC}"
    echo -e "${GREEN}║    admin   / admin123   (Admin)                  ║${NC}"
    echo -e "${GREEN}║    kasir   / kasir123   (Kasir)                  ║${NC}"
    echo -e "${GREEN}║    pemilik / pemilik123 (Pemilik)                ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  Tekan Ctrl+C untuk berhenti semua               ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
  else
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     ✓ Dashboard berhasil dijalankan!         ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  Akses dari Mac ini:                         ║${NC}"
    echo -e "${GREEN}║    http://localhost:${PORT}                   ║${NC}"
    echo -e "${YELLOW}║                                              ║${NC}"
    echo -e "${YELLOW}║  Akses dari device lain (WiFi sama):         ║${NC}"
    echo -e "${YELLOW}║    http://${LOCAL_IP}:${PORT}               ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  Login:                                      ║${NC}"
    echo -e "${GREEN}║    admin   / admin123   (Admin)              ║${NC}"
    echo -e "${GREEN}║    kasir   / kasir123   (Kasir)              ║${NC}"
    echo -e "${GREEN}║    pemilik / pemilik123 (Pemilik)            ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  Tekan Ctrl+C untuk berhenti                 ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
  fi
) &

# Jalankan dev server (foreground agar tidak langsung exit)
echo -e "${GREEN}  ✓ Menjalankan dev server...${NC}"
echo -e ""
npm run dev
