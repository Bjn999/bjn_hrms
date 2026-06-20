'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmOptions {
  title: string;
  description: string;
  icon?: 'warning' | 'danger' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setDialog(options);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleClose = (value: boolean) => {
    if (resolver) resolver(value);
    setDialog(null);
    setResolver(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && createPortal(
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in relative">
            <div className={`h-2 w-full ${
              dialog.icon === 'danger' ? 'bg-rose-500' :
              dialog.icon === 'warning' ? 'bg-amber-500' :
              dialog.icon === 'success' ? 'bg-emerald-500' :
              'bg-indigo-500'
            }`}></div>
            <div className="p-8 text-center">
              <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                dialog.icon === 'danger' ? 'bg-rose-100 text-rose-600' :
                dialog.icon === 'warning' ? 'bg-amber-100 text-amber-600' :
                dialog.icon === 'success' ? 'bg-emerald-100 text-emerald-600' :
                'bg-indigo-100 text-indigo-600'
              }`}>
                {dialog.icon === 'danger' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                {dialog.icon === 'warning' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                {dialog.icon === 'success' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                {dialog.icon === 'info' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">{dialog.title}</h3>
              <p className="text-slate-600 font-bold mb-8 leading-relaxed">{dialog.description}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleClose(true)}
                  className={`flex-1 py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 ${
                    dialog.icon === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' :
                    dialog.icon === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' :
                    dialog.icon === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' :
                    'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  {dialog.confirmText || 'نعم، استمر'}
                </button>
                <button 
                  onClick={() => handleClose(false)}
                  className="flex-1 py-4 rounded-2xl font-black text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 border-2 border-slate-200"
                >
                  {dialog.cancelText || 'إلغاء'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
};
