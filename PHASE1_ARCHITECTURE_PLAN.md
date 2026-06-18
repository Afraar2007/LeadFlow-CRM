# LeadFlow CRM – Phase 1: Architecture & Implementation Plan

## 1. Project Architecture Overview

### System Design
```
┌──────────────────────────────────────────────────────────────┐
│                       Client (React + Vite)                   │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌────────────────┐   │
│  │   Auth   │ │  Leads   │ │Analytics│ │   Settings     │   │
│  │  Pages   │ │  Pages   │ │  Pages  │ │    Pages       │   │
│  └────┬─────┘ └────┬─────┘ └────┬────┘ └───────┬────────┘   │
│       │            │            │               │            │
│  ┌────┴────────────┴────────────┴───────────────┴──────┐    │
│  │              React Router (Protected Routes)         │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────┴────────────────────────────┐    │
│  │           TanStack Query + Axios (API Layer)         │    │
│  └────────────────────────┬────────────────────────────┘    │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTP (JWT)
┌───────────────────────────┼──────────────────────────────────┐
│                    Express.js Server                         │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌────────────────┐   │
│  │   JWT    │ │  Routes  │ │Controllers│ │ Middleware     │   │
│  │  Auth    │ │          │ │          │ │ (Helmet/CORS)  │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬────────┘   │
│       │            │            │               │            │
│  ┌────┴────────────┴────────────┴───────────────┴──────┐    │
│  │                  Services Layer                       │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────┴────────────────────────────┐    │
│  │         Mongoose Models + MongoDB Atlas              │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with `/server` and `/client` directories
2. **Layered Backend**: routes → controllers → services → models
3. **Feature-based Frontend**: components organized by feature
4. **State Management**: TanStack Query for server state, React Context for auth state
5. **API Design**: RESTful with consistent error handling

---

## 2. Complete Folder Structure

```
leadflow-crm/
├── server/
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── env.js                   # Environment variables
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── leadController.js
│   │   ├── noteController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── errorHandler.js
│   │   ├── validate.js              # Validation middleware
│   │   └── asyncHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Lead.js
│   │   └── Note.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── leadRoutes.js
│   │   ├── noteRoutes.js
│   │   └── analyticsRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── leadService.js
│   │   ├── noteService.js
│   │   └── analyticsService.js
│   ├── validators/
│   │   ├── authValidator.js
│   │   └── leadValidator.js
│   ├── utils/
│   │   ├── AppError.js              # Custom error class
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── database/
│   │   └── seed.js                  # Seed admin user
│   ├── server.js
│   └── package.json
│
├── client/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosInstance.js      # Axios config with interceptors
│   │   │   ├── authApi.js
│   │   │   ├── leadApi.js
│   │   │   ├── noteApi.js
│   │   │   └── analyticsApi.js
│   │   ├── assets/
│   │   │   ├── logo.svg
│   │   │   └── images/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Pagination.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   └── Textarea.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   └── AuthLayout.tsx
│   │   │   └── leads/
│   │   │       ├── LeadForm.tsx
│   │   │       ├── LeadTable.tsx
│   │   │       ├── LeadCard.tsx
│   │   │       ├── LeadFilters.tsx
│   │   │       ├── LeadStatusBadge.tsx
│   │   │       ├── LeadPriorityBadge.tsx
│   │   │       ├── NoteForm.tsx
│   │   │       ├── NoteList.tsx
│   │   │       └── NoteItem.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLeads.ts
│   │   │   ├── useNotes.ts
│   │   │   ├── useAnalytics.ts
│   │   │   └── useDebounce.ts
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── AuthLayoutWrapper.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LeadsPage.tsx
│   │   │   ├── LeadDetailPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── leadService.ts
│   │   │   ├── noteService.ts
│   │   │   └── analyticsService.ts
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   ├── lead.ts
│   │   │   ├── note.ts
│   │   │   ├── analytics.ts
│   │   │   └── common.ts
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json                     # Root package.json for scripts
```

---

## 3. Required Dependencies

### Backend (server/package.json)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1",
    "express-async-errors": "^3.1.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### Frontend (client/package.json)
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.21.0",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.3",
    "zod": "^3.22.4",
    "axios": "^1.6.2",
    "@tanstack/react-query": "^5.17.0",
    "lucide-react": "^0.303.0",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^3.2.0",
    "clsx": "^2.1.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3",
    "vite": "^6.0.0"
  }
}
```

---

## 4. Data Models

### User Model
```js
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (default: 'admin'),
  createdAt: Date,
  updatedAt: Date
}
```

