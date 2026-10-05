import { useCustomers, useCreateCustomer, useDeleteCustomer } from '../../hooks/useCustomers';
import { Loader2, RefreshCw } from 'lucide-react';
import type { Customer } from '../../types';

/**
 * Example component showing TanStack Query usage
 * This demonstrates how to use the hooks with loading, error, and data states
 */
export function CustomersQueryExample() {
  // Query hook - automatically fetches and caches data
  const { data: customers, isLoading, error, refetch, isFetching } = useCustomers();
  
  // Mutation hooks
  const createMutation = useCreateCustomer();
  const deleteMutation = useDeleteCustomer();

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

  // Success state
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Clientes ({customers?.length || 0})
        </h2>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Create button */}
      <button
        onClick={() => {
          createMutation.mutate({
            name: 'Novo Cliente',
            phone: '+351 912 345 678',
            email: 'novo@cliente.pt',
          });
        }}
        disabled={createMutation.isPending}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
      >
        {createMutation.isPending ? 'A criar...' : 'Criar Cliente'}
      </button>

      {/* Customers list */}
      <div className="space-y-2">
        {customers?.map((customer: Customer) => (
          <div
            key={customer.id}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
          >
            <div>
              <p className="font-medium">{customer.name}</p>
              <p className="text-sm text-gray-500">{customer.phone}</p>
            </div>
            <button
              onClick={() => deleteMutation.mutate(customer.id)}
              disabled={deleteMutation.isPending}
              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 text-sm"
            >
              {deleteMutation.isPending ? 'A remover...' : 'Remover'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
