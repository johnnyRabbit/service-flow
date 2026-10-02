import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useState } from 'react';

export interface Alert {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  dismissed?: boolean;
}

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

export function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || alerts.length === 0) return null;

  const activeAlerts = alerts.filter(a => !a.dismissed);
  if (activeAlerts.length === 0) return null;

  const currentAlert = activeAlerts[0];

  const typeStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      message: 'text-blue-700',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      title: 'text-green-900',
      message: 'text-green-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      message: 'text-yellow-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      message: 'text-red-700',
    },
  };

  const styles = typeStyles[currentAlert.type];

  const getIcon = () => {
    switch (currentAlert.type) {
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-xl p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <div className={styles.icon}>{getIcon()}</div>
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${styles.title}`}>
            {currentAlert.title}
          </h3>
          <p className={`text-sm mt-1 ${styles.message}`}>
            {currentAlert.message}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(currentAlert.timestamp).toLocaleString('pt-PT')}
          </p>
        </div>
        <button
          onClick={() => onDismiss(currentAlert.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {activeAlerts.length > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            +{activeAlerts.length - 1} {activeAlerts.length - 1 === 1 ? 'alerta adicional' : 'alertas adicionais'}
          </p>
        </div>
      )}
    </div>
  );
}
