# Guia de Migração para Nova Arquitetura

## Visão Geral

Este guia ajuda a migrar componentes existentes da arquitetura antiga (DataContext) para a nova arquitetura (TanStack Query + Zustand + Axios).

## Antes vs Depois

### Antes (DataContext)
```typescript
import { useData } from '../contexts/DataContext';

function CustomersPage() {
  const { customers, createCustomer, deleteCustomer } = useData();
  
  const handleCreate = () => {
    createCustomer({ name: 'John', phone: '+351...' });
  };
  
  return (
    <div>
      {customers.map(c => <div key={c.id}>{c.name}</div>)}
      <button onClick={handleCreate}>Create</button>
    </div>
  );
}
```

### Depois (TanStack Query + Zustand)
```typescript
import { useCustomers, useCreateCustomer } from '../hooks/useCustomers';
import { useNotificationStore } from '../stores/notificationStore';

function CustomersPage() {
  const { data: customers, isLoading, error } = useCustomers();
  const createMutation = useCreateCustomer();
  const notifications = useNotificationStore();
  
  const handleCreate = () => {
    createMutation.mutate(
      { name: 'John', phone: '+351...' },
      {
        onSuccess: () => {
          notifications.success('Cliente criado');
        }
      }
    );
  };
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return (
    <div>
      {customers?.map(c => <div key={c.id}>{c.name}</div>)}
      <button onClick={handleCreate}>Create</button>
    </div>
  );
}
```

## Passo a Passo

### 1. Identificar Uso do DataContext

Procure por imports do DataContext:
```bash
grep -r "from.*DataContext" src/pages src/components
```

### 2. Substituir Queries

**Antes:**
```typescript
const { customers } = useData();
```

**Depois:**
```typescript
const { data: customers, isLoading, error } = useCustomers();
```

### 3. Substituir Mutations

**Antes:**
```typescript
const { createCustomer } = useData();
createCustomer(data);
```

**Depois:**
```typescript
const createMutation = useCreateCustomer();
createMutation.mutate(data);
```

### 4. Adicionar Loading States

**Antes:**
```typescript
// Sem loading state
const { customers } = useData();
return <div>{customers.map(...)}</div>;
```

**Depois:**
```typescript
const { data: customers, isLoading } = useCustomers();

if (isLoading) return <LoadingSpinner />;
return <div>{customers?.map(...)}</div>;
```

### 5. Adicionar Error Handling

**Antes:**
```typescript
// Sem error handling
const { customers } = useData();
return <div>{customers.map(...)}</div>;
```

**Depois:**
```typescript
const { data: customers, error } = useCustomers();

if (error) return <ErrorMessage error={error} />;
return <div>{customers?.map(...)}</div>;
```

### 6. Substituir Notificações

**Antes:**
```typescript
import { useToast } from '../contexts/ToastContext';

const toast = useToast();
toast.success('Cliente criado');
```

**Depois:**
```typescript
import { useNotificationStore } from '../stores/notificationStore';

const notifications = useNotificationStore();
notifications.success('Cliente criado');
```

## Exemplos de Migração

### Exemplo 1: CustomersPage

**Antes:**
```typescript
import { useData } from '../contexts/DataContext';

export function CustomersPage() {
  const { customers, createCustomer, deleteCustomer } = useData();
  
  return (
    <div>
      <button onClick={() => createCustomer({ name: 'John' })}>
        Create
      </button>
      {customers.map(c => (
        <div key={c.id}>
          {c.name}
          <button onClick={() => deleteCustomer(c.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

**Depois:**
```typescript
import { useCustomers, useCreateCustomer, useDeleteCustomer } from '../hooks/useCustomers';

