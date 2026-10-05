import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Auth types
interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string;
  };
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  organizationName: string;
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.login(email, password),
    onSuccess: (data) => {
      // Set user in cache
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
}

// Register mutation
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => apiClient.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
}

// Get current user
export function useAuthUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => apiClient.getProfile(),
    enabled: apiClient.isAuthenticated(),
    retry: false,
  });
}

// Logout
export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    apiClient.clearToken();
    queryClient.clear();
  };
}
