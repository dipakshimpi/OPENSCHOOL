# 🚀 OpenSchool VPS Deployment Guide (Coolify)

This guide will walk you through deploying OpenSchool on your own VPS using Coolify. This setup eliminates Vercel limits and ngrok tunnels.

## 1. 🖥️ VPS Requirements
- **OS:** Ubuntu 24.04 (Clean install)
- **RAM:** Minimum 4GB (8GB recommended for PeerTube transcoding)
- **CPU:** at least 2 vCPUs

## 2. 🛠️ Install Coolify
Run this command on your fresh VPS via SSH:
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

## 3. 📦 Deploy PeerTube (The Engine)
1. In Coolify, go to **Resources** -> **Services** -> **PeerTube**.
2. Set the `PUBLIC_URL` to your domain (e.g., `https://video.yourschool.com`).
3. Follow the setup logs. Once running, access the admin panel to get your credentials.

## 4. 🌐 Deploy Web App (Next.js)
1. Add a new **Private Repository** (connect your GitHub).
2. Choose the `web` directory as the Base Directory.
3. Coolify will detect the `Dockerfile` automatically.
4. **Environment Variables:** Copy these from your `.env.local` to the Coolify "Environment Variables" tab:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `PEERTUBE_API_URL` (Use the internal Coolify service name, e.g., `http://peertube:9000`)
   - `PEERTUBE_ADMIN_USER`
   - `PEERTUBE_ADMIN_PASSWORD`
   - `PEERTUBE_CLIENT_ID`
   - `PEERTUBE_CLIENT_SECRET`

## 5. ☁️ Object Storage (Optional but Recommended)
For unlimited video storage, connect **Cloudflare R2** or **Backblaze B2** in the PeerTube settings on your VPS.

## 6. ✅ Benefits of this Setup
- **No Upload Limits:** You can upload 4GB+ videos easily.
- **Fast internal networking:** The Web App and PeerTube talk locally, not over the internet.
- **Cost control:** One fixed VPS price.
- **Privacy:** You own the data.
