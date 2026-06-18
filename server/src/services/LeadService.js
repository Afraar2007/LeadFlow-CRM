import Lead from '../models/Lead.js';
import Note from '../models/Note.js';
import ApiError from '../utils/ApiError.js';
import QueryBuilder from '../utils/queryBuilder.js';
import { SORT_OPTIONS } from '../constants/index.js';

class LeadService {
  /**
   * Lists leads with search, filter, sort, and pagination.
   * Uses QueryBuilder for composable query construction.
   * Soft-deleted leads excluded by default unless ?includeDeleted=true.
   * Performance: uses lean(), select(), and indexed fields.
   */
  async list(queryParams) {
    const queryBuilder = new QueryBuilder(Lead, queryParams);

    const result = await queryBuilder
      .includeDeleted()
      .search(['fullName', 'email', 'company', 'phone'])
      .filterBy({
        status: 'status',
        priority: 'priority',
        leadSource: 'leadSource',
        assignedTo: 'assignedTo',
        country: 'country',
        createdBy: 'createdBy',
      })
      .dateRange('createdAt')
      .sort(SORT_OPTIONS)
      .paginate()
      .exec([
        { path: 'assignedTo', select: 'name email' },
        { path: 'createdBy', select: 'name email' },
      ]);

    return result;
  }

  /**
   * Retrieves a single lead by ID with full population.
   * Includes notes, audit trail, and assigned user info.
   */
  async getById(leadId) {
    const lead = await Lead.findById(leadId)
      .populate([
        { path: 'assignedTo', select: 'name email' },
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' },
        { path: 'notes', match: { isDeleted: { $ne: true } }, populate: { path: 'author', select: 'name email' } },
      ]);

    if (!lead) {
      throw ApiError.notFound('Lead not found');
    }

    return lead;
  }

  /**
   * Creates a new lead with full audit trail.
   * Automatically sets createdBy and updatedBy.
   */
  async create(leadData, userId) {
    const lead = await Lead.create({
      ...leadData,
      createdBy: userId,
      updatedBy: userId,
    });

    return lead;
  }

  /**
   * Updates an existing lead.
   * Only the fields provided in the request body are updated.
   * Automatically sets updatedBy for audit trail.
   */
  async update(leadId, updateData, userId) {
    const lead = await Lead.findById(leadId);

    if (!lead) {
      throw ApiError.notFound('Lead not found');
    }

    const allowedFields = [
      'fullName', 'email', 'phone', 'company', 'country',
      'leadSource', 'message', 'status', 'priority', 'assignedTo',
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        lead[field] = updateData[field];
      }
    }

    lead.updatedBy = userId;
    await lead.save();

    return lead;
  }

  /**
   * Updates only the status of a lead (PATCH endpoint).
   * Lightweight: only updates status and updatedBy.
   */
  async updateStatus(leadId, status, userId) {
    const lead = await Lead.findById(leadId).select('status updatedBy');

    if (!lead) {
      throw ApiError.notFound('Lead not found');
    }

    lead.status = status;
    lead.updatedBy = userId;
    await lead.save();

    return lead;
  }

  /**
   * Soft-deletes a lead by setting isDeleted flag.
   * Cascades soft-delete to all associated notes.
   */
  async softDelete(leadId, userId) {
    const lead = await Lead.findById(leadId);

    if (!lead) {
      throw ApiError.notFound('Lead not found');
    }

    if (lead.isDeleted) {
      throw ApiError.badRequest('Lead has already been deleted');
    }

    await lead.softDelete(userId);

    await Note.updateMany(
      { lead: leadId, isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt: new Date(), deletedBy: userId }
    );

    return lead;
  }

  /**
   * Restores a soft-deleted lead and its associated notes.
   */
  async restore(leadId) {
    const lead = await Lead.findOne({ _id: leadId, isDeleted: true });

    if (!lead) {
      throw ApiError.notFound('Deleted lead not found');
    }

    await lead.restore();

    await Note.updateMany(
      { lead: leadId, isDeleted: true },
      { isDeleted: false, deletedAt: null, deletedBy: null }
    );

    return lead;
  }

  /**
   * Permanently deletes a lead and all associated notes.
   * Admin only - use softDelete() for normal operations.
   */
  async hardDelete(leadId) {
    const lead = await Lead.findById(leadId);

    if (!lead) {
      throw ApiError.notFound('Lead not found');
    }

    await Note.deleteMany({ lead: leadId });
    await Lead.findByIdAndDelete(leadId);

    return { id: leadId };
  }

  /**
   * Bulk soft-delete multiple leads.
   * Accepts an array of lead IDs.
   * Returns counts of succeeded and failed operations.
   */
  async bulkSoftDelete(leadIds, userId) {
    const leads = await Lead.find({ _id: { $in: leadIds } });

    const validIds = leads.map((l) => l._id.toString());
    const invalidIds = leadIds.filter((id) => !validIds.includes(id));
    const alreadyDeletedIds = leads
      .filter((l) => l.isDeleted)
      .map((l) => l._id.toString());
    const toDelete = leads.filter((l) => !l.isDeleted);

    const deletePromises = toDelete.map((lead) => lead.softDelete(userId));
    await Promise.all(deletePromises);

    if (toDelete.length > 0) {
      const toDeleteIds = toDelete.map((l) => l._id);
      await Note.updateMany(
        { lead: { $in: toDeleteIds }, isDeleted: { $ne: true } },
        { isDeleted: true, deletedAt: new Date(), deletedBy: userId }
      );
    }

    return {
      success: toDelete.length,
      failed: invalidIds.length + alreadyDeletedIds.length,
      invalidIds,
      alreadyDeletedIds,
    };
  }

  /**
   * Bulk update status for multiple leads.
   * Accepts an array of lead IDs and a target status.
   * Returns counts of succeeded and failed operations.
   */
  async bulkStatusUpdate(leadIds, status, userId) {
    const leads = await Lead.find({ _id: { $in: leadIds } });

    const validIds = leads.map((l) => l._id.toString());
    const invalidIds = leadIds.filter((id) => !validIds.includes(id));
    const deletedIds = leads
      .filter((l) => l.isDeleted)
      .map((l) => l._id.toString());
    const toUpdate = leads.filter((l) => !l.isDeleted);

    const updatePromises = toUpdate.map((lead) => {
      lead.status = status;
      lead.updatedBy = userId;
      return lead.save({ validateBeforeSave: false });
    });
    await Promise.all(updatePromises);

    return {
      success: toUpdate.length,
      failed: invalidIds.length + deletedIds.length,
      invalidIds,
      deletedIds,
    };
  }
}

export default new LeadService();