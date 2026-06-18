# LeadFlow CRM

A modern, full-featured CRM (Customer Relationship Management) platform built with React, Node.js, Express, and MongoDB. Manage leads, track deals, analyze performance, and grow your business.

## Features

- **Lead Management** — Create, update, delete, and track leads through custom pipelines
- **Dashboard Analytics** — Real-time metrics, charts, and performance insights
- **Notes System** — Add and manage notes for each lead
- **User Authentication** — JWT-based auth with access & refresh tokens
- **Role-Based Access** — Admin and user role support
- **Dark Mode** — Light/dark theme with system preference detection
- **Responsive Design** — Works on desktop, tablet, and mobile
- **PWA Ready** — Offline support, install prompt, manifest
- **SEO Optimized** — Open Graph, Twitter Cards, sitemap, robots.txt

## Tech Stack

### Frontend

| Library | Purpose |
|---------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| TanStack React Query | Server state management |
| React Router v7 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Radix UI | Accessible headless components |
| Recharts | Dashboard charts |
| React Hook Form + Zod | Form validation |
| react-hot-toast | Toast notifications |

### Backend

| Library | Purpose |
|---------|---------|
| Node.js + Express | Server framework |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| Swagger | API documentation |
| Morgan | HTTP request logging |

## Architecture

```
project2/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── api/            # API client and endpoint functions
│   │   ├── components/     # Reusable UI components
│   │   │   └── ui/         # Base UI primitives
│   │   ├── contexts/       # React contexts (auth, theme)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── layouts/        # Layout components
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   ├── styles/         # Global CSS
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── Dockerfile
├── server/                 # Express backend (ES Modules)
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── constants/      # Constants
│   │   ├── controllers/    # Route handlers
│   │   ├── database/       # MongoDB connection & seeding
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Route definitions
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities
│   │   └── validators/     # Validation schemas
│   ├── __tests__/          # Jest unit tests
│   └── Dockerfile
├── docker-compose.yml      # Multi-container orchestration
└── .github/workflows/      # CI/CD pipeline
```

## ER Diagram

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      User       │       │      Lead        │       │      Note        │
├─────────────────┤       ├──────────────────┤       ├──────────────────┤
│ _id (PK)        │       │ _id (PK)         │       │ _id (PK)         │
│ name            │       │ name             │       │ content          │
│ email (unique)  │       │ email            │       │ createdBy (FK)   │
│ password (hash) │       │ phone            │       │ leadId (FK)      │
│ role            │       │ company          │       │ createdAt        │
│ refreshToken    │       │ status           │       │ updatedAt        │
│ createdAt       │       │ source           │       └──────────────────┘
│ updatedAt       │       │ value            │              │
└─────────────────┘       │ assignedTo (FK)  │              │
        │                  │ createdBy (FK)   │              │
        └──────────────────┤ createdAt        │              │
                           │ updatedAt        ├──────────────┘
                           └──────────────────┘
```

## API Documentation

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/v1/auth/register | Register a new user | No |
| POST | /api/v1/auth/login | Login user | No |
| POST | /api/v1/auth/logout | Logout user | Yes |
| POST | /api/v1/auth/refresh | Refresh access token | No |
| GET | /api/v1/auth/me | Get current user profile | Yes |

### Leads

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/v1/leads | List leads (paginated) | Yes |
| POST | /api/v1/leads | Create a new lead | Yes |
| GET | /api/v1/leads/:id | Get lead by ID | Yes |
| PUT | /api/v1/leads/:id | Update a lead | Yes |
| DELETE | /api/v1/leads/:id | Delete a lead | Yes |

### Notes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/v1/leads/:leadId/notes | List notes for lead | Yes |
| POST | /api/v1/leads/:leadId/notes | Add note to lead | Yes |
| PUT | /api/v1/leads/:leadId/notes/:id | Update a note | Yes |
| DELETE | /api/v1/leads/:leadId/notes/:id | Delete a note | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/v1/users/profile | Get user profile | Yes |
| PUT | /api/v1/users/profile | Update user profile | Yes |

Full interactive API documentation is available at `/api/v1/docs` when the server is running (Swagger UI).

## Environment Variables

### Server (.env)

```bash
# Node Environment
NODE_ENV=development

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://localhost:27017/leadflow_crm

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Logging
LOG_LEVEL=debug
```

### Client

```bash
VITE_API_URL=http://localhost:5000/api/v1
```

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7+ (local or Atlas)
- npm 10+

### Local Development

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd project2
   ```

2. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. Set up environment variables:
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your values
   ```

4. Start MongoDB (if local):
   ```bash
   mongod
   ```

5. Seed the database (optional):
   ```bash
   cd server && npm run seed
   ```

6. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

7. Open http://localhost:5173 in your browser.

### Using Docker

```bash
# Build and start all services
docker compose up --build

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:5000/api/v1
# API Docs: http://localhost:5000/api/v1/docs
```

## Testing

### Backend Tests

```bash
cd server
npm test
```

Runs unit tests with Jest. Tests cover:
- ApiError utility class
- JWT token generation and verification

### Frontend Tests

```bash
cd client
npm test
```

Runs component tests with Vitest and React Testing Library.

### CI Pipeline

GitHub Actions runs on push to main/develop and PRs to main:
1. Install dependencies
2. Run linting
3. Run tests
4. Build frontend and backend
5. Build Docker images
6. Validate Docker Compose configuration

## Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Set framework preset to Vite
4. Set root directory to `client`
5. Add environment variable: `VITE_API_URL=https://your-api-domain.com/api/v1`
6. Deploy

### Backend → Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Set root directory to `server`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables (see Environment Variables section)
8. Deploy

### Database → MongoDB Atlas

1. Create a free MongoDB Atlas cluster
2. Get your connection string
3. Add your IP to the network whitelist
4. Set the `MONGODB_URI` environment variable to your Atlas connection string

## Screenshots

> Screenshots will be added in a future update.

## License

MIT