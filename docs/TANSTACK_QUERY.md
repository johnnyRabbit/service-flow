# TanStack Query Integration Guide

## Overview

ServiceFlow AI uses **TanStack Query** (React Query) for efficient server state management, providing:

- ✅ Automatic caching and background refetching
- ✅ Optimistic updates
- ✅ Request deduplication
- ✅ Pagination and infinite scroll support
- ✅ Mutation rollback on error
- ✅ DevTools for debugging

## Setup

The QueryClient is configured in `src/lib/query-client.ts` and provided via `QueryClientProvider` in `src/App.tsx`.

### Default Configuration

```typescript
{
  staleTime: 5 * 60 * 1000,      // 5 minutes
  gcTime: 10 * 60 * 1000,        // 10 minutes (garbage collection)
  retry: 3,                       // Retry failed requests 3 times
  retryDelay: exponential,        // Exponential backoff
  refetchOnWindowFocus: true,     // Refetch when window gains focus
  refetchOnReconnect: true,       // Refetch on network reconnect
}
```

## Available Hooks

### Customers

```typescript
import { 
  useCustomers, 
  useCustomer, 
  useCreateCustomer, 
  useUpdateCustomer, 
  useDeleteCustomer 
} from './hooks/useCustomers';

// Get all customers
const { data: customers, isLoading, error, refetch } = useCustomers();

// Get single customer
const { data: customer } = useCustomer(customerId);

// Create customer
const createMutation = useCreateCustomer();
createMutation.mutate({ name: 'John', phone: '+351...' });

// Update customer
const updateMutation = useUpdateCustomer();
updateMutation.mutate({ id: customerId, data: { name: 'Jane' } });

// Delete customer
const deleteMutation = useDeleteCustomer();
deleteMutation.mutate(customerId);
```

### Conversations

```typescript
import { 
  useConversations, 
  useConversation, 
  useUpdateConversationState,
  useTakeoverConversation 
} from './hooks/useConversations';

// Get conversations with filters
const { data: conversations } = useConversations({
  state: 'AI_ACTIVE',
  assignedUserId: 'user_123'
});

// Get single conversation (refetches every 5 seconds)
const { data: conversation } = useConversation(conversationId);

// Update conversation state
const updateState = useUpdateConversationState();
updateState.mutate({ 
  id: conversationId, 
  state: 'HUMAN_ACTIVE',
  assignedUserId: 'user_123'
});

// Takeover conversation
const takeover = useTakeoverConversation();
takeover.mutate({ id: conversationId, userId: 'user_123' });
```

### Requests

```typescript
import { 
  useRequests, 
  useRequest, 
  useCreateRequest, 
  useUpdateRequest,
  useUpdateRequestState 
} from './hooks/useRequests';

// Get all requests
const { data: requests } = useRequests();

// Get single request
const { data: request } = useRequest(requestId);

// Create request
const createMutation = useCreateRequest();
createMutation.mutate({
  customerId: 'cust_123',
  serviceId: 'svc_456',
  problem: 'AC not cooling',
  urgency: 'NORMAL'
});

// Update request state
const updateState = useUpdateRequestState();
updateState.mutate({ id: requestId, state: 'SCHEDULED' });
```

### Auth

```typescript
import { 
  useLogin, 
  useRegister, 
  useAuthUser, 
  useLogout 
} from './hooks/useAuth';

// Login
const loginMutation = useLogin();
loginMutation.mutate({ email: 'user@example.com', password: 'password' });

// Register
const registerMutation = useRegister();
registerMutation.mutate({
  email: 'user@example.com',
  password: 'password',
  name: 'John Doe',
  organizationName: 'My Company'
});

// Get current user
const { data: user } = useAuthUser();

// Logout
const logout = useLogout();
logout();
```

## Query Keys

Query keys are used for cache management and invalidation:

```typescript
// Customer keys
customerKeys.all        // ['customers']
customerKeys.lists()    // ['customers', 'list']
customerKeys.detail(id) // ['customers', 'detail', id]

// Conversation keys
conversationKeys.all
conversationKeys.lists()
conversationKeys.list(filters)
conversationKeys.detail(id)

// Request keys
requestKeys.all
requestKeys.lists()
requestKeys.detail(id)

// Auth keys
authKeys.all
authKeys.user()
```

