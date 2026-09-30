import { useState } from 'react';
import { Building2, Clock, MapPin, Phone, Mail, Shield, Bot, Users, Save } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
  const { organization, updateOrganization } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('organization');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { key: 'organization', label: 'Organização', icon: Building2 },
    { key: 'hours', label: 'Horários', icon: Clock },
    { key: 'zones', label: 'Zonas', icon: MapPin },
    { key: 'ai', label: 'IA & Autonomia', icon: Bot },
    { key: 'team', label: 'Equipa', icon: Users },
    { key: 'security', label: 'Segurança', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Definições</h1>
          <p className="text-sm text-gray-500 mt-1">Configurar a sua organização</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Guardado ✓' : 'Guardar'}
        </button>
      </div>

      <div className="flex gap-6">
        <div className="w-48 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'organization' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-900">Informações da Organização</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Nome</label>
                  <input type="text" defaultValue={organization.name} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Telefone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <input type="text" defaultValue={organization.phone} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <input type="email" defaultValue={organization.email} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Fuso Horário</label>
                  <select defaultValue={organization.timezone} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option>Europe/Lisbon</option>
                    <option>Europe/Madrid</option>
                    <option>Europe/London</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-900">Horário de Funcionamento</h3>
              <div className="space-y-3">
                {Object.entries(organization.businessHours).map(([day, schedule]) => (
                  <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 capitalize w-24">
                      {day === 'monday' ? 'Segunda' : day === 'tuesday' ? 'Terça' : day === 'wednesday' ? 'Quarta' : day === 'thursday' ? 'Quinta' : day === 'friday' ? 'Sexta' : day === 'saturday' ? 'Sábado' : 'Domingo'}
                    </span>
                    {schedule.closed ? (
                      <span className="text-sm text-gray-400">Encerrado</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input type="time" defaultValue={schedule.open} className="px-2 py-1 border border-gray-200 rounded text-sm" />
                        <span className="text-gray-400">—</span>
                        <input type="time" defaultValue={schedule.close} className="px-2 py-1 border border-gray-200 rounded text-sm" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'zones' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-900">Zonas de Serviço</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {organization.serviceZones.map((zone) => (
                  <span key={zone} className="px-3 py-1.5 bg-primary-50 border border-primary-200 text-primary-700 rounded-lg text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {zone}
                    <button className="text-primary-400 hover:text-primary-600">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Adicionar zona..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Adicionar</button>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-900">Configuração de IA</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Nível de Autonomia</h4>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="autonomy" defaultChecked={organization.autonomyLevel === 1} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Nível 1 — Sugestão</p>
                        <p className="text-xs text-gray-500">IA apenas sugere respostas. Humano aprova tudo.</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 border border-primary-200 bg-primary-50 rounded-lg cursor-pointer">
                      <input type="radio" name="autonomy" defaultChecked={organization.autonomyLevel === 2} />
                      <div>
                        <p className="text-sm font-medium text-primary-900">Nível 2 — Semi-Autónomo (Recomendado)</p>
                        <p className="text-xs text-primary-700">IA responde FAQs e recolhe dados. Ações importantes exigem aprovação.</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="autonomy" defaultChecked={organization.autonomyLevel === 3} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Nível 3 — Autónomo</p>
                        <p className="text-xs text-gray-500">IA executa ações previamente autorizadas sem aprovação.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Provider de IA</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2">
                      <input type="radio" name="provider" defaultChecked />
                      <span className="text-sm text-gray-700">Groq (Primary)</span>
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Ativo</span>
                    </label>
                    <label className="flex items-center gap-3 p-2">
                      <input type="radio" name="provider" />
                      <span className="text-sm text-gray-700">OpenAI (Fallback)</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Standby</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">Dados Proibidos para IA</h4>
                  <p className="text-xs text-red-700 mb-3">Estes dados nunca serão enviados ao LLM (importante para clínicas).</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Dados médicos</span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Diagnósticos</span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Tratamentos</span>
                    <button className="px-2 py-1 border border-red-200 text-red-600 rounded text-xs hover:bg-red-100">+ Adicionar</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Equipa</h3>
                <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700">+ Convidar</button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-700">{user?.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">{user?.role}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-700">CT</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Carlos Técnico</p>
                    <p className="text-xs text-gray-500">carlos@climatech.pt</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700">TECHNICIAN</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-900">Segurança</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Autenticação</h4>
                  <p className="text-xs text-gray-500 mb-3">Supabase Auth com email/password</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-700 font-medium">Ativo</span>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Tenant Isolation</h4>
                  <p className="text-xs text-gray-500">Todas as queries incluem organizationId. Isolamento garantido a nível de database.</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-700 font-medium">Ativo</span>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Webhook Security</h4>
                  <p className="text-xs text-gray-500 mb-2">Meta WhatsApp Webhook</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">verify_token: ••••••••</code>
                    <button className="text-xs text-primary-600 hover:underline">Regenerar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
