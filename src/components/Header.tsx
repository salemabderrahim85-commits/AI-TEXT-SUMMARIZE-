import React from 'react';
import { Bot, Sparkles, Code2, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  onOpenPythonModal: () => void;
  serverOnline: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPythonModal, serverOnline }) => {
  return (
    <header id="app-header" className="border-b border-stone-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-stone-900 tracking-tight">AI Text Summarizer</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Collez n'importe quel texte ou article et obtenez un résumé synthétique immédiat
            </p>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center gap-3">
          {/* Server API Health Pill */}
          <div
            id="api-status-pill"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-stone-50 text-stone-700 border-stone-200"
            title="Statut du serveur de résumé IA"
          >
            {serverOnline === true ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>API Serveur Active</span>
              </>
            ) : serverOnline === false ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>API indisponible</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Connexion API...</span>
              </>
            )}
          </div>

          {/* Python Code Snippets Button */}
          <button
            id="open-python-modal-btn"
            onClick={onOpenPythonModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 hover:border-stone-400 transition active:scale-95"
          >
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Python (Flask / FastAPI)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
