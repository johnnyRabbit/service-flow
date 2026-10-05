import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';

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
  const authStore = useAuthStore();
  const notifications = useNotificationStore();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
      return response;
    },
    onSuccess: (data) => {
      // Set token in localStorage
      apiClient.setToken(data.access_token);
      
      // Update Zustand store
      authStore.setToken(data.access_token);
      authStore.setUser(data.user);
      
      // Set user in TanStack Query cache
      queryClient.setQueryData(authKeys.user(), data.user);
      
      notifications.success('Login bem-sucedido', `Bem-vindo, ${data.user.name}!`);
    },
    onError: (error: Error) => {
      notifications.error('Erro ao iniciar sessão', error.message);
    },
  });
}

// Register mutation
export function useRegister() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const notifications = useNotificationStore();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiClient.post<LoginResponse>('/auth/register', data);
      return response;
    },
    onSuccess: (data) => {
      // Set token
      apiClient.setToken(data.access_token);
      
      // Update Zustand store
      authStore.setToken(data.access_token);
      authStore.setUser(data.user);
      
      // Set user in cache
      queryClient.setQueryData(authKeys.user(), data.user);
      
      notifications.success('Registo bem-sucedido', 'A sua conta foi criada com sucesso');
    },
    onError: (error: Error) => {
      notifications.error('Erro ao registar', error.message);
    },
  });
}

// Get current user
export function useAuthUser() {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => apiClient.get<any>('/auth/me'),
    enabled: authStore.isAuthenticated,
    retry: false,
  });
}

// Logout
export function useLogout() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const notifications = useNotificationStore();

  return () => {
    // Clear token
    apiClient.clearToken();
    
    // Clear Zustand store
    authStore.logout();
    
    // Clear TanStack Query cache
    queryClient.clear();
    
    notifications.info('Sessão terminada', 'Até breve!');
  };
}
