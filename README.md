# SmartWasteX – AI-Based Smart Waste Management System

A full-stack professional smart city web application for real-time waste monitoring, worker tracking, and garbage collection management using an AI-based simulated image analysis approach.

## 🌟 Features
- **Role-Based Authentication**: Admin, Area Head, Worker. Secure JWT auth.
- **Smart Dashboard**: Real-time stats, animated charts (Recharts), and modern glassmorphism UI.
- **AI-Simulated Image Analysis**: Upload bin images and simulate AI detection (Empty, Medium, Full, Overflow).
- **Interactive Heatmap**: Visual map of pollution levels across areas using Leaflet.
- **Society Cleanliness Leaderboard**: AI-scored rankings of societies.
- **Worker Tracking**: Monitor worker activity and route efficiency.
- **Smart Garbage Collection**: Create pickup requests and assign workers.

## 🛠️ Tech Stack
**Frontend:**
- React.js + Vite
- Tailwind CSS + Framer Motion (for smooth animations and modern UI)
- Recharts (Analytics)
- React Leaflet (Maps)
- Lucide React (Icons)
- Axios

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JSON Web Token (JWT) + Bcryptjs

## 📂 Folder Structure

```
SmartWasteX/
│
├── backend/
│   ├── config/          # DB Configuration
│   ├── controllers/     # API logic (auth, waste, analytics, etc.)
│   ├── middleware/      # JWT auth middleware
│   ├── models/          # MongoDB Schemas (User, WasteUpload, PickupRequest, WorkerTracking)
│   ├── routes/          # Express Routers
│   ├── .env             # Environment variables
│   └── server.js        # Main entry point for backend
│
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable UI components (Sidebar, Topbar)
│   │   ├── layouts/     # Main wrapper layouts
│   │   ├── pages/       # Route-level pages (Dashboard, Heatmap, Upload, etc.)
│   │   ├── index.css    # Tailwind base styles
│   │   └── App.jsx      # React Router config
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed locally (or a MongoDB Atlas URI)

### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Environment Variables: The `.env` file is already created. Make sure `MONGO_URI` is correct for your local or remote MongoDB instance.
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/smartwaste
   JWT_SECRET=supersecretjwtkey12345
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   *(Or run `node server.js`)*

### 2. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 3. Usage Guide
1. Open the app in your browser at `http://localhost:5173`.
2. Click **Get Started** or **Register** to create an account. You can select roles: *Admin*, *Area Head*, or *Worker*.
3. **Login** to access the dashboard.
4. **Upload Waste**: Simulates uploading an image from a worker's mobile device. Shows mock AI analysis results.
5. Explore the **Dashboard**, **Heatmaps**, **Worker Tracking**, **Rankings**, and **Pickup Management**.

---
*Created as part of a fully working modern smart-city solution.*
