# TaskFlow — Team Task Manager

A full-stack web application for managing projects, assigning tasks, and tracking progress with role-based access control (Admin/Member).

## 🚀 Features

- **Authentication** — Secure signup/login with JWT tokens
- **Project Management** — Create, update, and delete projects with custom colors
- **Team Management** — Invite members via email, assign Admin/Member roles
- **Task Management** — Create, assign, and track tasks with Kanban board view
- **Dashboard** — Overview with stats, overdue alerts, and project progress
- **Role-Based Access Control** — Admins manage projects & members; Members manage their tasks

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite) + Vanilla CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Railway |

## 📦 Project Structure

```
├── server/
│   ├── index.js           # Express server entry
│   ├── models/             # Mongoose schemas (User, Project, Task)
│   ├── routes/             # REST API routes
│   └── middleware/         # Auth & RBAC middleware
├── client/
│   ├── src/
│   │   ├── components/     # Layout, shared components
│   │   ├── pages/          # Dashboard, Projects, ProjectDetail, Auth
│   │   ├── context/        # Auth context provider
│   │   └── api.js          # API client
│   └── index.html
├── package.json
└── README.md
```

## 🛠️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd team-task-manager

# Create .env from example
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Install all dependencies (server + client)
npm install

# Run in development mode
# Terminal 1: Start the server
npm run dev:server

# Terminal 2: Start the client
npm run dev:client
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiration (default: 7d) |
| `NODE_ENV` | `development` or `production` |

## 🌐 Deployment (Railway)

1. Push your code to GitHub
2. Go to [Railway](https://railway.app) and create a new project
3. Connect your GitHub repo
4. Add environment variables in Railway dashboard:
   - `MONGODB_URI` — Your MongoDB Atlas connection string
   - `JWT_SECRET` — A strong random string
   - `NODE_ENV` — Set to `production`
5. Railway auto-detects Node.js and runs `npm start`
6. The build command (`postinstall`) automatically builds the React client

## 📋 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user profile |

### Projects
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project (admin) |
| DELETE | `/api/projects/:id` | Delete project (admin) |
| POST | `/api/projects/:id/members` | Add member (admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (admin) |

### Tasks
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks` | List tasks with filters |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task (admin/creator) |

### Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard` | Get aggregated dashboard stats |

## 🔒 Role-Based Access

| Action | Admin | Member |
|--------|-------|--------|
| Create project | ✅ | ✅ |
| Update/Delete project | ✅ | ❌ |
| Add/Remove members | ✅ | ❌ |
| Create tasks | ✅ | ✅ |
| Update any task | ✅ | ✅ (own/assigned) |
| Delete tasks | ✅ | Creator only |

## 📄 License

MIT