### Lead Model
```js
{
  fullName: String (required),
  email: String (required),
  phone: String,
  companyName: String,
  country: String,
  leadSource: String (enum: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email', 'Advertisement', 'Other']),
  message: String,
  status: String (enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost']),
  priority: String (enum: ['Low', 'Medium', 'High']),
  assignedTo: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Note Model
```js
{
  lead: ObjectId (ref: Lead, required),
  text: String (required),
  author: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 5. API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Admin login |
| GET | /api/auth/me | Get current user |
| POST | /api/auth/logout | Logout |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/leads | List leads (paginated, filterable, sortable) |
| GET | /api/leads/:id | Get single lead |
| POST | /api/leads | Create lead |
| PUT | /api/leads/:id | Update lead |
| DELETE | /api/leads/:id | Delete lead |
| PATCH | /api/leads/:id/status | Update lead status |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/leads/:leadId/notes | Get all notes for a lead |
| POST | /api/leads/:leadId/notes | Add note |
| PUT | /api/leads/:leadId/notes/:noteId | Edit note |
| DELETE | /api/leads/:leadId/notes/:noteId | Delete note |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/overview | Dashboard statistics |
| GET | /api/analytics/monthly | Monthly lead data |

---

## 6. Frontend Routes

| Path | Component | Protected |
|------|-----------|-----------|
| /login | LoginPage | No |
| /dashboard | DashboardPage | Yes |
| /leads | LeadsPage | Yes |
| /leads/new | LeadsPage (create modal) | Yes |
| /leads/:id | LeadDetailPage | Yes |
| /analytics | AnalyticsPage | Yes |
| * | NotFoundPage | No |

---

## 7. Implementation Roadmap (Phases)

### Phase 2: Backend Foundation
- [ ] Initialize server project with package.json
- [ ] Create Express server entry point
- [ ] Set up MongoDB connection in config/db.js
- [ ] Configure env variables with dotenv
- [ ] Add middleware stack (Helmet, CORS, Morgan, JSON parser)
- [ ] Create AppError utility class
- [ ] Create asyncHandler middleware
- [ ] Create error handler middleware

### Phase 3: Authentication Backend
- [ ] Create User model
- [ ] Create auth validator (login validation)
- [ ] Create auth service (register, login, getMe)
- [ ] Create auth controller
- [ ] Create auth routes
- [ ] Create JWT auth middleware
- [ ] Create database seed script

### Phase 4: Lead CRUD Backend
- [ ] Create Lead model
- [ ] Create lead validator
- [ ] Create lead service (CRUD + search + filter + pagination)
- [ ] Create lead controller
- [ ] Create lead routes

### Phase 5: Notes & Analytics Backend
- [ ] Create Note model
- [ ] Create note service (CRUD)
- [ ] Create note controller
- [ ] Create note routes
- [ ] Create analytics service (aggregation pipeline)
- [ ] Create analytics controller
- [ ] Create analytics routes

### Phase 6: Frontend Foundation
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Set up folder structure
- [ ] Create TypeScript types/interfaces
- [ ] Set up Axios instance with interceptors
- [ ] Create AuthContext provider
- [ ] Create auth hooks
- [ ] Set up React Router
- [ ] Create MainLayout (Sidebar + Navbar)
- [ ] Implement dark mode support (Tailwind class strategy)

### Phase 7: UI Components Library
- [ ] Button component
- [ ] Input component
- [ ] Select component
- [ ] Textarea component
- [ ] Modal component
- [ ] ConfirmDialog component
- [ ] Toast component (react-hot-toast)
- [ ] Badge component (status & priority)
- [ ] Card component
- [ ] Skeleton loader component
- [ ] EmptyState component
- [ ] Table component
- [ ] Pagination component
- [ ] Spinner component

### Phase 8: Authentication Frontend
- [ ] Create LoginPage with React Hook Form + Zod
- [ ] Create auth API service
- [ ] Implement protected routes
- [ ] Implement login/logout flow
- [ ] Session persistence with token storage

### Phase 9: Leads Frontend
- [ ] Create LeadsPage with data table
- [ ] Create LeadForm (modal) for create/edit
- [ ] Create LeadFilters component
- [ ] Create search with debounce
- [ ] Create sorting controls
- [ ] Create pagination
- [ ] Create lead hooks with TanStack Query
- [ ] Create lead API service
- [ ] Implement delete with confirmation dialog
- [ ] Implement status update inline

### Phase 10: Lead Detail & Notes
- [ ] Create LeadDetailPage
- [ ] Create NoteForm component
- [ ] Create NoteList + NoteItem components
- [ ] Create note hooks
- [ ] Create note API service

### Phase 11: Dashboard & Analytics
- [ ] Create DashboardPage with stats cards
- [ ] Create monthly lead chart (Recharts)
- [ ] Create recent activities list
- [ ] Create AnalyticsPage with charts
- [ ] Create analytics hooks
- [ ] Create analytics API service

### Phase 12: Polish & Finalization
- [ ] Responsive design adjustments
- [ ] Loading states and skeletons
- [ ] Empty states for no data
- [ ] Error boundaries
- [ ] Toast notifications for CRUD operations
- [ ] Dark mode toggle implementation
- [ ] Final testing
- [ ] .env.example files
- [ ] README documentation

---

## 8. Key Design Patterns

### Backend Design Patterns
- **Service Layer**: Business logic abstracted from controllers
- **Controller Pattern**: Thin controllers, thick services
- **Middleware Chain**: Auth → Validation → Controller
- **Error Handling**: Global error handler with custom AppError class
- **Async Wrapper**: Catch async errors automatically

### Frontend Design Patterns
- **Compound Components**: For complex UI pieces
- **Custom Hooks**: Encapsulate data fetching and mutations
- **Provider Pattern**: Auth context for global state
- **Render Props**: Via TanStack Query
- **Form Abstraction**: React Hook Form + Zod validation
- **API Layer**: Centralized Axios instance with interceptors

---

## 9. Security Measures

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Tokens**: Signed with secret, expiry set
3. **HTTP Headers**: Helmet middleware
4. **CORS**: Whitelist frontend origin
5. **Input Validation**: Express Validator on all inputs
6. **XSS Prevention**: Automatic via React
7. **Environment Variables**: No hardcoded secrets
8. **Rate Limiting**: (Can add express-rate-limit)
9. **Protected Routes**: Both API and frontend

---

## 10. Performance Optimizations

1. **MongoDB Indexes**: On email, status, priority, createdAt fields
2. **Pagination**: Server-side with limit/skip
3. **Search**: Regex query with indexes
4. **TanStack Query**: Automatic caching, background refetching
5. **Lazy Loading**: Route-based code splitting
6. **Debounced Search**: Prevent excessive API calls
7. **Aggregation Pipeline**: For analytics queries