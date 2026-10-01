# Sistema de Permissões RBAC

## Visão Geral

O ServiceFlow AI implementa um sistema de controlo de acesso baseado em roles (RBAC) com permissões granulares para cada módulo do sistema.

## Roles Disponíveis

### 👑 OWNER (Proprietário)
**Descrição:** Acesso total à organização, incluindo billing e integrações.

**Permissões exclusivas:**
- `settings:update_billing` — Gerir subscrição e pagamento
- Todas as outras permissões do ADMIN

**Caso de uso:** Fundador ou responsável financeiro da empresa.

---

### 🛡️ ADMIN (Administrador)
**Descrição:** Acesso quase total, sem gestão de billing.

**Permissões:**
- Dashboard completo
- Gestão total de Inbox, Pedidos, Clientes, Serviços, Marcações
- Criação e gestão de Automações
- Gestão de Equipa (convidar, alterar roles, remover)
- Configuração de integrações (WhatsApp, etc.)
- Visualização de Audit Logs
- Configuração de IA e Handoffs

**Caso de uso:** Gestor operacional ou administrador do sistema.

---

### 👔 MANAGER (Gestor)
**Descrição:** Gere equipa e operações, sem poder eliminar dados críticos.

**Permissões:**
- Dashboard completo
- Gestão de Inbox (responder, assumir, fechar, transferir)
- Criação e atualização de Pedidos, Clientes, Marcações
- Visualização de Serviços e Automações
- Visualização de Equipa (sem poder alterar)
- Visualização de Audit Logs
- Aceitação de Handoffs

**Limitações:**
- ❌ Não pode eliminar clientes, serviços ou automações
- ❌ Não pode gerir equipa (convidar/remover)
- ❌ Não pode configurar integrações

**Caso de uso:** Supervisor de equipa ou gestor de operações.

---

### 🔧 TECHNICIAN (Técnico)
**Descrição:** Acede apenas a pedidos e marcações atribuídos.

**Permissões:**
- Dashboard (visão geral)
- Inbox (apenas conversas atribuídas)
- Pedidos (apenas atribuídos, pode atualizar estado)
- Visualização de Clientes, Serviços
- Marcações (apenas atribuídas, pode atualizar)
- Definições (apenas visualização)
- Aceitação de Handoffs

**Limitações:**
- ❌ Não pode ver todas as conversas/pedidos
- ❌ Não pode criar clientes ou pedidos
- ❌ Não pode aceder a Automações, AI Console, Audit Log
- ❌ Não pode gerir equipa ou integrações

**Caso de uso:** Técnico de campo ou operador de atendimento.

---

### 👁️ VIEWER (Visualizador)
**Descrição:** Apenas leitura, sem poder alterar dados.

**Permissões:**
- Dashboard (visão geral)
- Inbox (apenas conversas atribuídas, sem responder)
- Pedidos (apenas atribuídos, sem alterar)
- Visualização de Clientes, Serviços
- Marcações (apenas atribuídas, sem alterar)
- Definições (apenas visualização)

**Limitações:**
- ❌ Não pode alterar nenhum dado
- ❌ Não pode responder a conversas
- ❌ Não pode aceder a módulos administrativos

**Caso de uso:** Consultor externo, auditor ou utilizador em período de avaliação.

---

## Matriz de Permissões por Módulo

### Dashboard
| Permissão | OWNER | ADMIN | MANAGER | TECHNICIAN | VIEWER |
|-----------|-------|-------|---------|------------|--------|
| `dashboard:view` | ✅ | ✅ | ✅ | ✅ | ✅ |

### Inbox & Conversas
| Permissão | OWNER | ADMIN | MANAGER | TECHNICIAN | VIEWER |
|-----------|-------|-------|---------|------------|--------|
| `inbox:view_all` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `inbox:view_assigned` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `inbox:respond` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `inbox:takeover` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `inbox:close` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `inbox:transfer` | ✅ | ✅ | ✅ | ❌ | ❌ |

