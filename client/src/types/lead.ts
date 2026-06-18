export interface Lead {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  leadSource: string;
  message: string;
  status: LeadStatus;
  priority: Priority;
  assignedTo: { _id: string; name: string; email: string } | null;
  notesCount: number;
  createdBy: { _id: string; name: string; email: string } | null;
  updatedBy: { _id: string; name: string; email: string } | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type Priority = 'Low' | 'Medium' | 'High';

export type LeadSource =
  | 'Website'
  | 'Referral'
  | 'LinkedIn'
  | 'Cold Call'
  | 'Email'
  | 'Advertisement'
  | 'Other';

export interface CreateLeadRequest {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  leadSource?: string;
  message?: string;
  status?: LeadStatus;
  priority?: Priority;
  assignedTo?: string;
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {}

export interface UpdateLeadStatusRequest {
  status: LeadStatus;
}

export interface LeadListResponse {
  leads: Lead[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LeadFilters {
  search?: string;
  status?: LeadStatus;
  priority?: Priority;
  leadSource?: string;
  assignedTo?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}