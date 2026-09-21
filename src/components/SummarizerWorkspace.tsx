import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Volume2, 
  VolumeX, 
  Trash2, 
  ClipboardPaste, 
  Clock, 
  TrendingDown, 
  FileText, 
  Layers, 
  Languages, 
  SlidersHorizontal,
  Lightbulb,
  Tag,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { 
  SummaryFormat, 
  SummaryLength, 
  SummaryTone, 
  SummaryLanguage, 
  SummarizeResult 
} from '../types.ts';
import { SAMPLE_TEXTS, SampleText } from '../data/sampleTexts.ts';

export const SummarizerWorkspace: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [format, setFormat] = useState<SummaryFormat>('paragraph');
  const [length, setLength] = useState<SummaryLength>('medium');
  const [tone, setTone] = useState<SummaryTone>('neutral');
  const [language, setLanguage] = useState<SummaryLanguage>('auto');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummarizeResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Audio Speech Synthesis state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Calculate live input metrics
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;
  const estimatedReadTime = Math.max(1, Math.round(wordCount / 200));

  // Handle Audio Speech
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert("Votre navigateur ne supporte pas la synthèse vocale.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (result?.summary) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(result.summary);
      utterance.lang = language === 'en' ? 'en-US' : 'fr-FR';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        setError(null);
      }
    } catch (err) {
      console.warn("Clipboard access denied or not supported:", err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setError(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleApplySample = (sample: SampleText) => {
    setInputText(sample.text);
    setError(null);
  };

  const handleSummarize = async () => {
    if (!inputText || inputText.trim().length < 10) {
      setError("Veuillez coller ou écrire un texte d'au moins 10 caractères pour le résumer.");
      return;
    }

    setIsLoading(true);
    setError(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          format,
          length,
          tone,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la communication avec le serveur.');
      }

      setResult(data);
    } catch (err: any) {
      console.error("Summarization error:", err);
      setError(err?.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    const fullContent = `${result.title}\n\n${result.summary}\n\nPoints clés :\n${result.keyTakeaways.map(p => `• ${p}`).join('\n')}`;
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSummary = () => {
    if (!result) return;
    const markdownContent = `# ${result.title}

*Résumé généré par AI Text Summarizer (Gemini)*
*Statistiques : -${result.stats.reductionPercent}% de réduction (${result.stats.originalWords} mots → ${result.stats.summaryWords} mots)*

## Synthèse
${result.summary}

## Points clés
${result.keyTakeaways.map(p => `- ${p}`).join('\n')}

## Mots-clés
${result.keywords.join(', ')}
`;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Configuration toolbar */}
      <div id="summarizer-controls-bar" className="bg-white border border-stone-200 rounded-xl p-4 mb-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-stone-700 text-xs font-semibold uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-stone-500" />
            <span>Options de synthèse</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Format selector */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="format-select" className="text-xs text-stone-500 font-medium">Format :</label>
              <select
                id="format-select"
                value={format}
                onChange={(e) => setFormat(e.target.value as SummaryFormat)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
              >
                <option value="paragraph">Paragraphe fluide</option>
                <option value="bullets">Points clés à puces</option>
                <option value="executive">Synthèse exécutive</option>
                <option value="tldr">TL;DR Ultra-concis</option>
              </select>
            </div>

            {/* Length selector */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="length-select" className="text-xs text-stone-500 font-medium">Longueur :</label>
              <select
                id="length-select"
                value={length}
                onChange={(e) => setLength(e.target.value as SummaryLength)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
              >
                <option value="short">Court (~20%)</option>
                <option value="medium">Équilibré (~35%)</option>
                <option value="detailed">Détaillé (~50%)</option>
              </select>
            </div>

            {/* Tone selector */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="tone-select" className="text-xs text-stone-500 font-medium">Ton :</label>
              <select
                id="tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value as SummaryTone)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
              >
                <option value="neutral">Neutre & Factuel</option>
                <option value="professional">Professionnel</option>
                <option value="casual">Accessible</option>
                <option value="academic">Académique</option>
                <option value="simple">Simple (Vulgarisé)</option>
              </select>
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="language-select" className="text-xs text-stone-500 font-medium">Langue :</label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as SummaryLanguage)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
              >
                <option value="auto">Détection automatique</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Input Text Area & Actions */}
        <div id="input-section" className="bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col overflow-hidden">
          {/* Input Header */}
          <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-stone-600" />
              <h2 className="text-sm font-semibold text-stone-900">Texte source</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="paste-btn"
                onClick={handlePasteClipboard}
                type="button"
                className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-md transition"
                title="Coller depuis le presse-papier"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Coller</span>
              </button>

              {inputText.length > 0 && (
                <button
                  id="clear-btn"
                  onClick={handleClear}
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md transition"
                  title="Effacer le texte"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Effacer</span>
                </button>
              )}
            </div>
          </div>

          {/* Sample quick selectors */}
          <div className="px-5 py-2.5 bg-stone-50/30 border-b border-stone-100 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-stone-500 shrink-0 font-medium">Exemples :</span>
            {SAMPLE_TEXTS.map((sample) => (
              <button
                key={sample.id}
                id={`sample-btn-${sample.id}`}
                onClick={() => handleApplySample(sample)}
                className="shrink-0 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition text-xs font-medium"
              >
                {sample.title}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <div className="p-4 flex-1">
            <textarea
              id="source-text-input"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (error) setError(null);
              }}
              rows={14}
              placeholder="Collez ou tapez votre texte ici (articles, comptes-rendus, cours, synthèses, documentation)..."
              className="w-full text-sm text-stone-900 placeholder:text-stone-400 bg-transparent resize-y focus:outline-hidden leading-relaxed font-sans"
            />
          </div>

          {/* Error notice if present */}
          {error && (
            <div id="error-banner" className="mx-4 mb-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Input Footer & Submit Button */}
          <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span id="word-count-badge">
                <strong className="text-stone-800">{wordCount}</strong> mots
              </span>
              <span>•</span>
              <span id="char-count-badge">
                <strong className="text-stone-800">{charCount}</strong> caractères
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ~{estimatedReadTime} min de lecture
              </span>
            </div>

            <button
              id="submit-summarize-btn"
              onClick={handleSummarize}
              disabled={isLoading || wordCount === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition active:scale-95 ${
                isLoading || wordCount === 0
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-stone-900 hover:bg-stone-800 text-white cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Génération du résumé...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Résumer avec l'IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Output Summary View */}
        <div id="output-section" className="bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col overflow-hidden min-h-[500px]">
          {/* Result Header */}
          <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-stone-900">Résumé généré</h2>
            </div>

            {result && (
              <div className="flex items-center gap-1.5">
                {/* Audio speech button */}
                <button
                  id="tts-audio-btn"
                  onClick={toggleSpeech}
                  type="button"
                  className={`p-1.5 rounded-md transition ${
                    isSpeaking 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : 'text-stone-600 hover:bg-stone-200'
                  }`}
                  title={isSpeaking ? "Arrêter la lecture audio" : "Écouter le résumé"}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-800" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Copy button */}
                <button
                  id="copy-summary-btn"
                  onClick={handleCopySummary}
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-md transition"
                  title="Copier le résumé"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>

                {/* Download Markdown */}
                <button
                  id="download-summary-btn"
                  onClick={handleDownloadSummary}
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-md transition"
                  title="Exporter au format Markdown (.md)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter</span>
                </button>
              </div>
            )}
          </div>

          {/* Results Area */}
          <div className="p-6 flex-1 flex flex-col justify-start">
            {isLoading ? (
              /* Loading Shimmer State */
              <div id="loading-state" className="space-y-5 animate-pulse py-4">
                <div className="h-6 bg-stone-200 rounded-md w-3/4"></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-12 bg-stone-100 rounded-lg"></div>
                  <div className="h-12 bg-stone-100 rounded-lg"></div>
                  <div className="h-12 bg-stone-100 rounded-lg"></div>
                </div>
                <div className="space-y-3 pt-3">
                  <div className="h-4 bg-stone-100 rounded-sm w-full"></div>
                  <div className="h-4 bg-stone-100 rounded-sm w-5/6"></div>
                  <div className="h-4 bg-stone-100 rounded-sm w-4/6"></div>
                  <div className="h-4 bg-stone-100 rounded-sm w-full"></div>
                </div>
                <div className="pt-4 border-t border-stone-100 space-y-2">
                  <div className="h-4 bg-stone-200 rounded-sm w-1/3"></div>
                  <div className="h-3 bg-stone-100 rounded-sm w-4/5"></div>
                  <div className="h-3 bg-stone-100 rounded-sm w-3/4"></div>
                </div>
              </div>
            ) : result ? (
              /* Populated Results State */
              <div id="summary-result-content" className="space-y-6">
                {/* Reduction metrics pill bar */}
                <div id="reduction-stats-card" className="grid grid-cols-3 gap-3 bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-base">
                      <TrendingDown className="w-4 h-4" />
                      <span>-{result.stats.reductionPercent}%</span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium">Réduction</div>
                  </div>

                  <div className="border-x border-stone-200 px-2">
                    <div className="font-bold text-stone-800 text-base">
                      {result.stats.summaryWords} <span className="text-xs font-normal text-stone-500">/ {result.stats.originalWords}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium">Mots conservés</div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-1 text-amber-700 font-bold text-base">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>{Math.round(result.stats.timeSavedSeconds / 60)} min</span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium">Temps gagné</div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 id="summary-title" className="text-lg font-bold text-stone-900 tracking-tight leading-snug">
                    {result.title}
                  </h3>
                </div>

                {/* Key Takeaways Section */}
                {result.keyTakeaways && result.keyTakeaways.length > 0 && (
                  <div id="key-takeaways-block" className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2.5 text-amber-900 text-xs font-bold uppercase tracking-wider">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Points clés essentiels</span>
                    </div>
                    <ul className="space-y-2">
                      {result.keyTakeaways.map((point, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-xs text-stone-800 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-900 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Main Summary Text Body */}
                <div id="summary-text-body" className="prose prose-stone max-w-none text-stone-800 text-sm leading-relaxed whitespace-pre-line font-sans border-t border-stone-100 pt-4">
                  {result.summary}
                </div>

                {/* Keywords Tags */}
                {result.keywords && result.keywords.length > 0 && (
                  <div id="summary-keywords-block" className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-stone-100">
                    <Tag className="w-3.5 h-3.5 text-stone-400 mr-1" />
                    {result.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 bg-stone-100 text-stone-600 rounded-md text-xs font-medium border border-stone-200"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Empty Placeholder State */
              <div id="empty-state" className="h-full flex flex-col items-center justify-center text-center p-8 my-auto text-stone-400">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mb-4 border border-stone-200">
                  <Sparkles className="w-7 h-7 text-stone-400" />
                </div>
                <h3 className="text-sm font-semibold text-stone-700 mb-1">Prêt pour votre synthèse</h3>
                <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                  Collez votre texte dans l'espace de gauche ou cliquez sur un exemple, puis lancez le résumé pour voir la synthèse générée.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
