import { Snowflake, MessageSquare, Zap, Shield, Clock, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Snowflake className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">ServiceFlow AI</span>
          </div>
          <button
            onClick={onLogin}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Entrar
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 border border-primary-200 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5 text-primary-600" />
            <span className="text-xs font-medium text-primary-700">IA que transforma conversas em ações</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Atendimento automatizado para{' '}
            <span className="text-primary-600">pequenas empresas</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            A sua IA gere chamadas perdidas, recolhe dados de pedidos, agenda serviços e faz follow-up — tudo via WhatsApp.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onLogin}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center gap-2"
            >
              Começar grátis <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Ver demo
            </button>
          </div>
        </div>
      </section>

      {/* Example Conversation */}
      <section className="pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">WhatsApp</p>
                <p className="text-gray-400 text-xs">Cliente → ServiceFlow AI</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-green-600 text-white px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
                  <p className="text-sm">O meu ar condicionado não funciona.</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-700 text-white px-4 py-2 rounded-2xl rounded-bl-sm max-w-[80%]">
                  <p className="text-sm">Olá! 👋 Posso ajudar. Qual é a marca do equipamento?</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-green-600 text-white px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
                  <p className="text-sm">É um Daikin, modelo FTXM25</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-700 text-white px-4 py-2 rounded-2xl rounded-bl-sm max-w-[80%]">
                  <p className="text-sm">Obrigada! E o que acontece exatamente? Não arrefece, faz ruído, pinga água?</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-800 rounded-xl border border-gray-600">
                <p className="text-xs text-gray-400 mb-2 font-medium">✅ Pedido criado automaticamente:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <span>Marca: Daikin</span>
                  <span>Modelo: FTXM25</span>
                  <span>Sintoma: Não arrefece</span>
                  <span>Estado: A recolher dados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Tudo o que precisa para gerir serviços</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Uma plataforma completa que transforma mensagens em pedidos estruturados e ações concretas.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: MessageSquare, title: 'Inbox Inteligente', desc: 'Conversas em tempo real com IA que recolhe dados automaticamente.' },
              { icon: Zap, title: 'Pedidos Automáticos', desc: 'A IA cria pedidos estruturados a partir das conversas.' },
              { icon: Clock, title: 'Marcações', desc: 'Agendamento automático baseado na disponibilidade.' },
              { icon: Shield, title: 'Human-in-the-Loop', desc: 'Controlo total: a IA sugere, você decide.' },
              { icon: TrendingUp, title: 'Follow-up Automático', desc: 'Lembretes e seguimentos sem esforço manual.' },
              { icon: CheckCircle, title: 'Multi-serviço', desc: 'AVAC, eletricidade, canalização, manutenção e mais.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <feature.icon className="w-8 h-8 text-primary-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pronto para reduzir chamadas perdidas?</h2>
          <p className="text-gray-600 mb-8">Configure em 5 minutos. A IA começa a trabalhar imediatamente.</p>
          <button
            onClick={onLogin}
            className="px-8 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
          >
            Criar conta gratuita
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-gray-900">ServiceFlow AI</span>
          </div>
          <p className="text-xs text-gray-500">© 2024 ServiceFlow AI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
