import { Router } from 'express';
import LeadController from '../controllers/LeadController.js';
import authenticate from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import validate from '../middleware/validation.js';
import {
  createLeadValidator,
  updateLeadValidator,
  updateLeadStatusValidator,
  leadIdValidator,
  listLeadsValidator,
  bulkDeleteValidator,
  bulkStatusUpdateValidator,
} from '../validators/leadValidator.js';

const router = Router();

// All lead routes require authentication
router.use(authenticate);

/*
 * GET /api/v1/leads
 * List leads with search, filter, sort, and pagination.
 * Access: Admin, Manager
 */
router.get(
  '/',
  authorize('Admin', 'Manager'),
  validate(listLeadsValidator),
  LeadController.list
);

/*
 * POST /api/v1/leads/bulk-delete
 * Soft-delete multiple leads.
 * IMPORTANT: Must be placed before /:id routes to avoid Express
 * matching 'bulk-delete' as a route parameter.
 * Access: Admin only
 */
router.post(
  '/bulk-delete',
  authorize('Admin'),
  validate(bulkDeleteValidator),
  LeadController.bulkDelete
);

/*
 * POST /api/v1/leads/bulk-status
 * Update status for multiple leads.
 * IMPORTANT: Must be placed before /:id routes.
 * Access: Admin, Manager
 */
router.post(
  '/bulk-status',
  authorize('Admin', 'Manager'),
  validate(bulkStatusUpdateValidator),
  LeadController.bulkStatusUpdate
);

/*
 * POST /api/v1/leads
 * Create a new lead.
 * Access: Admin, Manager
 */
router.post(
  '/',
  authorize('Admin', 'Manager'),
  validate(createLeadValidator),
  LeadController.create
);

/*
 * GET /api/v1/leads/:id
 * Get a single lead with populated notes.
 * Access: Admin, Manager
 */
router.get(
  '/:id',
  authorize('Admin', 'Manager'),
  validate(leadIdValidator),
  LeadController.getById
);

/*
 * PUT /api/v1/leads/:id
 * Update an existing lead.
 * Access: Admin, Manager
 */
router.put(
  '/:id',
  authorize('Admin', 'Manager'),
  validate(updateLeadValidator),
  LeadController.update
);

/*
 * PATCH /api/v1/leads/:id/status
 * Update only the status of a lead.
 * Access: Admin, Manager
 */
router.patch(
  '/:id/status',
  authorize('Admin', 'Manager'),
  validate(updateLeadStatusValidator),
  LeadController.updateStatus
);

/*
 * DELETE /api/v1/leads/:id
 * Soft-delete a lead.
 * Access: Admin only
 */
router.delete(
  '/:id',
  authorize('Admin'),
  validate(leadIdValidator),
  LeadController.delete
);

/*
 * PATCH /api/v1/leads/:id/restore
 * Restore a soft-deleted lead.
 * Access: Admin only
 */
router.patch(
  '/:id/restore',
  authorize('Admin'),
  validate(leadIdValidator),
  LeadController.restore
);

/*
 * DELETE /api/v1/leads/:id/permanent
 * Permanently delete a lead.
 * Access: Admin only
 */
router.delete(
  '/:id/permanent',
  authorize('Admin'),
  validate(leadIdValidator),
  LeadController.hardDelete
);

export default router;