/**
 * ServiceFlow API Client
 * Connects frontend to backend API using Axios
 */

import api from './api';

class ApiClient {
  /**
   * Set authentication token
   */
  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    localStorage.removeItem('auth_token');
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await api.get<T>(endpoint, { params });
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await api.post<T>(endpoint, data);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await api.put<T>(endpoint, data);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await api.delete<T>(endpoint);
    return response.data;
  }

  // ============================================================================
  // AUTH ENDPOINTS
  // ============================================================================

  async login(email: string, password: string) {
    const response = await this.post<{
      access_token: string;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        organizationId: string;
      };
    }>('/auth/login', { email, password });

    this.setToken(response.access_token);
    return response;
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    organizationName: string;
  }) {
    const response = await this.post<{
      access_token: string;
      user: any;
    }>('/auth/register', data);

    this.setToken(response.access_token);
    return response;
  }

  async getProfile() {
    return this.get<any>('/auth/me');
  }

  // ============================================================================
  // CUSTOMERS ENDPOINTS
  // ============================================================================

  async getCustomers() {
    return this.get<any[]>('/customers');
  }

  async getCustomer(id: string) {
    return this.get<any>(`/customers/${id}`);
  }

  async createCustomer(data: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  }) {
    return this.post<any>('/customers', data);
  }

  async updateCustomer(id: string, data: any) {
    return this.put<any>(`/customers/${id}`, data);
  }

  async deleteCustomer(id: string) {
    return this.delete<any>(`/customers/${id}`);
  }

  // ============================================================================
  // CONVERSATIONS ENDPOINTS
  // ============================================================================

  async getConversations(filters?: {
    state?: string;
    customerId?: string;
    assignedUserId?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.state) params.append('state', filters.state);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.assignedUserId) params.append('assignedUserId', filters.assignedUserId);

    const queryString = params.toString();
    return this.get<any[]>(`/conversations${queryString ? `?${queryString}` : ''}`);
  }

  async getConversation(id: string) {
    return this.get<any>(`/conversations/${id}`);
  }

  async updateConversationState(id: string, state: string, assignedUserId?: string) {
    return this.put<any>(`/conversations/${id}/state`, { state, assignedUserId });
  }

  // ============================================================================
  // REQUESTS ENDPOINTS
  // ============================================================================

  async getRequests() {
    return this.get<any[]>('/requests');
  }

  async getRequest(id: string) {
    return this.get<any>(`/requests/${id}`);
  }

  async createRequest(data: any) {
    return this.post<any>('/requests', data);
  }

  async updateRequest(id: string, data: any) {
    return this.put<any>(`/requests/${id}`, data);
  }

  // ============================================================================
  // QUEUE STATS
  // ============================================================================

  async getQueueStats() {
    return this.get<any>('/queue/stats');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
