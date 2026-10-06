import { useState } from 'react';
import { Loader2, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { useCustomers, useCreateCustomer, useDeleteCustomer } from '../../hooks/useCustomers';
import { useNotificationStore } from '../../stores/notificationStore';
import { useUIStore } from '../../stores/uiStore';

/**
 * Complete example showing integration of:
 * - TanStack Query (data fetching & caching)
 * - Zustand (global state management)
 * - Axios (API client)
 */
export function CompleteIntegrationExample() {
  // TanStack Query hooks
  const { data: customers, isLoading, error, refetch, isFetching } = useCustomers();
  const createMutation = useCreateCustomer();
  const deleteMutation = useDeleteCustomer();
  
  // Zustand stores
  const notifications = useNotificationStore();
  const ui = useUIStore();
  
  // Local state
  const [newCustomerName, setNewCustomerName] = useState('');

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">A carregar clientes...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-medium">Erro ao carregar clientes</p>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Create customer handler
  const handleCreate = () => {
    if (!newCustomerName.trim()) {
      notifications.warning('Nome obrigatório', 'Por favor, insira o nome do cliente');
      return;
    }

    createMutation.mutate(
      {
        name: newCustomerName,
        phone: '+351 912 345 678',
        email: `${newCustomerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      },
      {
        onSuccess: () => {
          setNewCustomerName('');
          // Notification is handled in the mutation hook
        },
      }
    );
  };

  // Delete customer handler
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Tem a certeza que deseja remover ${name}?`)) {
      return;
    }

    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Clientes ({customers?.length || 0})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Exemplo completo: TanStack Query + Zustand + Axios
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Create form */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Criar Novo Cliente</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            placeholder="Nome do cliente"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={createMutation.isPending}
          />
          <button
            onClick={handleCreate}
            disabled={createMutation.isPending || !newCustomerName.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                A criar...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Criar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Customers list */}
      <div className="space-y-2">
        {customers?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum cliente encontrado
          </div>
        ) : (
          customers?.map((customer: any) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-medium text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.phone}</p>
                {customer.email && (
                  <p className="text-xs text-gray-400">{customer.email}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(customer.id, customer.name)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 text-sm"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Remover
              </button>
            </div>
          ))
        )}
      </div>

      {/* Info box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Tecnologias Utilizadas:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ <strong>TanStack Query</strong> - Cache, refetching, mutations</li>
          <li>✓ <strong>Zustand</strong> - Estado global (notificações, UI)</li>
          <li>✓ <strong>Axios</strong> - HTTP client com interceptors</li>
          <li>✓ <strong>Integração</strong> - Tudo interligado e funcional</li>
        </ul>
      </div>
    </div>
  );
}
