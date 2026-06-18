import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import toast from 'react-hot-toast';

interface Note {
  _id: string;
  lead: string;
  author: { _id: string; name: string; email: string };
  text: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateNoteRequest {
  text: string;
}

interface UpdateNoteRequest {
  text: string;
}

const noteApi = {
  getNotes: async (leadId: string): Promise<Note[]> => {
    const response = await axiosInstance.get(`/leads/${leadId}/notes`);
    return response.data.data;
  },

  createNote: async (leadId: string, data: CreateNoteRequest): Promise<Note> => {
    const response = await axiosInstance.post(`/leads/${leadId}/notes`, data);
    return response.data.data;
  },

  updateNote: async (leadId: string, noteId: string, data: UpdateNoteRequest): Promise<Note> => {
    const response = await axiosInstance.put(`/leads/${leadId}/notes/${noteId}`, data);
    return response.data.data;
  },

  deleteNote: async (leadId: string, noteId: string): Promise<void> => {
    await axiosInstance.delete(`/leads/${leadId}/notes/${noteId}`);
  },
};

export function useNotes(leadId: string) {
  return useQuery({
    queryKey: ['notes', leadId],
    queryFn: () => noteApi.getNotes(leadId),
    enabled: !!leadId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: CreateNoteRequest }) =>
      noteApi.createNote(leadId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      toast.success('Note added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add note');
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, noteId, data }: { leadId: string; noteId: string; data: UpdateNoteRequest }) =>
      noteApi.updateNote(leadId, noteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.leadId] });
      toast.success('Note updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update note');
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, noteId }: { leadId: string; noteId: string }) =>
      noteApi.deleteNote(leadId, noteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      toast.success('Note deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete note');
    },
  });
}