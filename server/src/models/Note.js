import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead reference is required'],
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required'],
    },

    text: {
      type: String,
      required: [true, 'Note text is required'],
      trim: true,
      minlength: [3, 'Note must be at least 3 characters'],
      maxlength: [1000, 'Note cannot exceed 1000 characters'],
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
 * Query filter to exclude soft-deleted notes by default.
 */
noteSchema.pre(/^find/, function (next) {
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
noteSchema.statics.includeDeleted = function () {
  return this.find({ _includeDeleted: true });
};

/*
 * Instance method to soft-delete a note.
 */
noteSchema.methods.softDelete = async function (deletedByUserId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedByUserId;
  return this.save({ validateBeforeSave: false });
};

/*
 * Instance method to restore a soft-deleted note.
 */
noteSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  return this.save({ validateBeforeSave: false });
};

/*
 * Index justification:
 * - lead: Fast lookup of all notes belonging to a specific lead.
 *   This is the primary query pattern for notes (fetch all notes for a lead).
 * - Compound index (lead + createdAt): Optimizes the common query pattern
 *   "get notes for a lead ordered by creation time". Enables efficient
 *   sorted access without in-memory sorting.
 * - author: Used for admin queries to see which user created which notes.
 * - isDeleted: Required for soft-delete filtering on every query.
 */
noteSchema.index({ lead: 1, createdAt: -1 });
noteSchema.index({ author: 1 });
noteSchema.index({ isDeleted: 1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;