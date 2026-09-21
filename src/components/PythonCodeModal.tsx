import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, ExternalLink } from 'lucide-react';

interface PythonCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonCodeModal: React.FC<PythonCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'fastapi' | 'flask' | 'requirements'>('fastapi');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fastapiCode = `# main.py - FastAPI + Gemini AI Text Summarizer
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import os
from google import genai
from google.genai import types

app = FastAPI(title="AI Text Summarizer API", version="1.0.0")

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Source text to summarize")
    format: Optional[str] = "paragraph"  # paragraph, bullets, executive, tldr
    length: Optional[str] = "medium"      # short, medium, detailed
    tone: Optional[str] = "neutral"       # neutral, professional, casual, academic, simple
    language: Optional[str] = "auto"      # auto, fr, en, es, de, ar

class SummaryResponse(BaseModel):
    title: str
    summary: str
    key_takeaways: List[str]
    keywords: List[str]
    original_words: int
    summary_words: int
    reduction_percentage: float

@app.post("/api/summarize", response_model=SummaryResponse)
async def summarize_text(req: SummarizeRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY non configurée.")

    system_instruction = (
        f"You are an expert AI Text Summarizer. "
        f"Format: {req.format}, Length: {req.length}, Tone: {req.tone}, Language: {req.language}. "
        f"Always provide an accurate, high-fidelity synthesis without hallucination."
    )

    prompt = f"Summarize the following text:\\n\\n{req.text}"

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema={
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "summary": {"type": "string"},
                    "key_takeaways": {"type": "array", "items": {"type": "string"}},
                    "keywords": {"type": "array", "items": {"type": "string"}}
                },
                "required": ["title", "summary", "key_takeaways", "keywords"]
            }
        )
    )

    import json
    data = json.loads(response.text)
    
    orig_words = len(req.text.split())
    summ_words = len(data["summary"].split())
    reduction = round(((orig_words - summ_words) / orig_words) * 100, 1) if orig_words > 0 else 0

    return SummaryResponse(
        title=data["title"],
        summary=data["summary"],
        key_takeaways=data.get("key_takeaways", []),
        keywords=data.get("keywords", []),
        original_words=orig_words,
        summary_words=summ_words,
        reduction_percentage=max(0.0, reduction)
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
`;

  const flaskCode = `# app.py - Flask + Gemini AI Text Summarizer
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from google import genai
from google.genai import types

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

@app.route("/api/summarize", methods=["POST"])
def summarize():
    data = request.get_json() or {}
    text = data.get("text", "")
    
    if len(text.strip()) < 10:
        return jsonify({"error": "Le texte doit contenir au moins 10 caractères."}), 400

    format_style = data.get("format", "paragraph")
    length = data.get("length", "medium")
    tone = data.get("tone", "neutral")
    language = data.get("language", "auto")

    system_prompt = (
        f"Tu es un assistant IA spécialisé dans le résumé de texte précis et fidèle. "
        f"Style: {format_style}, Longueur: {length}, Ton: {tone}, Langue: {language}."
    )

    try:
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=text,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema={
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "summary": {"type": "string"},
                        "key_takeaways": {"type": "array", "items": {"type": "string"}},
                        "keywords": {"type": "array", "items": {"type": "string"}}
                    },
                    "required": ["title", "summary", "key_takeaways", "keywords"]
                }
            )
        )
        res_data = json.loads(response.text)
        
        orig_words = len(text.split())
        summ_words = len(res_data["summary"].split())
        reduction = round(((orig_words - summ_words) / orig_words) * 100, 1) if orig_words > 0 else 0

        res_data["stats"] = {
            "original_words": orig_words,
            "summary_words": summ_words,
            "reduction_percentage": max(0.0, reduction)
        }
        return jsonify(res_data)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
`;

  const requirementsTxt = `# requirements.txt
fastapi>=0.110.0
uvicorn>=0.28.0
flask>=3.0.0
flask-cors>=4.0.0
google-genai>=0.1.0
pydantic>=2.6.0
python-dotenv>=1.0.0
`;

  const activeContent = activeTab === 'fastapi' ? fastapiCode : activeTab === 'flask' ? flaskCode : requirementsTxt;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="python-code-modal-backdrop" className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div id="python-code-modal" className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-base">Implémentation Python (Flask / FastAPI)</h3>
              <p className="text-xs text-stone-500">Code prêt à l'emploi avec le SDK officiel Google GenAI</p>
            </div>
          </div>
          <button
            id="close-python-modal-btn"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-stone-100/70 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <button
              id="tab-fastapi"
              onClick={() => setActiveTab('fastapi')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                activeTab === 'fastapi'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ⚡ FastAPI (Recommandé)
            </button>
            <button
              id="tab-flask"
              onClick={() => setActiveTab('flask')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                activeTab === 'flask'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🌶️ Flask
            </button>
            <button
              id="tab-requirements"
              onClick={() => setActiveTab('requirements')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                activeTab === 'requirements'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              📦 requirements.txt
            </button>
          </div>

          <button
            id="copy-python-code-btn"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition active:scale-95 shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copier le code
              </>
            )}
          </button>
        </div>

        {/* Code Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-950 font-mono text-xs text-stone-200 leading-relaxed">
          <pre className="whitespace-pre overflow-x-auto selection:bg-stone-700">
            <code>{activeContent}</code>
          </pre>
        </div>

        {/* Modal Footer Quick Instructions */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-stone-500" />
            <span>Exécution locale : <code className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-800 font-mono">export GEMINI_API_KEY="votre_clé" && python main.py</code></span>
          </div>
          <button
            id="modal-close-action-btn"
            onClick={onClose}
            className="text-stone-600 hover:text-stone-900 font-medium px-3 py-1 rounded hover:bg-stone-200 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
