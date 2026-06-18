import LeadService from '../services/LeadService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

class LeadController {
  /**
   * GET /api/v1/leads
   * List leads with search, filter, sort, and pagination.
   * Query params: page, limit, sort, search, status, priority,
   *              leadSource, assignedTo, country, createdBy,
   *              startDate, endDate, includeDeleted
   */
  list = asyncHandler(async (req, res) => {
    const result = await LeadService.list(req.query);

    ApiResponse.success({
      leads: result.data,
      pagination: result.pagination,
    }).send(res);
  });

  /**
   * GET /api/v1/leads/:id
   * Get a single lead with populated notes and audit trail.
   */
  getById = asyncHandler(async (req, res) => {
    const lead = await LeadService.getById(req.params.id);

    ApiResponse.success(lead).send(res);
  });

  /**
   * POST /api/v1/leads
   * Create a new lead with full audit trail.
   */
  create = asyncHandler(async (req, res) => {
    const lead = await LeadService.create(req.body, req.user.id);

    ApiResponse.created(lead, 'Lead created successfully').send(res);
  });

  /**
   * PUT /api/v1/leads/:id
   * Update an existing lead with audit trail.
   */
  update = asyncHandler(async (req, res) => {
    const lead = await LeadService.update(req.params.id, req.body, req.user.id);

    ApiResponse.success(lead, 'Lead updated successfully').send(res);
  });

  /**
   * PATCH /api/v1/leads/:id/status
   * Lightweight status update only.
   */
  updateStatus = asyncHandler(async (req, res) => {
    const lead = await LeadService.updateStatus(
      req.params.id,
      req.body.status,
      req.user.id
    );

    ApiResponse.success(lead, 'Lead status updated successfully').send(res);
  });

  /**
   * DELETE /api/v1/leads/:id
   * Soft-delete a lead (sets isDeleted flag).
   */
  delete = asyncHandler(async (req, res) => {
    await LeadService.softDelete(req.params.id, req.user.id);

    ApiResponse.success(null, 'Lead deleted successfully').send(res);
  });

  /**
   * PATCH /api/v1/leads/:id/restore
   * Restore a soft-deleted lead.
   */
  restore = asyncHandler(async (req, res) => {
    const lead = await LeadService.restore(req.params.id);

    ApiResponse.success(lead, 'Lead restored successfully').send(res);
  });

  /**
   * DELETE /api/v1/leads/:id/permanent
   * Permanently delete a lead. Admin only.
   */
  hardDelete = asyncHandler(async (req, res) => {
    await LeadService.hardDelete(req.params.id);

    ApiResponse.success(null, 'Lead permanently deleted').send(res);
  });

  /**
   * POST /api/v1/leads/bulk-delete
   * Soft-delete multiple leads. Admin only.
   * Body: { ids: [...] }
   */
  bulkDelete = asyncHandler(async (req, res) => {
    const result = await LeadService.bulkSoftDelete(req.body.ids, req.user.id);

    ApiResponse.success(result, 'Bulk delete completed').send(res);
  });

  /**
   * POST /api/v1/leads/bulk-status
   * Update status for multiple leads.
   * Body: { ids: [...], status: 'Contacted' }
   */
  bulkStatusUpdate = asyncHandler(async (req, res) => {
    const result = await LeadService.bulkStatusUpdate(
      req.body.ids,
      req.body.status,
      req.user.id
    );

    ApiResponse.success(result, 'Bulk status update completed').send(res);
  });
}

export default new LeadController();