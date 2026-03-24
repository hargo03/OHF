#!/bin/bash
set -euo pipefail

# First-time deployment script for OHF
# Run this once on the server to set up directories, install dependencies, and deploy the initial release
# Usage: bash first-deploy.sh

REPO_URL="${REPO_URL:-https://github.com/hargo03/OHF.git}"
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Error: ANTHROPIC_API_KEY environment variable is required"
  echo "Usage: ANTHROPIC_API_KEY=sk-ant-... bash first-deploy.sh"
  exit 1
fi

echo "====== OHF First Deployment ======"
echo "Repo: $REPO_URL"
echo ""

# Step 1: Clone the repo
echo "Cloning repository..."
if [ -d /opt/ohf-app ]; then
  rm -rf /opt/ohf-app
fi
git clone "$REPO_URL" /opt/ohf-app
cd /opt/ohf-app

# Step 2: Run provisioning
echo ""
echo "Running system provisioning..."
bash deploy/provision.sh

# Step 3: Create environment file
echo ""
echo "Creating environment file at /etc/ohf/ohf.env..."
cat <<EOF >/etc/ohf/ohf.env
PORT=3000
DATA_DIR=/opt/ohf/data
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
EOF
chmod 600 /etc/ohf/ohf.env
echo "✓ Environment file created"

# Step 4: Deploy initial release
echo ""
echo "Deploying initial release..."
initial_release="/opt/ohf/releases/$(date +%s)-initial"
mkdir -p "$initial_release"
cp -R /opt/ohf-app/* "$initial_release/"

cd "$initial_release"
npm install --omit=dev

# Step 5: Link and start
echo ""
echo "Activating release..."
ln -sfn "$initial_release" /opt/ohf/current

echo "Starting ohf service..."
systemctl restart ohf
sleep 2
systemctl status ohf --no-pager

# Step 6: Verify
echo ""
echo "Verifying deployment..."
if curl -s http://localhost:3000/api/messages >/dev/null 2>&1; then
  echo "✓ App is responding on port 3000"
else
  echo "⚠ Warning: Could not reach app on port 3000"
fi

echo ""
echo "====== Deployment Complete ======"
echo "App available at: https://ohf.theghari.com"
echo "Caddy config: /etc/caddy/Caddyfile"
echo "Service logs: journalctl -u ohf -f"
echo "Rollback: ohf-rollback"
