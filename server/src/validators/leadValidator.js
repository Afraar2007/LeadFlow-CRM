import { body, param, query } from 'express-validator';

/**
 * Validates that every ID in the array is a valid MongoDB ObjectId.
 */
const isValidIdArray = (value) => {
  if (!Array.isArray(value)) {
    throw new Error('Must be an array of IDs');
  }
  if (value.length === 0) {
    throw new Error('Array cannot be empty');
  }
  for (const id of value) {
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new Error(`Invalid ID: ${id}`);
    }
  }
  return true;
};

export const createLeadValidator = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Full name must be between 2 and 200 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Phone number cannot exceed 30 characters'),

  body('company')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters'),

  body('leadSource')
    .optional()
    .isIn([
      'Website', 'Referral', 'LinkedIn', 'Cold Call',
      'Email', 'Advertisement', 'Other',
    ])
    .withMessage('Please select a valid lead source'),

  body('message')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),

  body('status')
    .optional()
    .isIn([
      'New', 'Contacted', 'Qualified', 'Proposal Sent',
      'Negotiation', 'Won', 'Lost',
    ])
    .withMessage('Please select a valid status'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Please select a valid priority'),

  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
];

export const updateLeadValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID'),

  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Full name must be between 2 and 200 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Phone number cannot exceed 30 characters'),

  body('company')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters'),

  body('leadSource')
    .optional()
    .isIn([
      'Website', 'Referral', 'LinkedIn', 'Cold Call',
      'Email', 'Advertisement', 'Other',
    ])
    .withMessage('Please select a valid lead source'),

  body('message')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),

  body('status')
    .optional()
    .isIn([
      'New', 'Contacted', 'Qualified', 'Proposal Sent',
      'Negotiation', 'Won', 'Lost',
    ])
    .withMessage('Please select a valid status'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Please select a valid priority'),

  body('assignedTo')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('Invalid user ID'),
];

export const updateLeadStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn([
      'New', 'Contacted', 'Qualified', 'Proposal Sent',
      'Negotiation', 'Won', 'Lost',
    ])
    .withMessage('Please select a valid status'),
];

export const leadIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID'),
];

export const listLeadsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sort')
    .optional()
    .isIn([
      'newest', 'oldest', 'name', '-name', 'company', '-company',
      'status', '-status', 'priority', '-priority', 'createdAt', '-createdAt',
    ])
    .withMessage('Invalid sort option'),

  query('status')
    .optional()
    .isIn([
      'New', 'Contacted', 'Qualified', 'Proposal Sent',
      'Negotiation', 'Won', 'Lost',
    ])
    .withMessage('Invalid status filter'),

  query('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority filter'),

  query('leadSource')
    .optional()
    .isIn([
      'Website', 'Referral', 'LinkedIn', 'Cold Call',
      'Email', 'Advertisement', 'Other',
    ])
    .withMessage('Invalid lead source filter'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
];

export const bulkDeleteValidator = [
  body('ids')
    .custom(isValidIdArray)
    .withMessage('Please provide a valid array of lead IDs'),
];

export const bulkStatusUpdateValidator = [
  body('ids')
    .custom(isValidIdArray)
    .withMessage('Please provide a valid array of lead IDs'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn([
      'New', 'Contacted', 'Qualified', 'Proposal Sent',
      'Negotiation', 'Won', 'Lost',
    ])
    .withMessage('Please select a valid status'),
];
