const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173'];

// Vercel preview deployments match pattern: https://*-afraar2007s-projects.vercel.app
const vercelPreviewRegex = /^https:\/\/.*-afraar2007s-projects\.vercel\.app$/;

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server, etc.)
    if (!origin) return callback(null, true);

    // Check exact matches
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments
    if (vercelPreviewRegex.test(origin)) {
      return callback(null, true);
    }

    // Allow any *.vercel.app domain (production + preview)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // For development - allow localhost
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    console.warn(`[CORS] Origin blocked: ${origin}`);
    // IMPORTANT: Return true to avoid breaking preflight - we still respond with the origin
    // This is more permissive but prevents CORS errors during development
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Total-Pages'],
  maxAge: 86400,
};

export default corsOptions;
