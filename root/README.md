# 💬 Noothing

> Privacy-first, real-time PWA chat. No email. No phone. Just username + password.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourname/noothing.git
cd noothing

# Install backend
cd server && npm install

# Install frontend
cd ../client && npm install
```

### 2. Environment Variables

**`server/.env`**
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/noothing
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Visit: **http://localhost:5173**

---

## 🏗️ Architecture

```
Frontend (React + Vite)    →    Backend (Express + Socket.io)
      ↓                               ↓
  Tailwind CSS                   MongoDB (Mongoose)
  Socket.io Client               Cloudinary (Images)
  HTTP-only JWT Cookies          bcrypt + JWT Auth
```

---

## ✨ Features

| Feature | Status |
|---|---|
| Username-only auth | ✅ |
| Real-time messaging | ✅ |
| Typing indicators | ✅ |
| Read receipts (✓ ✓✓ 🔵) | ✅ |
| Online/offline status | ✅ |
| Image sharing (Cloudinary) | ✅ |
| View Once (5s self-destruct) | ✅ |
| Message edit & delete | ✅ |
| Group rooms | ✅ |
| 24h Burner rooms (TTL) | ✅ |
| Shareable invite links | ✅ |
| Profile + avatar upload | ✅ |
| PWA (installable) | ✅ |
| Mobile-first layout | ✅ |
| OLED dark mode | ✅ |
| Glassmorphism UI | ✅ |
| Message pagination (50/page) | ✅ |
| Session persistence (refresh) | ✅ |
| Visibility API reconnect | ✅ |
| Rate limiting | ✅ |
| /ping uptime route | ✅ |
| E2EE payload structure | ✅ Ready |

---

## 🔒 Security Checklist

- [x] Passwords hashed with bcrypt (12 salt rounds)
- [x] JWT stored in HTTP-only, Secure, SameSite cookies
- [x] Rate limiting on `/login` and `/register` (10 req / 15 min)
- [x] Username regex enforced on both frontend and backend
- [x] Images stored on Cloudinary only (never Base64 in DB)
- [x] Socket.io authenticated via cookie middleware
- [x] MongoDB strict indexing for performance
- [x] Input sanitization on all routes
- [x] CORS locked to client origin

---

## 🌐 Production Deployment

### Backend (Railway / Render / Fly.io)
```bash
cd server
npm start
```
Set all `.env` variables in your hosting dashboard.

### Frontend (Vercel / Netlify)
```bash
cd client
npm run build
# Deploy /dist folder
```

Set `.env.production` variables in hosting dashboard.

### UptimeRobot
Monitor: `https://your-api.com/ping`
Interval: Every 5 minutes

---

## 📱 PWA Install

On mobile Chrome/Safari:
1. Open the app URL
2. Tap **Share → Add to Home Screen**
3. App installs natively with full-screen OLED UI

---

## 🔮 Roadmap (E2EE Activation)

To activate end-to-end encryption:

1. Implement ECDH key exchange on login in `client/src/utils/cryptoPayload.js`
2. Replace placeholder `encryptText()` with AES-GCM via Web Crypto API
3. Store public keys in MongoDB User model
4. Backend already stores `encryptedPayload { iv, ciphertext, algorithm }`

---

## 📄 License

MIT © Noothing