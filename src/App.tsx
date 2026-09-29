import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Inbox } from './pages/Inbox';
import { ConversationDetail } from './pages/ConversationDetail';
import { Requests } from './pages/Requests';
import { Services } from './pages/Services';
import { Appointments } from './pages/Appointments';
import { Automations } from './pages/Automations';
import { Settings } from './pages/Settings';
import { AuditLogs } from './pages/AuditLogs';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  if (!isAuthenticated) {
    return <LandingPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="inbox/:conversationId" element={<ConversationDetail />} />
          <Route path="requests" element={<Requests />} />
          <Route path="services" element={<Services />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="automations" element={<Automations />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/landing" element={<LandingPage onLogin={() => setIsAuthenticated(true)} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