### Pedidos
| Permissão | OWNER | ADMIN | MANAGER | TECHNICIAN | VIEWER |
|-----------|-------|-------|---------|------------|--------|
| `requests:view_all` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `requests:view_assigned` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `requests:create` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `requests:update` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `requests:delete` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `requests:assign` | ✅ | ✅ | ✅ | ❌ | ❌ |

### Clientes
| Permissão | OWNER | ADMIN | MANAGER | TECHNICIAN | VIEWER |
|-----------|-------|-------|---------|------------|--------|
| `customers:view_all` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `customers:create` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `customers:update` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `customers:delete` | ✅ | ✅ | ❌ | ❌ | ❌ |

### Serviços
| Permissão | OWNER | ADMIN | MANAGER | TECHNICIAN | VIEWER |
|-----------|-------|-------|---------|------------|--------|
| `services:view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `services:create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `services:update` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `services:delete` | ✅ | ✅ | ❌ | ❌ | ❌ |

### Marcações
| Permissão | OWNER | ADMIN | MANAGER | TECHNICIAN | VIEWER |
|-----------|-------|-------|---------|------------|--------|
| `appointments:view_all` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `appointments:view_assigned` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `appointments:create` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `appointments:update` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `appointments:delete` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `appointments:assign` | ✅ | ✅ | ✅ | ❌ | ❌ |

### Automações
| Permissão | OWNER | ADMIN | MANAGER | TECHNICIAN | VIEWER |
|-----------|-------|-------|---------|------------|--------|
| `automations:view` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `automations:create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `automations:update` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `automations:delete` | ✅ | ✅ | ❌ | ❌ | ❌ |

### Equipa
| Permissão | OWNER | ADMIN | MANAGER | TECHNICIAN | VIEWER |
|-----------|-------|-------|---------|------------|--------|
| `team:view` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `team:invite` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `team:update_roles` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `team:remove` | ✅ | ✅ | ❌ | ❌ | ❌ |

### Definições
| Permissão | OWNER | ADMIN | MANAGER | TECHNICIAN | VIEWER |
|-----------|-------|-------|---------|------------|--------|
| `settings:view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `settings:update_general` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `settings:update_billing` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `settings:update_integrations` | ✅ | ✅ | ❌ | ❌ | ❌ |

### Audit & Segurança
| Permissão | OWNER | ADMIN | MANAGER | TECHNICIAN | VIEWER |
|-----------|-------|-------|---------|------------|--------|
| `audit:view` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `audit:export` | ✅ | ❌ | ❌ | ❌ | ❌ |

### IA & Handoffs
| Permissão | OWNER | ADMIN | MANAGER | TECHNICIAN | VIEWER |
|-----------|-------|-------|---------|------------|--------|
| `ai:view_console` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `ai:configure_autonomy` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `handoffs:view` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `handoffs:accept` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `handoffs:reject` | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## Implementação Técnica

### Ficheiros Principais

1. **`src/lib/permissions.ts`**
   - Definição de tipos (`Role`, `Permission`)
   - Matriz de permissões (`rolePermissions`)
   - Metadata de roles (`roleMetadata`)
   - Funções helper (`hasPermission`, `hasAnyPermission`, `hasAllPermissions`)

2. **`src/hooks/usePermission.ts`**
   - Hook `usePermission()` para verificar permissões em componentes
   - Retorna `can()`, `canAny()`, `canAll()`

3. **`src/components/ui/PermissionGuard.tsx`**
   - `PermissionGuard` — Esconde/mostra conteúdo baseado em permissão
   - `RequirePermission` — Protege página inteira com mensagem de acesso negado
   - `PermissionButton` — Botão que fica disabled sem permissão

### Exemplos de Uso

#### Verificar permissão num componente

```typescript
import { usePermission } from '../hooks/usePermission';

function MyComponent() {
  const { can } = usePermission();
  
  return (
    <div>
      {can('customers:create') && (
        <button>Criar Cliente</button>
      )}
    </div>
  );
}
```

#### Proteger conteúdo com PermissionGuard

