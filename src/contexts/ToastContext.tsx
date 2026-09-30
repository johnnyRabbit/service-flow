import { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-in slide-in-from-right ${
              toast.type === 'success' ? 'bg-green-50 border-green-200' :
              toast.type === 'error' ? 'bg-red-50 border-red-200' :
              toast.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                toast.type === 'success' ? 'text-green-900' :
                toast.type === 'error' ? 'text-red-900' :
                toast.type === 'warning' ? 'text-yellow-900' :
                'text-blue-900'
              }`}>{toast.title}</p>
              {toast.message && (
                <p className={`text-xs mt-0.5 ${
                  toast.type === 'success' ? 'text-green-700' :
                  toast.type === 'error' ? 'text-red-700' :
                  toast.type === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
