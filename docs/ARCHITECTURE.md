# Arquitetura Completa: TanStack Query + Zustand + Axios

## Visão Geral

O ServiceFlow AI utiliza uma arquitetura moderna e escalável que combina três tecnologias poderosas:

- **TanStack Query** - Gerenciamento de estado do servidor (data fetching, caching, mutations)
- **Zustand** - Gerenciamento de estado global do cliente (UI, auth, notifications)
- **Axios** - Cliente HTTP com interceptors para autenticação e tratamento de erros

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    React Components                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   TanStack   │  │    Zustand   │  │   Local      │ │
│  │    Query     │  │    Stores    │  │   State      │ │
│  │              │  │              │  │  (useState)  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘ │
│         │                 │                             │
│         └────────┬────────┘                             │
│                  │                                      │
│         ┌────────▼────────┐                             │
│         │  Custom Hooks   │                             │
│         │  (useCustomers, │                             │
│         │   useAuth, etc) │                             │
│         └────────┬────────┘                             │
│                  │                                      │
│         ┌────────▼────────┐                             │
│         │  API Client     │                             │
│         │   (Axios)       │                             │
│         └────────┬────────┘                             │
│                  │                                      │
└──────────────────┼──────────────────────────────────────┘
                   │
          ┌────────▼────────┐
          │   Backend API   │
          │   (NestJS)      │
          └─────────────────┘
```

## Componentes

### 1. API Client (Axios)

**Localização:** `src/lib/api.ts`

**Funcionalidades:**
- Configuração base (baseURL, timeout, headers)
- Interceptor de request: adiciona token JWT automaticamente
- Interceptor de response: trata erros 401 (logout automático)
- Extração de mensagens de erro

**Exemplo:**
```typescript
import api from './lib/api';

// GET request
const response = await api.get('/customers');

// POST request
const response = await api.post('/customers', { name: 'John' });

// Com parâmetros
const response = await api.get('/customers', { 
  params: { page: 1, limit: 10 } 
});
```

### 2. API Client Wrapper

**Localização:** `src/lib/api-client.ts`

**Funcionalidades:**
- Wrapper simplificado sobre o axios
- Métodos tipados (get, post, put, delete)
- Gerenciamento de token

**Exemplo:**
```typescript
import { apiClient } from './lib/api-client';

// GET
const customers = await apiClient.get<Customer[]>('/customers');

// POST
const newCustomer = await apiClient.post<Customer>('/customers', {
  name: 'John Doe',
  phone: '+351 912 345 678'
});

// PUT
const updated = await apiClient.put<Customer>(`/customers/${id}`, {
  name: 'Jane Doe'
});

