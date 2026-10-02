import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { usePermission } from '../hooks/usePermission';
import { PermissionGuard, RequirePermission } from '../components/ui/PermissionGuard';
import { rolePermissions, roleMetadata, Permission, Role } from '../lib/permissions';
import { Users, Shield, Edit2, Trash2, Plus, Check, X } from 'lucide-react';

// Mock team members (in production, this would come from database)
const mockTeamMembers = [
  { id: 'user_1', name: 'Admin ClimaTech', email: 'admin@climatech.pt', role: 'OWNER' as Role },
  { id: 'user_2', name: 'Carlos Técnico', email: 'carlos@climatech.pt', role: 'TECHNICIAN' as Role },
  { id: 'user_3', name: 'Ana Gestora', email: 'ana@climatech.pt', role: 'MANAGER' as Role },
];

export function TeamManagement() {
  const { can } = usePermission();
  const [members, setMembers] = useState(mockTeamMembers);
  const [showInvite, setShowInvite] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<Role>('TECHNICIAN');

  const handleRoleChange = (userId: string, role: Role) => {
    setMembers(members.map(m => m.id === userId ? { ...m, role } : m));
    setEditingRole(null);
  };

  const handleRemove = (userId: string) => {
    if (confirm('Tem a certeza que deseja remover este membro da equipa?')) {
      setMembers(members.filter(m => m.id !== userId));
    }
  };

  return (
    <RequirePermission permission="team:view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Equipa</h1>
            <p className="text-sm text-gray-500 mt-1">Gerir membros e permissões</p>
          </div>
          <PermissionGuard permission="team:invite">
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              Convidar Membro
            </button>
          </PermissionGuard>
        </div>

        {/* Team Members List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Membro</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => {
                const meta = roleMetadata[member.role];
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-700">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                    <td className="px-6 py-4">
                      {editingRole === member.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as Role)}
                            className="px-2 py-1 border border-gray-200 rounded text-sm"
                          >
                            {Object.entries(roleMetadata).map(([role, meta]) => (
                              <option key={role} value={role}>
                                {meta.icon} {meta.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleRoleChange(member.id, newRole)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingRole(null)}
                            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}>
                          <span>{meta.icon}</span>
                          {meta.label}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PermissionGuard permission="team:update_roles">
                          <button
                            onClick={() => {
                              setEditingRole(member.id);
                              setNewRole(member.role);
                            }}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                            title="Alterar role"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission="team:remove">
                          <button
                            onClick={() => handleRemove(member.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Remover membro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Roles Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            Papéis e Permissões
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(roleMetadata).map(([role, meta]) => (
              <div key={role} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{meta.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{meta.label}</h3>
                    <p className="text-xs text-gray-500">{meta.description}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">
                    {rolePermissions[role as Role].length} permissões
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {rolePermissions[role as Role].slice(0, 5).map(perm => (
                      <span key={perm} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {perm.split(':')[1]}
                      </span>
                    ))}
                    {rolePermissions[role as Role].length > 5 && (
                      <span className="text-xs text-gray-400">
                        +{rolePermissions[role as Role].length - 5} mais
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite Modal */}
        {showInvite && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Convidar Membro</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <input
                    type="email"
                    placeholder="nome@empresa.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Role</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    {Object.entries(roleMetadata).map(([role, meta]) => (
                      <option key={role} value={role}>
                        {meta.icon} {meta.label} - {meta.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowInvite(false)}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                  >
                    Enviar Convite
                  </button>
                  <button
                    onClick={() => setShowInvite(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
