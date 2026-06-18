import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [200, 'Full name cannot exceed 200 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },

    phone: {
      type: String,
      trim: true,
      default: '',
    },

    company: {
      type: String,
      trim: true,
      default: '',
    },

    country: {
      type: String,
      trim: true,
      default: '',
    },

    leadSource: {
      type: String,
      enum: {
        values: [
          'Website',
          'Referral',
          'LinkedIn',
          'Cold Call',
          'Email',
          'Advertisement',
          'Other',
        ],
        message: 'Please select a valid lead source',
      },
      default: 'Website',
    },

    message: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },

    status: {
      type: String,
      enum: {
        values: [
          'New',
          'Contacted',
          'Qualified',
          'Proposal Sent',
          'Negotiation',
          'Won',
          'Lost',
        ],
        message: '{VALUE} is not a valid lead status',
      },
      default: 'New',
    },

    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    notesCount: {
      type: Number,
      default: 0,
    },

    // --- Audit Fields ---
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // --- Soft Delete Fields ---
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        if (ret.isDeleted) {
          delete ret.isDeleted;
          delete ret.deletedAt;
          delete ret.deletedBy;
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        if (ret.isDeleted) {
          delete ret.isDeleted;
          delete ret.deletedAt;
          delete ret.deletedBy;
        }
        return ret;
      },
    },
  }
);

/*
 * Virtual field to populate notes associated with this lead.
 * Uses foreign key 'lead' in the Note model.
 * This avoids storing duplicated note data on the lead document.
 */
leadSchema.virtual('notes', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'lead',
  options: {
    sort: { createdAt: -1 },
  },
});

/*
 * Query filter to exclude soft-deleted documents by default.
 * Use .includeDeleted() to override this filter when needed.
 */
leadSchema.pre(/^find/, function (next) {
  if (this.getFilter()._includeDeleted) {
    delete this.getFilter()._includeDeleted;
    return next();
  }
  this.where({ isDeleted: { $ne: true } });
  next();
});

/*
 * Static method to explicitly include soft-deleted records.
 */
leadSchema.statics.includeDeleted = function () {
  return this.find({ _includeDeleted: true });
};

/*
 * Instance method to soft-delete a lead.
 * Sets isDeleted flag, records who deleted it and when.
 */
leadSchema.methods.softDelete = async function (deletedByUserId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedByUserId;
  return this.save({ validateBeforeSave: false });
};

/*
 * Instance method to restore a soft-deleted lead.
 */
leadSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  return this.save({ validateBeforeSave: false });
};

/*
 * Index justification:
 * - email: Fast lookup when searching leads by email.
 * - status: Efficient filtering by lead status on dashboard and list views.
 * - priority: Optimizes sorting and filtering by priority level.
 * - company: Used for search and grouping leads by company.
 * - createdAt: Required for chronological sorting and monthly analytics aggregation.
 * - isDeleted: Required for soft-delete filtering on every query.
 * - Compound index (status + createdAt): Supports the most common dashboard query
 *   pattern: "show leads by status ordered by creation date". This compound index
 *   covers filtering and sorting in a single index scan.
 * - Compound index (status + priority): Optimizes the common filter combination
 *   for lead pipeline views.
 * - Compound index (isDeleted + createdAt): Supports soft-delete filtering combined
 *   with chronological sorting, the default query pattern.
 */
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ company: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ isDeleted: 1 });
leadSchema.index({ isDeleted: 1, createdAt: -1 });
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ status: 1, priority: 1 });

/*
 * Text index for full-text search across key lead fields.
 * Enables efficient search by name, email, company, and phone
 * using MongoDB's $text operator instead of slow $regex queries.
 */
leadSchema.index(
  { fullName: 'text', email: 'text', company: 'text', phone: 'text' },
  {
    name: 'lead_search_text_index',
    weights: {
      fullName: 10,
      email: 8,
      company: 5,
      phone: 3,
    },
  }
);

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;