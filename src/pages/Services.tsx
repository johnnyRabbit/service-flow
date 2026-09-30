import { useState } from 'react';
import { Plus, Snowflake, Edit, Trash2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Modal } from '../components/ui/Modal';

export function Services() {
  const { services, createService, updateService, deleteService } = useData();
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: 'Snowflake',
    estimatedDuration: 60,
    basePrice: 50,
    requiredFields: [] as any[],
    optionalFields: [] as any[],
    rules: [] as any[],
  });

  const handleCreate = () => {
    if (!form.name) return;
    createService(form);
    setShowCreate(false);
    setForm({ name: '', description: '', icon: 'Snowflake', estimatedDuration: 60, basePrice: 50, requiredFields: [], optionalFields: [], rules: [] });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remover serviço "${name}"?`)) {
      deleteService(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-sm text-gray-500 mt-1">{services.length} serviços configurados</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Serviço
        </button>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Snowflake className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">€{service.basePrice}</p>
                  <p className="text-xs text-gray-500">{service.estimatedDuration} min</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {service.requiredFields.length} campos obrig.
                  </span>
                  {service.rules.length > 0 && (
                    <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                      {service.rules.length} regras
                    </span>
                  )}
                </div>
                {expandedService === service.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {expandedService === service.id && (
              <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Campos Obrigatórios</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {service.requiredFields.map((field) => (
                      <div key={field.key} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{field.label}</p>
                          <p className="text-xs text-gray-500">{field.type}{field.options ? ` (${field.options.length} opções)` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {service.optionalFields.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Campos Opcionais</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {service.optionalFields.map((field) => (
                        <div key={field.key} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{field.label}</p>
                            <p className="text-xs text-gray-500">{field.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {service.rules.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Regras Automáticas</h4>
                    <div className="space-y-2">
                      {service.rules.map((rule) => (
                        <div key={rule.id} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-yellow-200">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{rule.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Condição: <code className="bg-gray-100 px-1 rounded">{rule.condition}</code>
                            </p>
                            <p className="text-xs text-gray-500">
                              Ação: <span className="font-medium">{rule.action.replace(/_/g, ' ')}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-white">
                    <Edit className="w-3 h-3" /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(service.id, service.name)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" /> Remover
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {services.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">Nenhum serviço configurado</p>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
              Criar primeiro serviço
            </button>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Serviço" description="Configure um novo serviço para a sua organização">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Nome do Serviço *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Reparação de Ar Condicionado"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Descrição</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Descrição breve"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Duração (min)</label>
              <input
                type="number"
                value={form.estimatedDuration}
                onChange={(e) => setForm({ ...form, estimatedDuration: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Preço Base (€)</label>
              <input
                type="number"
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Dica:</strong> Após criar, poderá configurar os campos obrigatórios/opcionais e regras automáticas.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCreate}
              disabled={!form.name}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              Criar Serviço
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
