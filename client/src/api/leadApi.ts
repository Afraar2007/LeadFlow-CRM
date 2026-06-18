import axiosInstance from './axiosInstance';
import type { Lead, LeadListResponse, CreateLeadRequest, UpdateLeadRequest, UpdateLeadStatusRequest, LeadFilters } from '@/types/lead';

export const leadApi = {
  getLeads: async (filters: LeadFilters = {}): Promise<LeadListResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    const response = await axiosInstance.get(`/leads${queryString ? `?${queryString}` : ''}`);
    return response.data.data;
  },

  getLead: async (id: string): Promise<Lead> => {
    const response = await axiosInstance.get(`/leads/${id}`);
    return response.data.data;
  },

  createLead: async (data: CreateLeadRequest): Promise<Lead> => {
    const response = await axiosInstance.post('/leads', data);
    return response.data.data;
  },

  updateLead: async (id: string, data: UpdateLeadRequest): Promise<Lead> => {
    const response = await axiosInstance.put(`/leads/${id}`, data);
    return response.data.data;
  },

  updateLeadStatus: async (id: string, data: UpdateLeadStatusRequest): Promise<Lead> => {
    const response = await axiosInstance.patch(`/leads/${id}/status`, data);
    return response.data.data;
  },

  deleteLead: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/leads/${id}`);
  },

  restoreLead: async (id: string): Promise<Lead> => {
    const response = await axiosInstance.patch(`/leads/${id}/restore`);
    return response.data.data;
  },

  permanentDeleteLead: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/leads/${id}/permanent`);
  },

  getLeadsAnalytics: async (): Promise<Record<string, unknown>> => {
    const response = await axiosInstance.get('/leads/analytics/overview');
    return response.data.data;
  },
};