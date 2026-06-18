import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'LeadFlow CRM API',
    version: '1.0.0',
    description: `
A professional Client Lead Management System built with Express.js and MongoDB.

## Authentication
The API uses JWT-based authentication. To access protected routes:
1. Call \`POST /api/v1/auth/login\` to obtain an access token
2. Include the token in the \`Authorization\` header as \`Bearer <token>\`

## Token Refresh
Access tokens expire in 15 minutes. Use \`POST /api/v1/auth/refresh\` (cookie-based) to obtain a new token without re-login.
    `,
    contact: {
      name: 'LeadFlow CRM Support',
      email: 'support@leadflow.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Development server',
    },
    {
      url: 'https://api.leadflow.com/api/v1',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token obtained from login/register',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error description',
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
          stack: {
            type: 'string',
            description: 'Stack trace (only in development mode)',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['Admin', 'Manager'] },
          avatar: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
          lastLogin: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Lead: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          fullName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          company: { type: 'string' },
          country: { type: 'string' },
          leadSource: {
            type: 'string',
            enum: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email', 'Advertisement', 'Other'],
          },
          message: { type: 'string' },
          status: {
            type: 'string',
            enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'],
          },
          priority: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          assignedTo: { type: 'string', nullable: true },
          notesCount: { type: 'integer', default: 0 },
          createdBy: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Note: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          lead: { type: 'string', description: 'Lead ObjectId' },
          author: { type: 'string', description: 'User ObjectId' },
          text: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@leadflow.com' },
          password: { type: 'string', format: 'password', example: 'Admin@123' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', format: 'password', example: 'StrongP@ss1' },
        },
      },
      CreateLeadRequest: {
        type: 'object',
        required: ['fullName', 'email'],
        properties: {
          fullName: { type: 'string', example: 'Jane Smith' },
          email: { type: 'string', format: 'email', example: 'jane@company.com' },
          phone: { type: 'string', example: '+1-555-0123' },
          company: { type: 'string', example: 'Tech Corp' },
          country: { type: 'string', example: 'United States' },
          leadSource: { type: 'string', enum: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email', 'Advertisement', 'Other'], example: 'Website' },
          message: { type: 'string', example: 'Interested in premium plan' },
          status: { type: 'string', enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'], example: 'New' },
          priority: { type: 'string', enum: ['Low', 'Medium', 'High'], example: 'High' },
          assignedTo: { type: 'string', example: 'user_id_here' },
        },
      },
      UpdateLeadStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'],
            example: 'Contacted',
          },
        },
      },
      CreateNoteRequest: {
        type: 'object',
        required: ['text'],
        properties: {
          text: {
            type: 'string',
            minLength: 3,
            maxLength: 1000,
            example: 'Followed up with the client. They are interested in scheduling a demo.',
          },
        },
      },
      UpdateNoteRequest: {
        type: 'object',
        required: ['text'],
        properties: {
          text: {
            type: 'string',
            minLength: 3,
            maxLength: 1000,
            example: 'Updated follow-up notes after the demo call.',
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 50 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Server health check endpoint',
    },
    {
      name: 'Authentication',
      description: 'Authentication endpoints (register, login, logout, refresh, me)',
    },
    {
      name: 'Leads',
      description: 'Lead CRUD operations with search, filter, sort, and pagination',
    },
    {
      name: 'Notes',
      description: 'Follow-up notes management for leads',
    },
    {
      name: 'Analytics',
      description: 'Dashboard statistics and analytics data',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;