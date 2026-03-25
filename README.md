# 🎉 Rob's Outta Here Fiesta (OHF)

> An interactive farewell e-greeting card where guests sign in with nicknames, leave funny animated messages, and use AI to generate any animation they can imagine.

**Live at:** `ohf.theghari.com`

---

## How It Works

1. Guests visit the site and enter a fun nickname
2. They write a farewell message for Rob
3. They describe any animation they want ("confetti raining down", "rocket launching to the moon", etc.)
4. Claude AI generates that animation as live HTML/CSS/JS right in their browser
5. They preview it, then post it to the public wall
6. Everyone can see all the animated messages on the party wall 🎊

---

## Setup (Local)

### 1. Prerequisites
- Node.js 18 or higher
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### 2. Install
```bash
cd ohf-app
npm install
```

### 3. Configure
```bash
cp .env.example .env
# Open .env and add your Anthropic API key:
# ANTHROPIC_API_KEY=sk-ant-...
# Optional for production persistence:
# DATA_DIR=./data
```

### 4. Run
```bash
npm start
# Open http://localhost:3000
```

For auto-restart during development:
```bash
npm run dev
```

---

## Deploying to `ohf.theghari.com`

### Recommended — GitHub Actions + Hetzner + Caddy

This matches the deployment pattern used in the CRM project:

1. **Push this app to GitHub on the `main` or `master` branch**
   - Validation runs from `.github/workflows/ci.yaml`
   - Deployment runs from `.github/workflows/deploy.yaml`
   - The deploy workflow repeats the basic validation checks before activating a release

2. **Provision the server once**
   ```bash
   scp -r ohf-app root@YOUR_SERVER_IP:/opt/
   ssh root@YOUR_SERVER_IP
   cd /opt/ohf-app
   bash deploy/provision.sh
   ```

3. **Set the production environment file**
   ```bash
   nano /etc/ohf/ohf.env
   ```
   Example:
   ```bash
   PORT=3000
   DATA_DIR=/opt/ohf/data
   ANTHROPIC_API_KEY=sk-ant-...
   ```

4. **Install the initial release and start the service**
   ```bash
   mkdir -p /opt/ohf/releases/initial
   cp -R /opt/ohf-app/* /opt/ohf/releases/initial/
   cd /opt/ohf/releases/initial
   npm install --omit=dev
   ln -sfn /opt/ohf/releases/initial /opt/ohf/current
   systemctl restart ohf
   systemctl status ohf --no-pager
   ```

5. **Point DNS at the server**
   - Add an **A record** for `ohf.theghari.com` to your server IP

6. **Configure GitHub Actions secrets**
   - `HOST`: your server IP or hostname
   - `SSH_KEY`: the private SSH key GitHub Actions should use for deployment

7. **Deploy future updates automatically**
   - Every push to `main` or `master` runs CI validation first
   - The deploy workflow creates a bundled release, uploads it, extracts it to `/opt/ohf/releases/<run-id>-<sha>` and installs production dependencies there
   - `/opt/ohf/current` is updated to the new release and `/opt/ohf/previous` is updated to the prior one
   - Older releases are pruned automatically, keeping the newest five

8. **Roll back if needed**
   ```bash
   ohf-rollback
   ```
   - This swaps `/opt/ohf/current` back to `/opt/ohf/previous` and restarts the service

### Release Layout

- `/opt/ohf/releases/<release-id>`: immutable deployed releases
- `/opt/ohf/current`: symlink used by systemd
- `/opt/ohf/previous`: symlink used for rollback
- `/opt/ohf/data`: persistent message storage outside release directories

### Server Files

- `deploy/provision.sh` installs Node.js, Caddy, UFW rules, the systemd unit, and the environment file template
- `deploy/ohf.service` defines the `ohf` systemd service
- `deploy/rollback.sh` restores the previous deployed release
- `deploy/Caddyfile` proxies `ohf.theghari.com` to `127.0.0.1:3000`

### GitHub Secrets

- `HOST`
- `SSH_KEY`

### Option A — VPS / Cloud Server (recommended)

1. **Copy the app to your server:**
   ```bash
   scp -r ohf-app/ user@yourserver.com:/home/user/ohf-app
   ```

2. **SSH in and install:**
   ```bash
   ssh user@yourserver.com
   cd ohf-app
   npm install --production
   ```

3. **Create your `.env` file on the server:**
   ```bash
   echo "ANTHROPIC_API_KEY=sk-ant-YOUR_KEY" > .env
   echo "PORT=3000" >> .env
   ```

4. **Run with PM2 (keeps it alive):**
   ```bash
   npm install -g pm2
   pm2 start server.js --name ohf
   pm2 save
   pm2 startup
   ```

5. **Point your subdomain:** In your DNS (wherever theghari.com is managed), add an **A record**:
   ```
   ohf.theghari.com → YOUR_SERVER_IP
   ```

6. **Set up Nginx as a reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name ohf.theghari.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           # Longer timeout for AI animation generation (30s)
           proxy_read_timeout 60s;
       }
   }
   ```

7. **Enable HTTPS with Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d ohf.theghari.com
   ```

### Option B — Render.com (easiest free option)

1. Push the `ohf-app` folder to a GitHub repo
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo
4. Set:
   - **Build command:** `npm install`
   - **Start command:** `node server.js`
   - **Environment variable:** `ANTHROPIC_API_KEY=sk-ant-...`
5. Add a custom domain: `ohf.theghari.com`
6. Point your DNS CNAME to the Render URL

### Option C — Railway / Fly.io
Similar to Render — both support Node.js with custom domains and env vars.

---

## Data Storage

Messages are stored in `data/messages.json` on the server. This is a lightweight, no-setup solution perfect for a one-time party card.

For production deploys, prefer setting `DATA_DIR=/opt/ohf/data` so message storage lives outside the deployed app folder.

If you want to back up messages: just copy `data/messages.json`.

---

## Customization

### Change the honoree's name
Search and replace `Rob` in:
- `public/index.html` — page title, header, subtitle
- `server.js` — the Claude system prompt references "Rob's Outta Here Fiesta"

### Adjust Claude's animation style
Edit the `system` prompt in `server.js` inside the `generateAnimation()` function. Want darker humor? Weirder animations? Add instructions there.

### Card color themes
In `public/style.css`, find `.card-theme-0` through `.card-theme-5` and change the gradient colors.

---

## File Structure

```
ohf-app/
├── server.js          ← Express backend + Claude API
├── package.json
├── .env               ← Your secrets (not committed)
├── .env.example       ← Template
├── data/
│   └── messages.json  ← Auto-created, stores all messages
└── public/
    ├── index.html     ← Single-page app
    ├── style.css      ← All styles
    └── app.js         ← Frontend logic
```

---

## Notes

- **Animation generation takes ~5–15 seconds** — Claude is writing live HTML/CSS/JS for each animation. The loading spinner will show while it works.
- **Animations run in sandboxed iframes** — they can't access the rest of your page, cookies, or network. They're safe.
- **No database needed** — messages are stored in a JSON file. For a farewell party, this is plenty.

---

*Built with ❤️, Claude AI, and way too much confetti.*
