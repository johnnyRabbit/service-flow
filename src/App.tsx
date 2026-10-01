import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { Inbox } from './pages/Inbox';
import { ConversationDetail } from './pages/ConversationDetail';
import { Requests } from './pages/Requests';
import { Services } from './pages/Services';
import { Appointments } from './pages/Appointments';
import { Automations } from './pages/Automations';
import { Settings } from './pages/Settings';
import { AuditLogs } from './pages/AuditLogs';
import { CustomersPage } from './pages/CustomersPage';
import { WebhookTester } from './pages/WebhookTester';
import { AIConsole } from './pages/AIConsole';
import { HandoffSupervisor } from './pages/HandoffSupervisor';
import { WhatsAppIntegration } from './pages/WhatsAppIntegration';
import { TeamManagement } from './pages/TeamManagement';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { DataProvider } from './contexts/DataContext';
import { AIProvider } from './contexts/AIContext';
import { HandoffProvider } from './contexts/HandoffContext';
import { AutomationProvider } from './contexts/AutomationContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-lg">❄</span>
          </div>
          <p className="text-sm text-gray-500">A carregar...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <LoginPage />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <DataProvider>
              <Layout />
            </DataProvider>
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="inbox/:conversationId" element={<ConversationDetail />} />
          <Route path="requests" element={<Requests />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="services" element={<Services />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="automations" element={<Automations />} />
          <Route path="webhook-tester" element={<WebhookTester />} />
          <Route path="ai-console" element={<AIConsole />} />
          <Route path="handoffs" element={<HandoffSupervisor />} />
          <Route path="whatsapp" element={<WhatsAppIntegration />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
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
  );
}

export default App;
