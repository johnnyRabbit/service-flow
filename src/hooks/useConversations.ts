import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { Conversation } from '../types';

// Query keys
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters?: { state?: string; customerId?: string; assignedUserId?: string }) =>
    [...conversationKeys.lists(), { filters }] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
};

// Get conversations with optional filters
export function useConversations(filters?: {
  state?: string;
  customerId?: string;
  assignedUserId?: string;
}) {
  return useQuery({
    queryKey: conversationKeys.list(filters),
    queryFn: () => apiClient.get<Conversation[]>('/conversations'),
  });
}

// Get single conversation with messages
export function useConversation(id: string) {
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: () => apiClient.get<Conversation>(`/conversations/${id}`),
    enabled: !!id,
    // Refetch more frequently for conversations (real-time feel)
    refetchInterval: 5000, // 5 seconds
  });
}

// Update conversation state
export function useUpdateConversationState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      state,
      assignedUserId,
    }: {
      id: string;
      state: string;
      assignedUserId?: string;
    }) => apiClient.put(`/conversations/${id}/state`, { state, assignedUserId }),
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.setQueryData(conversationKeys.detail(variables.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

// Takeover conversation (assign to current user)
export function useTakeoverConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      apiClient.put(`/conversations/${id}/state`, {
        state: 'HUMAN_ACTIVE',
        assignedUserId: userId,
      }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(conversationKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}
