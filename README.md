# HealthOS 🏥⚡

An enterprise-grade, modular Health Operating System architecture built with a **FastAPI (Python)** backend and a *React + Vite* frontend.

---

## 🏗️ Project Architecture

```text
HealthOS/
├── backend/                  # FastAPI Python Service
│   ├── app/
│   │   ├── api/              # API router versioning & endpoints
│   │   ├── core/             # Application settings & database core
│   │   ├── models/           # Database ORM models
│   │   ├── schemas/          # Pydantic data schemas
│   │   ├── services/         # Business logic layer
│   │   └── main.py           # FastAPI entry point & CORS configuration
│   ├── tests/                # Automated backend test suite
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Backend environment variables
│
├── frontend/                 # React + Vite Client Application
│   ├── src/
│   │   ├── assets/           # Media & brand assets
│   │   ├── components/       # Reusable UI & Layout components
│   │   ├── pages/            # View components / Routes
│   │   ├── services/         # API HTTP Client layer
│   │   ├── hooks/            # Custom React hooks
│   │   ├── styles/           # CSS tokens & styling modules
│   │   ├── utils/            # Helper utilities
│   │   ├── App.jsx           # Root React App wrapper
│   │   └── main.jsx          # DOM entry point
│   ├── package.json          # Node dependencies
│   └── .env.example          # Frontend environment variables
│
├── .gitignore                # Root git ignore specification
├── .env.example              # Root environment template
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: `3.10` or higher
- **Node.js**: `18.0` or higher
- **npm**: `9.0` or higher

---

### 1️⃣ Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the API development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - API interactive docs (Swagger UI): `http://localhost:8000/docs`
   - API Health Check endpoint: `http://localhost:8000/api/v1/health`

---

### 2️⃣ Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   - Application URL: `http://localhost:5173`

---

## 🛠️ Code Conventions & Best Practices

- **Backend**: Clean architecture, domain-driven separation, PEP 8 styling, Pydantic data validation.
- **Frontend**: Component modularity, separation of UI and API services, custom CSS variables/tokens.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
