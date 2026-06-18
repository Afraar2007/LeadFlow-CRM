import User from './User.js';
import Lead from './Lead.js';
import Note from './Note.js';

export { User, Lead, Note };

/*
 * Model Relationships Overview:
 *
 * 1. User ────┐
 *    ├── hasMany Lead (via createdBy / assignedTo)
 *    └── hasMany Note (via author)
 *
 * 2. Lead ────┐
 *    ├── belongsTo User (via createdBy / assignedTo)
 *    ├── hasMany Note (virtual field "notes")
 *    └── stores notesCount (denormalized counter for performance)
 *
 * 3. Note ────┐
 *    ├── belongsTo Lead (via lead)
 *    └── belongsTo User (via author)
 *
 * Reference Strategy:
 * - Leads reference Users via ObjectId (createdBy, assignedTo)
 * - Notes reference Leads via ObjectId (lead)
 * - Notes reference Users via ObjectId (author)
 * - Lead model uses a virtual field "notes" to populate associated notes
 *   without duplicating data on the lead document
 * - notesCount on Lead is a denormalized counter updated on note CRUD
 *   to avoid COUNT queries on every lead list fetch
 *
 * Performance Design:
 * - notesCount eliminates the need for $lookup or count queries
 *   when displaying lead lists with note indicators
 * - Virtual population only runs when explicitly requested (.populate('notes'))
 * - Text index on Lead enables efficient full-text search across
 *   name, email, company, and phone fields
 */