export function CustomersPage() {
  const { data: customers, isLoading } = useCustomers();
  const createMutation = useCreateCustomer();
  const deleteMutation = useDeleteCustomer();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      <button 
        onClick={() => createMutation.mutate({ name: 'John' })}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Creating...' : 'Create'}
      </button>
      {customers?.map(c => (
        <div key={c.id}>
          {c.name}
          <button 
            onClick={() => deleteMutation.mutate(c.id)}
            disabled={deleteMutation.isPending}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Exemplo 2: ConversationDetail

**Antes:**
```typescript
import { useData } from '../contexts/DataContext';

export function ConversationDetail({ id }) {
  const { conversations, addMessage } = useData();
  const conversation = conversations.find(c => c.id === id);
  
  const handleSend = (message) => {
    addMessage(id, { content: message, senderType: 'USER' });
  };
  
  return <div>...</div>;
}
```

**Depois:**
```typescript
import { useConversation } from '../hooks/useConversations';
import { useSendMessage } from '../hooks/useMessages';

export function ConversationDetail({ id }) {
  const { data: conversation, isLoading } = useConversation(id);
  const sendMessageMutation = useSendMessage();
  
  const handleSend = (message) => {
    sendMessageMutation.mutate({
      conversationId: id,
      content: message,
      senderType: 'USER'
    });
  };
  
  if (isLoading) return <LoadingSpinner />;
  
  return <div>...</div>;
}
```

### Exemplo 3: Auth

**Antes:**
```typescript
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const { login, isLoading } = useAuth();
  
  const handleSubmit = (email, password) => {
    login(email, password);
  };
  
  return <form onSubmit={...}>...</form>;
}
```

**Depois:**
```typescript
import { useLogin } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';

function LoginPage() {
  const loginMutation = useLogin();
  const { isAuthenticated } = useAuthStore();
  
  const handleSubmit = (email, password) => {
    loginMutation.mutate({ email, password });
  };
  
  return <form onSubmit={...}>...</form>;
}
```

## Checklist de Migração

Para cada componente:

- [ ] Remover import do DataContext
- [ ] Substituir queries por hooks do TanStack Query
- [ ] Substituir mutations por hooks de mutation
- [ ] Adicionar loading states
- [ ] Adicionar error handling
- [ ] Substituir notificações (useToast → useNotificationStore)
- [ ] Testar funcionalidade
- [ ] Verificar se notificações aparecem
- [ ] Verificar se cache está funcionando

## Hooks Disponíveis

### Customers
- `useCustomers()` - Lista todos
- `useCustomer(id)` - Um cliente
- `useCreateCustomer()` - Criar
- `useUpdateCustomer()` - Atualizar
- `useDeleteCustomer()` - Remover

### Conversations
- `useConversations(filters)` - Lista com filtros
- `useConversation(id)` - Uma conversa
- `useUpdateConversationState()` - Atualizar estado
- `useTakeoverConversation()` - Assumir conversa

### Requests
- `useRequests()` - Lista todos
- `useRequest(id)` - Um pedido
- `useCreateRequest()` - Criar
- `useUpdateRequest()` - Atualizar
- `useUpdateRequestState()` - Atualizar estado

### Auth
- `useLogin()` - Login
- `useRegister()` - Registo
- `useAuthUser()` - User atual
- `useLogout()` - Logout

## Stores Disponíveis

### Auth Store
```typescript
const { user, isAuthenticated, logout } = useAuthStore();
```

### UI Store
```typescript
const { sidebarOpen, toggleSidebar, openModal } = useUIStore();
```

### Notification Store
```typescript
const notifications = useNotificationStore();
notifications.success('Title', 'Message');
notifications.error('Title', 'Message');
```

## Benefícios da Migração

### 1. Performance
- ✅ Cache automático
- ✅ Background refetching
- ✅ Deduplicação de requests

### 2. UX
- ✅ Loading states automáticos
- ✅ Error handling consistente
- ✅ Notificações visuais
- ✅ Optimistic updates

### 3. Developer Experience
- ✅ TypeScript em toda a stack
- ✅ Hooks simples e intuitivos
- ✅ DevTools para debugging
- ✅ Fácil de testar

### 4. Manutenibilidade
- ✅ Código modular
- ✅ Separação de responsabilidades
- ✅ Fácil de estender
- ✅ Documentação clara

## Problemas Comuns

### 1. "data is undefined"
**Solução:** Verificar se o componente está dentro do QueryClientProvider

### 2. "Mutation not working"
**Solução:** Verificar se está a chamar `.mutate()` e não a função diretamente

### 3. "Notifications not showing"
**Solução:** Verificar se o componente Notifications está no App.tsx

### 4. "Token not being sent"
**Solução:** Verificar se o token está no localStorage e se o interceptor está configurado

## Próximos Passos

1. Migrar componentes um por um
2. Testar cada componente após migração
3. Remover DataContext após migração completa
4. Atualizar documentação
5. Adicionar mais hooks conforme necessário

## Recursos

- [Arquitetura Completa](./ARCHITECTURE.md)
- [TanStack Query Guide](./TANSTACK_QUERY.md)
- [Exemplo Completo](../src/components/examples/CompleteIntegrationExample.tsx)
