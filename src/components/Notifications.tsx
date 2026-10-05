import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useNotificationStore } from '../stores/notificationStore';

export function Notifications() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification: any) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
  };
  onRemove: () => void;
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const { type, title, message } = notification;

  // Auto-remove after duration
  useEffect(() => {
    const timer = setTimeout(onRemove, 5000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  }[type];

  const textColor = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900',
  }[type];

  const iconColor = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  }[type];

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${bgColor} animate-slide-in`}
    >
      <div className={`flex-shrink-0 text-lg ${iconColor}`}>{icons}</div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${textColor}`}>{title}</p>
        {message && <p className={`text-sm mt-1 ${textColor} opacity-80`}>{message}</p>}
      </div>
      <button
        onClick={onRemove}
        className={`flex-shrink-0 ${textColor} opacity-60 hover:opacity-100 transition-opacity`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
