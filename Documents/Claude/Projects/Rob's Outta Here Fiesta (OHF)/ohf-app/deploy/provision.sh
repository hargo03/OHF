#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Updating system packages..."
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "Installing base dependencies..."
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  debian-keyring \
  debian-archive-keyring \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  ufw

if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
else
  echo "Node.js already installed."
fi

if ! command -v caddy >/dev/null 2>&1; then
  echo "Installing Caddy..."
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y caddy
else
  echo "Caddy already installed."
fi

echo "Configuring firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
if ! ufw status | grep -q "Status: active"; then
  ufw --force enable
fi

echo "Creating deployment directories..."
mkdir -p /opt/ohf/releases
mkdir -p /opt/ohf/data
mkdir -p /etc/ohf

echo "Writing systemd service..."
cp "$SCRIPT_DIR/ohf.service" /etc/systemd/system/ohf.service
systemctl daemon-reload
systemctl enable ohf.service

echo "Installing rollback helper..."
cp "$SCRIPT_DIR/rollback.sh" /usr/local/bin/ohf-rollback
chmod 755 /usr/local/bin/ohf-rollback

if [ ! -f /etc/ohf/ohf.env ]; then
  echo "Creating environment template..."
  cat <<EOF >/etc/ohf/ohf.env
PORT=3000
DATA_DIR=/opt/ohf/data
ANTHROPIC_API_KEY=replace-me
EOF
  chmod 600 /etc/ohf/ohf.env
fi

echo "Writing Caddy config..."
cp "$SCRIPT_DIR/Caddyfile" /etc/caddy/Caddyfile
systemctl reload caddy

echo "Provisioning complete."
echo "Next steps:"
echo "1. Edit /etc/ohf/ohf.env and set ANTHROPIC_API_KEY."
echo "2. Upload the first release and point /opt/ohf/current at it."
echo "3. Run: systemctl restart ohf"
echo "4. Check: systemctl status ohf --no-pager"
echo "5. Roll back with: ohf-rollback"