## Cache Invalidation

Mutations automatically invalidate related queries:

```typescript
// After creating a customer, the customers list is automatically refetched
const createMutation = useCreateCustomer();
createMutation.mutate({ name: 'John', phone: '+351...' });
// → customers list is invalidated and refetched
```

Manual invalidation:

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { customerKeys } from './hooks/useCustomers';

const queryClient = useQueryClient();

// Invalidate all customer queries
queryClient.invalidateQueries({ queryKey: customerKeys.all });

// Invalidate only customer lists
queryClient.invalidateQueries({ queryKey: customerKeys.lists() });

// Invalidate specific customer
queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
```

## Optimistic Updates

For instant UI updates:

```typescript
const updateMutation = useUpdateCustomer();

updateMutation.mutate(
  { id: customerId, data: { name: 'New Name' } },
  {
    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: customerKeys.detail(variables.id) });
      
      const previousCustomer = queryClient.getQueryData(customerKeys.detail(variables.id));
      
      queryClient.setQueryData(customerKeys.detail(variables.id), (old: any) => ({
        ...old,
        ...variables.data,
      }));
      
      return { previousCustomer };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        customerKeys.detail(variables.id),
        context?.previousCustomer
      );
    },
    
    // Refetch after mutation
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
    },
  }
);
```

## Loading and Error States

```typescript
const { data, isLoading, error, refetch, isFetching } = useCustomers();

if (isLoading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage error={error} onRetry={() => refetch()} />;
}

return <CustomerList customers={data} />;
```

## Pagination

```typescript
export function useCustomersPaginated(page: number, pageSize: number = 20) {
  return useQuery({
    queryKey: ['customers', 'paginated', page, pageSize],
    queryFn: () => apiClient.get(`/customers?page=${page}&pageSize=${pageSize}`),
    keepPreviousData: true, // Show previous data while loading new page
  });
}

// Usage
const [page, setPage] = useState(1);
const { data, isFetching } = useCustomersPaginated(page);

return (
  <div>
    <CustomerList customers={data} />
    <button onClick={() => setPage(p => p + 1)} disabled={isFetching}>
      Next Page
    </button>
  </div>
);
```

## DevTools

TanStack Query DevTools are available in development:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## Best Practices

### 1. Use Query Keys Consistently

```typescript
// ✅ Good
queryKey: customerKeys.detail(customerId)

// ❌ Bad
queryKey: ['customer', customerId]
```

### 2. Handle Loading and Error States

Always handle loading and error states in your components:

```typescript
const { data, isLoading, error } = useCustomers();

if (isLoading) return <Loading />;
if (error) return <Error message={error.message} />;
return <Customers data={data} />;
```

### 3. Invalidate After Mutations

Always invalidate related queries after mutations:

```typescript
const mutation = useCreateCustomer();

mutation.mutate(data, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
  }
});
```

### 4. Use Optimistic Updates for Better UX

For instant feedback, use optimistic updates:

```typescript
mutation.mutate(data, {
  onMutate: async () => {
    // Optimistic update
    const previous = queryClient.getQueryData(key);
    queryClient.setQueryData(key, newData);
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback
    queryClient.setQueryData(key, context.previous);
  }
});
```

### 5. Configure Stale Time Appropriately

```typescript
// Data that changes frequently
useQuery({
  queryKey: ['conversations'],
  staleTime: 10 * 1000, // 10 seconds
});

// Data that rarely changes
useQuery({
  queryKey: ['services'],
  staleTime: 60 * 60 * 1000, // 1 hour
});
```

## Migration from DataContext

The old `DataContext` is still available for backward compatibility, but new code should use TanStack Query hooks:

```typescript
// ❌ Old way (DataContext)
const { customers, createCustomer } = useData();

// ✅ New way (TanStack Query)
const { data: customers } = useCustomers();
const createMutation = useCreateCustomer();
createMutation.mutate(customerData);
```

## Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Query Keys](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)
