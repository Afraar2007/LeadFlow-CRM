# LeadFlow CRM - Backend API

A production-ready Express.js REST API for the LeadFlow CRM application.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting, HPP, Input Validation

## Features

- RESTful API design with versioned endpoints (`/api/v1`)
- JWT-based authentication with secure password hashing
- Complete Lead CRUD operations with search, filter, sort, and pagination
- Follow-up notes management per lead
- Analytics dashboard with aggregation pipeline
- Rate limiting and security headers
- Graceful error handling with custom error classes
- Structured logging for development and production
- Health check endpoint for monitoring

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files (CORS, rate limiter)
│   ├── constants/        # Application constants and enums
│   ├── controllers/      # Request handlers
│   ├── database/         # Database connection and seeding
│   ├── middleware/       # Express middleware (auth, validation, error handling)
│   ├── models/           # Mongoose schemas and models
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic layer
│   ├── types/            # TypeScript type definitions (future)
│   ├── utils/            # Utility classes (ApiError, ApiResponse, logger)
│   ├── validators/       # Express validation rules
│   ├── app.js            # Express application setup
│   └── server.js         # Server entry point
├── .env                  # Environment variables (not committed)
├── .env.example          # Environment variable template
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB Atlas account or local MongoDB instance
- npm

### Installation

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Running the Server

Development mode (with hot reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

### Seed Database

```bash
npm run seed
```

## API Endpoints

### Health Check

```
GET /api/v1/health
```

### Authentication

```
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

### Leads

```
GET    /api/v1/leads          # List leads (paginated, filterable)
GET    /api/v1/leads/:id      # Get single lead
POST   /api/v1/leads          # Create lead
PUT    /api/v1/leads/:id      # Update lead
DELETE /api/v1/leads/:id      # Delete lead
PATCH  /api/v1/leads/:id/status  # Update lead status
```

### Notes

```
GET    /api/v1/leads/:leadId/notes       # Get notes for a lead
POST   /api/v1/leads/:leadId/notes       # Add note to a lead
PUT    /api/v1/leads/:leadId/notes/:noteId  # Edit a note
DELETE /api/v1/leads/:leadId/notes/:noteId  # Delete a note
```

### Analytics

```
GET /api/v1/analytics/overview    # Dashboard statistics
GET /api/v1/analytics/monthly     # Monthly lead data
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment mode | development |
| MONGODB_URI | MongoDB connection string | required |
| JWT_SECRET | JWT signing secret | required |
| JWT_EXPIRES_IN | JWT token expiry | 7d |
| CLIENT_URL | Frontend URL for CORS | http://localhost:5173 |

## Error Handling

The API uses a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## License

MIT