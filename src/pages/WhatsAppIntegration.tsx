import { useState } from 'react';
import { MessageSquare, CheckCircle, XCircle, AlertCircle, RefreshCw, Copy, ExternalLink, Settings, Shield } from 'lucide-react';

export function WhatsAppIntegration() {
  const [isConnected, setIsConnected] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://api.serviceflow.ai/webhooks/whatsapp');
  const [verifyToken, setVerifyToken] = useState('sf_wh_verify_abc123xyz');
  const [phoneNumber, setPhoneNumber] = useState('+351 912 345 678');
  const [businessAccountId, setBusinessAccountId] = useState('123456789012345');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const webhookEvents = [
    { event: 'messages', status: 'active', description: 'Receber mensagens de clientes' },
    { event: 'message_status', status: 'active', description: 'Status de entrega (enviada, lida, etc.)' },
    { event: 'message_template_status_update', status: 'inactive', description: 'Atualizações de templates' },
  ];

  const recentWebhooks = [
    { id: '1', timestamp: '2024-12-19T14:32:00Z', event: 'messages', status: 'success', customer: 'Maria Santos' },
    { id: '2', timestamp: '2024-12-19T14:20:00Z', event: 'messages', status: 'success', customer: 'João Ferreira' },
    { id: '3', timestamp: '2024-12-19T13:45:00Z', event: 'messages', status: 'success', customer: 'Ana Costa' },
    { id: '4', timestamp: '2024-12-19T12:30:00Z', event: 'message_status', status: 'success', customer: 'Pedro Oliveira' },
    { id: '5', timestamp: '2024-12-19T11:15:00Z', event: 'messages', status: 'error', customer: 'Sofia Mendes' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integração WhatsApp</h1>
          <p className="text-sm text-gray-500 mt-1">Meta WhatsApp Cloud API</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isConnected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-xs font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          <button
            onClick={() => setIsConnected(!isConnected)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Testar Conexão
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-gray-500">Mensagens Hoje</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">47</p>
          <p className="text-xs text-green-600 mt-1">+12% vs ontem</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-500">Taxa de Entrega</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">98.5%</p>
          <p className="text-xs text-gray-500 mt-1">últimas 24h</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-medium text-gray-500">Erros</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">2</p>
          <p className="text-xs text-gray-500 mt-1">últimas 24h</p>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-900">Configuração</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Webhook URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => handleCopy(webhookUrl, 'webhook')}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied === 'webhook' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Verify Token</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => handleCopy(verifyToken, 'token')}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied === 'token' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Phone Number ID</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Business Account ID</label>
              <input
                type="text"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Events */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-900">Webhook Events Subscritos</h3>
        </div>
        <div className="space-y-2">
          {webhookEvents.map((event, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{event.event}</p>
                <p className="text-xs text-gray-500">{event.description}</p>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                event.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {event.status === 'active' ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {event.status === 'active' ? 'Ativo' : 'Inativo'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Webhooks */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Webhooks Recentes</h3>
          <a href="https://developers.facebook.com/docs/whatsapp/cloud-api" target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            Documentação Meta <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="space-y-2">
          {recentWebhooks.map((webhook) => (
            <div key={webhook.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                webhook.status === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{webhook.customer}</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{webhook.event}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(webhook.timestamp).toLocaleString('pt-PT')}
                </p>
              </div>
              <div className={`text-xs font-medium ${
                webhook.status === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {webhook.status === 'success' ? '✓ Sucesso' : '✗ Erro'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Como Configurar no Meta for Developers</h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            <span>Aceder a <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">developers.facebook.com</a> e criar uma app WhatsApp</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            <span>Em "Webhooks", configurar a URL com o valor acima e o Verify Token</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            <span>Subscrever os eventos "messages" e "message_status"</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            <span>Obter o Phone Number ID e Business Account ID</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">5.</span>
            <span>Gerar um Access Token com permissões "whatsapp_business_messaging"</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
