import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { Customer } from '../types';

// Query keys
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: string) => [...customerKeys.lists(), { filters }] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

// Get all customers
export function useCustomers() {
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: () => apiClient.get<Customer[]>('/customers'),
  });
}

// Get single customer
export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => apiClient.get<Customer>(`/customers/${id}`),
    enabled: !!id,
  });
}

// Create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Customer, 'id' | 'organizationId' | 'createdAt' | 'totalRequests'>) =>
      apiClient.post<Customer>('/customers', data),
    onSuccess: () => {
      // Invalidate and refetch customers list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

// Update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      apiClient.put<Customer>(`/customers/${id}`, data),
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.setQueryData(customerKeys.detail(variables.id), data);
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

// Delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/customers/${id}`),
    onSuccess: () => {
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
