export const DB_NAME = 'leadflow-crm';

export const LEAD_STATUS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  PROPOSAL_SENT: 'Proposal Sent',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
};

export const PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const LEAD_SOURCES = [
  'Website',
  'Referral',
  'LinkedIn',
  'Cold Call',
  'Email',
  'Advertisement',
  'Other',
];

export const LEAD_STATUSES = Object.values(LEAD_STATUS);
export const PRIORITIES = Object.values(PRIORITY);

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name: { fullName: 1 },
  '-name': { fullName: -1 },
  company: { company: 1 },
  '-company': { company: -1 },
  status: { status: 1 },
  '-status': { status: -1 },
  priority: { priority: 1 },
  '-priority': { priority: -1 },
  createdAt: { createdAt: -1 },
  '-createdAt': { createdAt: 1 },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};