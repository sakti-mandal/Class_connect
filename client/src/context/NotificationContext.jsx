import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Assignment Graded',
      message: 'Dr. Sarah Chen graded your Assignment 4 (96/100).',
      time: '10 mins ago',
      read: false,
      type: 'success',
      link: '/assignments',
    },
    {
      id: 'notif-2',
      title: 'New Class Discussion',
      message: 'Dr. Sarah Chen answered your question on Multi-Head Attention.',
      time: '1 hour ago',
      read: false,
      type: 'info',
      link: '/community',
    },
    {
      id: 'notif-3',
      title: 'Deadline Reminder',
      message: 'Lab 5: Distributed Raft Consensus is due in 3 days.',
      time: '3 hours ago',
      read: true,
      type: 'warning',
      link: '/assignments',
    },
  ]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = id => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotification = id => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        notifications,
        unreadCount,
        markAllRead,
        markAsRead,
        clearNotification,
      }}
    >
      {children}

      {/* Floating Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => {
          let bg = 'bg-slate-900 text-white dark:bg-slate-800 border-slate-700';
          let IconComponent = Info;
          let iconColor = 'text-brand-400';

          if (toast.type === 'success') {
            bg = 'bg-emerald-900/90 text-white border-emerald-700 backdrop-blur-md';
            IconComponent = CheckCircle2;
            iconColor = 'text-emerald-400';
          } else if (toast.type === 'error') {
            bg = 'bg-rose-900/90 text-white border-rose-700 backdrop-blur-md';
            IconComponent = AlertCircle;
            iconColor = 'text-rose-400';
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-900/90 text-white border-amber-700 backdrop-blur-md';
            IconComponent = AlertTriangle;
            iconColor = 'text-amber-400';
          } else {
            bg = 'bg-brand-950/90 text-white border-brand-800 backdrop-blur-md';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300 animate-slide-in ${bg}`}
            >
              <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}

