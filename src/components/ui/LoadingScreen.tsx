'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LoadingScreen({ message }: { message?: string }) {
  const { t } = useLanguage();
  const loadingText = message || t('loading_dashboard');

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full animate-fade-in py-20">
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer Ring */}
        <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
        {/* Spinning Gradient Ring */}
        <div className="absolute w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        {/* Pulsing Center Dot */}
        <div className="absolute w-3 h-3 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
        
        {/* Decorative Floating Blobs */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full animate-bounce opacity-40"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-indigo-400 rounded-full animate-bounce delay-300 opacity-40"></div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-xl font-black text-slate-800 tracking-tight animate-pulse">
          {loadingText}
        </h3>
        <p className="text-slate-400 font-bold text-sm">فضلاً انتظر لحظة...</p>
      </div>
      
      {/* Progress Line Decoration */}
      <div className="mt-8 w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full w-2/3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-progress-loop"></div>
      </div>
    </div>
  );
}
