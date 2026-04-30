# 🚨 LifeLine+

> **LifeLine+** — Real-time Emergency Response Platform for India

![Google Solution Challenge](https://img.shields.io/badge/Google%20Solution%20Challenge-2026-4285F4?style=for-the-badge&logo=google)
![Hack2Skill](https://img.shields.io/badge/Hack2Skill-Hosted-FF6B6B?style=for-the-badge)

![LifeLine+](https://img.shields.io/badge/LifeLine+-Rapid%20Crisis%20Response-red?style=for-the-badge)

![React 18](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite 5](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![Node.js Express](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socketdotio)
![Google Maps](https://img.shields.io/badge/Google%20Maps-Live%20Data-4285F4?style=flat-square&logo=googlemaps)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-8E75B2?style=flat-square&logo=google)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Admin-FFCA28?style=flat-square&logo=firebase)


```text

                    ██╗     ██╗███████╗███████╗    ██╗     ██╗███╗   ██╗███████╗+
                    ██║     ██║██╔════╝██╔════╝    ██║     ██║████╗  ██║██╔════╝+
                    ██║     ██║█████╗  █████╗      ██║     ██║██╔██╗ ██║█████╗  +
                    ██║     ██║██╔══╝  ██╔══╝      ██║     ██║██║╚██╗██║██╔══╝  +
                    ███████╗██║██║     ███████╗    ███████╗██║██║ ╚████║███████╗+
                    ╚══════╝╚═╝╚═╝     ╚══════╝    ╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝+

                                "Saving minutes. Saving lives."

```

**LifeLine+** is a production-ready full-stack emergency response platform built for India. It accelerates crisis coordination in hospitality and public spaces by combining real-time ambulance tracking, smart hospital discovery, traffic-aware routing, police alerts, doctor bookings, and AI-powered emergency verification — all in one unified mobile-first experience.

## 🌍 Live Deployment

The platform is successfully deployed on two different cloud stacks:

### ☁️ Google Cloud Run Stack
- **Frontend**: [https://lifeline-frontend-240882103415.us-central1.run.app/](https://lifeline-frontend-240882103415.us-central1.run.app/)
- **Backend**: [https://lifeline-backend-240882103415.us-central1.run.app/](https://lifeline-backend-240882103415.us-central1.run.app/)

### ⚡ Hybrid Stack (Vercel + Render)
- **Frontend (Vercel)**: [https://lifelineplus.vercel.app](https://lifelineplus.vercel.app)
- **Backend (Render)**: [https://lifeline-backend-q1au.onrender.com](https://lifeline-backend-q1au.onrender.com)

---


## 🧭 Problem Statement

**[Rapid Crisis Response] Accelerated Emergency Response and Crisis Coordination in Hospitality**

> This project is our submission for the **Google Solution Challenge 2026**, hosted on the **Hack2Skill** platform.

Emergency response often breaks down because nearby services, traffic-aware routes, ambulance availability, police coordination, and verified civilian help are disconnected. LifeLine+ turns those fragmented steps into one live, mobile-first emergency workflow.

## ✨ Core Features

| Area | Implementation |
| --- | --- |
| 📍 Smart Discovery | Browser geolocation + Google Places API for hospitals, doctors, police, and pharmacies |
| 🗺️ Maps | Google Maps JS API, markers, route polylines, traffic layer, dark mode, 2D/tilted satellite 3D toggle |
| 🚑 Emergency Flow | Auto-select nearest open hospital, fetch alternate Directions API routes, rank fastest by traffic ETA |
| 🚐 Ambulance Booking | Stable zone-based ambulance fleet, 5-minute production acceptance window, Socket.io live GPS simulation |
| 🚗 Civilian Mode | Gemini validates vehicle number, purpose, and contact before temporary emergency activation |
| 🚓 Police Alerts | Google Places police station detection around route points, alert broadcast through Socket.io |
| 🏥 Doctors | Google Places-backed nearby doctor/clinic discovery, specialty filter, slots, booking confirmation |
| 🔐 Auth | Firebase Google sign-in primary flow + email/name localStorage fallback session |
| ⚡ UX | Blinkit/Uber-inspired card UI, sticky bottom nav, floating SOS, voice trigger, PWA support |

## 🧱 Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS, Vite PWA, Firebase Web SDK |
| Maps | Google Maps JavaScript API, Places API, Directions API, Distance Matrix API |
| Realtime | Socket.io client/server |
| Backend | Node.js, Express, Helmet, CORS, Compression, Morgan |
| AI | Gemini 1.5 Flash through backend API |
| Persistence | Optional Firebase Admin Firestore writes with in-memory fallback |
| Deploy | Successfully deployed on Google Cloud Run and Vercel+Render |

## 📁 Folder Structure

```text
Life_Line/
├── backend/
│   ├── lib/
│   │   ├── firebaseAdmin.js
│   │   └── googleMaps.js
│   ├── routes/
│   │   ├── ambulance.js
│   │   ├── booking.js
│   │   ├── police.js
│   │   ├── routes.js
│   │   ├── services.js
│   │   └── verify.js
│   ├── sockets/
│   │   └── handlers.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── lifeline.svg
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── ARCHITECTURE.md
├── CORE_LOGIC.md
├── INSTRUCTIONS.md
├── LICENSE
└── README.md
```

## ⚙️ Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 3. Health Check

```bash
curl http://localhost:5000/api/health
```

## 🔑 Environment Variables

Private secrets belong only in `.env`. The committed `.env.example` files use placeholders.

### Backend `.env`

```env
PORT=5000
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
DRIVER_RESPONSE_TIMEOUT_MS=5000
```

### Frontend `.env`

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:0000000000000000000000
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_BACKEND_URL=http://localhost:5000
```

## 📡 API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Server, Firebase, Maps, Gemini status |
| `GET` | `/api/nearest-services` | Google Places nearby hospitals, police, doctors, pharmacies |
| `GET` | `/api/nearest-services/details/:placeId` | Place details |
| `GET` | `/api/routes/emergency` | Directions API routes with traffic ETA |
| `GET` | `/api/routes/traffic` | Distance Matrix traffic probe |
| `GET` | `/api/ambulance-request/nearby` | Nearby ambulances from live fleet state |
| `POST` | `/api/ambulance-request/request` | Create emergency ambulance request |
| `GET` | `/api/ambulance-request/request/:requestId` | Request status |
| `POST` | `/api/ambulance-request/location-update` | Driver GPS update |
| `POST` | `/api/verify/civilian` | Gemini civilian emergency verification |
| `POST` | `/api/verify/chat` | Gemini emergency assistant through backend |
| `GET` | `/api/booking/doctors` | Places-backed doctor discovery |
| `GET` | `/api/booking/slots/:doctorId` | Appointment slots |
| `POST` | `/api/booking/appointment` | Book doctor appointment |
| `GET` | `/api/police/stations` | Nearby police stations from Places API |
| `POST` | `/api/police/alert` | Police alert with route context |

## 🚀 Deployment

### Frontend on Vercel

```bash
cd frontend
npm run build
```

Set every `VITE_*` variable in Vercel Project Settings before deploying.

### Backend on Render

```bash
cd backend
npm start
```

Set backend env variables in Render. Use `NODE_ENV=production` for the real 5-minute ambulance response window.

## 🧪 Verification

Recommended checks before deployment:

```bash
cd backend && npm start
cd frontend && npm run build
```

Manual flow to validate:

1. Open `http://localhost:5173`.
2. Allow location access.
3. Sign in with Firebase Google or email fallback.
4. Open Emergency Mode.
5. Confirm nearest hospital route and route alternatives.
6. Book ambulance and watch Socket.io tracking updates.
7. Test Civilian Mode and police alert activation.
8. Book a doctor appointment.

## ☁️ Google Cloud Run Deployment

LifeLine+ is fully deployable on Google Cloud Run with auto-scaling, HTTPS, and full WebSocket support.

### Prerequisites

1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Authenticate: `gcloud auth login`
3. Set project: `gcloud config set project YOUR_PROJECT_ID`

### Backend Deployment

```bash
# Build and deploy backend
gcloud run deploy lifeline-backend \
  --source ./backend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_MAPS_API_KEY=your_key,GEMINI_API_KEY=your_key,FIREBASE_PROJECT_ID=your_id,FRONTEND_URL=https://your-frontend-url.run.app,NODE_ENV=production"
```

### Frontend Deployment

```bash
# Build and deploy frontend
gcloud run deploy lifeline-frontend \
  --source ./frontend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "VITE_BACKEND_URL=https://your-backend-url.run.app"
```

### Environment Variables

**Backend:**

- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `GEMINI_API_KEY` - Gemini AI API key
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Firebase service account private key
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `FRONTEND_URL` - Frontend Cloud Run URL (for CORS)
- `NODE_ENV=production` - Production mode

**Frontend:**

- `VITE_BACKEND_URL` - Backend Cloud Run URL

### Health Checks

Both services include health check endpoints:

- Backend: `https://your-backend-url.run.app/health`
- Frontend: `https://your-frontend-url.run.app/health`

## 📚 Project Docs

| File | Purpose |
| --- | --- |
| [INSTRUCTIONS.md](INSTRUCTIONS.md) | File-by-file working principles and runbook |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Mermaid architecture diagrams |
| [CORE_LOGIC.md](CORE_LOGIC.md) | Emergency pipelines and process flows |
| [LICENSE](LICENSE) | Project license |

## 👥 Team: LifeLine+

We are the **LifeLine+** team, participating in the **Google Solution Challenge 2026** hosted by **Hack2Skill**.

> **Note:** This project was built for hackathon purposes as part of the Google Solution Challenge 2026.

| Member | Role |
| --- | --- |
| Babin Bid | Team Lead |
| Atanu Saha | Frontend Developer |
| Rohit Kumar Adak | Idea Provider, Tech Architect & Backend Developer |
| Sagnik Bachhar | Researcher |

## ⚠️ Safety Note

LifeLine+ is built for rapid coordination, but life-threatening emergencies should still call official Indian emergency numbers such as `108` or `112` immediately.

**Faster response. Safer India.**
  
## License  
This project is licensed under the [LICENSE](LICENSE) file. 
