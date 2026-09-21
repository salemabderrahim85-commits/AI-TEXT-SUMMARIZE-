import { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { SummarizerWorkspace } from './components/SummarizerWorkspace.tsx';
import { PythonCodeModal } from './components/PythonCodeModal.tsx';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [pythonModalOpen, setPythonModalOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Health check on server
    const checkServer = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setServerOnline(true);
        } else {
          setServerOnline(false);
        }
      } catch (e) {
        setServerOnline(false);
      }
    };
    checkServer();
  }, []);

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      <Header
        onOpenPythonModal={() => setPythonModalOpen(true)}
        serverOnline={serverOnline}
      />

      <main className="flex-1">
        <SummarizerWorkspace />
      </main>

      <footer className="border-t border-stone-200 bg-white/70 py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Traitement sécurisé et privé • Modèle Gemini 3.8 Flash • Aucune donnée conservée</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>AI Text Summarizer</span>
            <span>•</span>
            <button
              onClick={() => setPythonModalOpen(true)}
              className="hover:text-stone-700 underline underline-offset-2 transition"
            >
              Voir code Python (FastAPI / Flask)
            </button>
          </div>
        </div>
      </footer>

      {/* Python Code Modal */}
      <PythonCodeModal
        isOpen={pythonModalOpen}
        onClose={() => setPythonModalOpen(false)}
      />
    </div>
  );
}
