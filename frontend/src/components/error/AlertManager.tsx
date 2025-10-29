import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, RefreshCw, Info, CheckCircle, XCircle } from 'lucide-react';

export type AlertType = 'error' | 'warning' | 'info' | 'success';

interface AlertState {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AlertManagerProps {
  alerts: AlertState[];
  onDismiss: (id: string) => void;
}

const alertIcons = {
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

const alertVariants = {
  error: 'destructive',
  warning: 'default',
  info: 'default',
  success: 'default',
} as const;

export function AlertManager({ alerts, onDismiss }: AlertManagerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map((alert) => {
        const Icon = alertIcons[alert.type];
        const variant = alertVariants[alert.type];
        
        return (
          <Alert key={alert.id} variant={variant} className="shadow-lg">
            <Icon className="h-4 w-4" />
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription className="mt-1">
              {alert.message}
            </AlertDescription>
            <div className="flex items-center justify-between mt-3">
              {alert.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={alert.action.onClick}
                  className="text-xs"
                >
                  {alert.action.label}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(alert.id)}
                className="ml-auto p-1 h-auto"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </Alert>
        );
      })}
    </div>
  );
}

// Hook for managing alerts
export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertState[]>([]);

  const addAlert = (alert: Omit<AlertState, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAlert = { ...alert, id };
    
    setAlerts(prev => [...prev, newAlert]);

    // Auto-dismiss after duration
    if (alert.duration !== 0) {
      const duration = alert.duration || 5000;
      setTimeout(() => {
        dismissAlert(id);
      }, duration);
    }

    return id;
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAll = () => {
    setAlerts([]);
  };

  // Convenience methods
  const showError = (title: string, message: string, action?: AlertState['action']) => {
    return addAlert({ type: 'error', title, message, action });
  };

  const showWarning = (title: string, message: string, action?: AlertState['action']) => {
    return addAlert({ type: 'warning', title, message, action });
  };

  const showInfo = (title: string, message: string, action?: AlertState['action']) => {
    return addAlert({ type: 'info', title, message, action });
  };

  const showSuccess = (title: string, message: string, action?: AlertState['action']) => {
    return addAlert({ type: 'success', title, message, action });
  };

  return {
    alerts,
    addAlert,
    dismissAlert,
    clearAll,
    showError,
    showWarning,
    showInfo,
    showSuccess,
  };
}

// Global alert context
interface AlertContextType {
  showError: (title: string, message: string, action?: AlertState['action']) => string;
  showWarning: (title: string, message: string, action?: AlertState['action']) => string;
  showInfo: (title: string, message: string, action?: AlertState['action']) => string;
  showSuccess: (title: string, message: string, action?: AlertState['action']) => string;
}

export const AlertContext = React.createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const alertManager = useAlerts();

  return (
    <AlertContext.Provider value={alertManager}>
      {children}
      <AlertManager alerts={alertManager.alerts} onDismiss={alertManager.dismissAlert} />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
