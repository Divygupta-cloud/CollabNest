# TaskFlow (Jira Clone)

A full-stack project management system inspired by Jira with RBAC, Kanban board, sprints, epics, and subtasks.

---

## 🚀 How to Run the Project

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (running locally on `mongodb://localhost:27017` or configured via `backend/.env`)

### 1. Install Dependencies
Run inside the respective folders:
```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

### 2. Seed Database (First-time setup)
Populates MongoDB with initial projects, users, teams, sprints, and issues:
```bash
cd backend
npm run seed
```

### 3. Start the Servers
You can run both from the root or in separate terminals:

#### From the root folder (`jira_clone/`):
```bash
# Terminal 1: Frontend
npm run dev:frontend

# Terminal 2: Backend
npm run dev:backend
```

#### Or individually:
```bash
# Frontend (http://localhost:5173)
cd frontend && npm run dev

# Backend (http://localhost:5000)
cd backend && npm run dev
```

### 4. Build for Production
From the root:
```bash
npm run build
```

---

## 💾 How Data is Stored

1. **MongoDB Database (Primary Persistence)**:
   - All core entities (`Users`, `Projects`, `Teams`, `Sprints`, `Issues`, `Comments`, `Activities`) are stored in MongoDB.
   - Configured in `backend/.env` via `MONGODB_URI` (default: `mongodb://localhost:27017/taskflow`).

2. **Frontend Reactive Store & Cache**:
   - Uses an in-memory reactive store (`frontend/src/mocks/store.ts`) synchronized via React's `useSyncExternalStore`.
   - **Optimistic UI Updates**: UI changes immediately on user action, then syncs asynchronously with the backend API (`PUT/POST/PATCH`).
   - **Offline / LocalStorage Fallback**: Caches latest state under `taskflow_store_v2` in the browser so the app remains fully functional and snappy even if the backend is restarting.

---

## 🔑 Default Credentials & Personas

| Role | Username | Password | Email |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `password123` | alex.rivera@taskflow.dev |
| **Manager** | `manager` | `password123` | michael.scott@taskflow.dev |
| **Team Lead** | `teamlead` | `password123` | david.kim@taskflow.dev |
| **Developer** | `employee` | `password123` | jessica.taylor@taskflow.dev |
| **QA** | `qa` | `password123` | priya.patel@taskflow.dev |
