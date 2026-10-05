import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Phone, Mail, MapPin, Calendar, Loader2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '../hooks/useCustomers';
import { Modal } from '../components/ui/Modal';
import { PermissionGuard } from '../components/ui/PermissionGuard';
import { Customer } from '../types';

export function CustomersPage() {
  const { customers, createCustomer, updateCustomer, deleteCustomer } = useData();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm({ name: '', phone: '', email: '', address: '' });
    setShowCreate(true);
  };

  const openEdit = (c: Customer) => {
    setForm({ name: c.name, phone: c.phone, email: c.email || '', address: c.address || '' });
    setEditing(c);
  };

  const handleCreate = () => {
    if (!form.name || !form.phone) return;
    createCustomer(form);
    setShowCreate(false);
  };

  const handleUpdate = () => {
    if (!editing) return;
    updateCustomer(editing.id, form);
    setEditing(null);
  };

  const handleDelete = (c: Customer) => {
    if (confirm(`Remover cliente ${c.name}?`)) {
      deleteCustomer(c.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">{customers.length} clientes registados</p>
        </div>
        <PermissionGuard permission="customers:create">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </button>
        </PermissionGuard>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar por nome, telefone ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contacto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Morada</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Pedidos</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Desde</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-700">{c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm text-gray-700 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</p>
                    {c.email && <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</p>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600 flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{c.address || '—'}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">{c.totalRequests}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(c.createdAt).toLocaleDateString('pt-PT')}</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <PermissionGuard permission="customers:update">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission="customers:delete">
                      <button onClick={() => handleDelete(c)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </PermissionGuard>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                  Nenhum cliente encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Cliente" description="Adicionar um novo cliente à base de dados">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Nome *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Telefone *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="+351 9XX XXX XXX"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Morada</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Rua, número, cidade"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleCreate} disabled={!form.name || !form.phone} className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
              Criar Cliente
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Cliente" description={editing?.name}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Nome</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Telefone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Morada</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleUpdate} className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Guardar</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
