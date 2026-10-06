import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ServiceRequest } from '../types';

// Query keys
export const requestKeys = {
  all: ['requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (filters: string) => [...requestKeys.lists(), { filters }] as const,
  details: () => [...requestKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestKeys.details(), id] as const,
};

// Get all requests
export function useRequests() {
  return useQuery({
    queryKey: requestKeys.lists(),
    queryFn: () => apiClient.get<ServiceRequest[]>('/requests'),
  });
}

// Get single request
export function useRequest(id: string) {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: () => apiClient.get<ServiceRequest>(`/requests/${id}`),
    enabled: !!id,
  });
}

// Create request
export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<ServiceRequest, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'customer' | 'service'>) =>
      apiClient.post<ServiceRequest>('/requests', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
  });
}

// Update request
export function useUpdateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ServiceRequest> }) =>
      apiClient.put<ServiceRequest>(`/requests/${id}`, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(requestKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
  });
}

// Update request state
export function useUpdateRequestState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, state }: { id: string; state: string }) =>
      apiClient.put<ServiceRequest>(`/requests/${id}`, { state }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(requestKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
  });
}