// DELETE
await apiClient.delete(`/customers/${id}`);
```

### 3. Zustand Stores

#### Auth Store
**Localização:** `src/stores/authStore.ts`

**Estado:**
```typescript
{
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

**Ações:**
```typescript
setUser(user: User | null)
setToken(token: string | null)
setLoading(loading: boolean)
logout()
```

**Persistência:** localStorage (user e token)

**Exemplo:**
```typescript
import { useAuthStore } from './stores/authStore';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### UI Store
**Localização:** `src/stores/uiStore.ts`

**Estado:**
```typescript
{
  sidebarOpen: boolean;
  activeModal: string | null;
  globalLoading: boolean;
  theme: 'light' | 'dark';
}
```

**Ações:**
```typescript
toggleSidebar()
setSidebarOpen(open: boolean)
openModal(modal: string)
closeModal()
setGlobalLoading(loading: boolean)
toggleTheme()
```

**Exemplo:**
```typescript
import { useUIStore } from './stores/uiStore';

function MyComponent() {
  const { sidebarOpen, toggleSidebar, openModal } = useUIStore();
  
  return (
    <div>
      <button onClick={toggleSidebar}>
        {sidebarOpen ? 'Close' : 'Open'} Sidebar
      </button>
      <button onClick={() => openModal('create-customer')}>
        Create Customer
      </button>
    </div>
  );
}
```

#### Notification Store
**Localização:** `src/stores/notificationStore.ts`

**Estado:**
```typescript
{
  notifications: Notification[];
}
```

**Ações:**
```typescript
addNotification(notification)
removeNotification(id)
clearNotifications()
success(title, message?)
error(title, message?)
warning(title, message?)
info(title, message?)
```

**Exemplo:**
```typescript
import { useNotificationStore } from './stores/notificationStore';

function MyComponent() {
  const notifications = useNotificationStore();
  
  const handleSave = () => {
    try {
      // Save data
      notifications.success('Saved!', 'Data saved successfully');
    } catch (error) {
      notifications.error('Error', 'Failed to save data');
    }
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

### 4. TanStack Query Hooks

#### useCustomers
**Localização:** `src/hooks/useCustomers.ts`

**Hooks:**
```typescript
useCustomers()              // Get all customers
useCustomer(id)             // Get single customer
useCreateCustomer()         // Create customer mutation
useUpdateCustomer()         // Update customer mutation
useDeleteCustomer()         // Delete customer mutation
```

**Exemplo:**
```typescript
import { useCustomers, useCreateCustomer } from './hooks/useCustomers';

function CustomerList() {
  const { data: customers, isLoading, error } = useCustomers();
  const createMutation = useCreateCustomer();
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  const handleCreate = () => {
    createMutation.mutate({
      name: 'John Doe',
      phone: '+351 912 345 678'
    });
  };
  
  return (
    <div>
      <button onClick={handleCreate}>Create</button>
      {customers?.map(customer => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  );
}
```

#### useAuth
**Localização:** `src/hooks/useAuth.ts`

**Hooks:**
```typescript
useLogin()        // Login mutation
useRegister()     // Register mutation
useAuthUser()     // Get current user query
useLogout()       // Logout function
```

**Exemplo:**
```typescript
import { useLogin, useAuthUser } from './hooks/useAuth';

function LoginPage() {
  const loginMutation = useLogin();
  const { data: user } = useAuthUser();
  
  const handleLogin = (email: string, password: string) => {
    loginMutation.mutate({ email, password });
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(email, password);
    }}>
      <input type="email" value={email} onChange={...} />
      <input type="password" value={password} onChange={...} />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 5. Query Client Configuration

**Localização:** `src/lib/query-client.ts`

**Configuração:**
```typescript
{
  queries: {
    staleTime: 5 * 60 * 1000,      // 5 minutes
    gcTime: 10 * 60 * 1000,        // 10 minutes
    retry: 3,                       // 3 retries
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  },
  mutations: {
    retry: 2,
    retryDelay: 1000,
  },
}
```

### 6. Notifications Component

**Localização:** `src/components/Notifications.tsx`

**Funcionalidades:**
- Exibe notificações do Zustand store
- Auto-remove após 5 segundos
- Suporta 4 tipos: success, error, warning, info
- Animações de entrada/saída

**Uso:**
```typescript
// No App.tsx
<Notifications />
```

## Fluxo de Dados

### 1. Fetch de Dados (GET)

```
Component
  ↓
useCustomers() (TanStack Query)
  ↓
apiClient.get() (Axios wrapper)
  ↓
api.get() (Axios instance)
  ↓
Request Interceptor (adiciona token)
  ↓
Backend API
  ↓
Response Interceptor (trata erros)
  ↓
TanStack Query Cache
  ↓
Component re-render
```

### 2. Mutação (POST/PUT/DELETE)

```
Component
  ↓
useCreateCustomer() (TanStack Query Mutation)
  ↓
apiClient.post() (Axios wrapper)
  ↓
Backend API
  ↓
onSuccess:
  - Invalida cache (TanStack Query)
  - Mostra notificação (Zustand)
  ↓
Component re-render com dados atualizados
```

### 3. Autenticação

```
LoginPage
  ↓
useLogin() (TanStack Query Mutation)
  ↓
apiClient.post('/auth/login')
  ↓
Backend API (retorna token + user)
  ↓
onSuccess:
  - Salva token no localStorage
  - Atualiza Zustand authStore
  - Atualiza TanStack Query cache
  - Mostra notificação de sucesso
  ↓
Redirect para Dashboard
```

## Integração no App.tsx

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { Notifications } from './components/Notifications';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <AIProvider>
            <HandoffProvider>
              <AutomationProvider>
                <AppRoutes />
              </AutomationProvider>
            </HandoffProvider>
          </AIProvider>
        </AuthProvider>
      </ToastProvider>
      <Notifications />
    </QueryClientProvider>
  );
}
```

## Vantagens desta Arquitetura

### 1. Separação de Responsabilidades
- **TanStack Query**: Estado do servidor (dados da API)
- **Zustand**: Estado do cliente (UI, auth, notificações)
- **Axios**: Comunicação HTTP

### 2. Performance
- Cache automático com TanStack Query
- Background refetching
- Deduplicação de requests
- Otimistic updates

### 3. Developer Experience
- TypeScript em toda a stack
- Hooks simples e intuitivos
- DevTools para debugging
- Hot reload funcional

### 4. User Experience
- Loading states automáticos
- Error handling consistente
- Notificações visuais
- UI responsiva

### 5. Manutenibilidade
- Código modular e reutilizável
- Testável (cada camada isolada)
- Fácil de estender
- Documentação clara

## Exemplo Completo

Veja `src/components/examples/CompleteIntegrationExample.tsx` para um exemplo completo que demonstra:
- Fetch de dados com TanStack Query
- Criação de dados com mutations
- Notificações com Zustand
- Loading e error states
- Integração com Axios

## Próximos Passos

1. **Migrar componentes existentes** para usar os novos hooks
2. **Adicionar mais hooks** para outros recursos (conversations, requests, etc.)
3. **Implementar optimistic updates** para melhor UX
4. **Adicionar paginação** com TanStack Query
5. **Implementar infinite scroll** para listas longas
6. **Adicionar prefetching** para melhor performance

## Recursos

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Axios Docs](https://axios-http.com/docs/intro)
- [Exemplo Completo](src/components/examples/CompleteIntegrationExample.tsx)