```typescript
import { PermissionGuard } from '../components/ui/PermissionGuard';

function CustomerList() {
  return (
    <div>
      <h1>Clientes</h1>
      
      <PermissionGuard permission="customers:create">
        <button>Novo Cliente</button>
      </PermissionGuard>
      
      <table>
        {customers.map(c => (
          <tr key={c.id}>
            <td>{c.name}</td>
            <td>
              <PermissionGuard permission="customers:update">
                <button>Editar</button>
              </PermissionGuard>
              
              <PermissionGuard permission="customers:delete">
                <button>Eliminar</button>
              </PermissionGuard>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

#### Proteger página inteira

```typescript
import { RequirePermission } from '../components/ui/PermissionGuard';

function AdminPage() {
  return (
    <RequirePermission permission="team:view">
      <div>
        <h1>Gestão de Equipa</h1>
        {/* Conteúdo da página */}
      </div>
    </RequirePermission>
  );
}
```

#### Navegação dinâmica no Layout

```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard', permission: 'dashboard:view' },
  { name: 'Inbox', href: '/inbox', permission: 'inbox:view_all' },
  { name: 'Audit Log', href: '/audit', permission: 'audit:view' },
];

const filteredNavigation = navigation.filter(item => can(item.permission));
```

---

## Boas Práticas

### 1. Princípio do Menor Privilégio
- Atribuir apenas as permissões necessárias para cada role
- Revisar permissões periodicamente
- Usar roles mais restritivos quando possível

### 2. Segregação de Funções
- OWNER e ADMIN não devem ser a mesma pessoa (quando possível)
- Quem cria não deve ser quem aprova (em processos críticos)
- Audit logs devem ser vistos por alguém diferente de quem executa

### 3. Auditoria
- Todas as alterações de permissões devem ser registadas
- Rever audit logs regularmente
- Alertas para alterações suspeitas (ex: promoção para OWNER)

### 4. Onboarding de Novos Membros
- Começar com role mais restritivo (VIEWER ou TECHNICIAN)
- Promover gradualmente conforme necessidade
- Documentar justificativa para cada promoção

---

## Cenários Comuns

### Cenário 1: Novo Técnico de Campo
**Role recomendado:** TECHNICIAN

**Permissões:**
- ✅ Ver pedidos atribuídos
- ✅ Atualizar estado de pedidos
- ✅ Ver marcações atribuídas
- ✅ Aceitar handoffs
- ❌ Ver todas as conversas
- ❌ Criar clientes
- ❌ Aceder a automações

---

### Cenário 2: Gestor de Operações
**Role recomendado:** MANAGER

**Permissões:**
- ✅ Ver todas as conversas e responder
- ✅ Criar e atualizar pedidos
- ✅ Criar marcações
- ✅ Ver automações (sem editar)
- ✅ Aceitar handoffs
- ❌ Eliminar dados críticos
- ❌ Gerir equipa

---

### Cenário 3: Administrador do Sistema
**Role recomendado:** ADMIN

**Permissões:**
- ✅ Acesso total exceto billing
- ✅ Gerir equipa e roles
- ✅ Configurar integrações
- ✅ Ver audit logs
- ❌ Gerir subscrição/pagamento

---

### Cenário 4: Proprietário da Empresa
**Role recomendado:** OWNER

**Permissões:**
- ✅ Acesso total, incluindo billing
- ✅ Todas as permissões do ADMIN
- ✅ Gestão financeira e subscrição

---

## Futuras Melhorias

### Permissões Personalizadas
- Criar roles customizados além dos 5 padrão
- Permitir combinação granular de permissões
- Templates de roles pré-definidos

### Permissões por Recurso
- Restringir acesso a clientes específicos
- Restringir acesso a serviços específicos
- Permissões por zona geográfica

### Approval Workflows
- Ações críticas requerem aprovação de outro utilizador
- Ex: Eliminar cliente requer aprovação do ADMIN
- Ex: Alterar role requer aprovação do OWNER

### Delegação Temporária
- Delegar permissões por tempo limitado
- Ex: TECHNICIAN pode criar clientes por 1 semana
- Expiração automática após período

---

## Referências

- [RBAC (Role-Based Access Control)](https://en.wikipedia.org/wiki/Role-based_access_control)
- [Princípio do Menor Privilégio](https://en.wikipedia.org/wiki/Principle_of_least_privilege)
- [OWASP Access Control Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html)
