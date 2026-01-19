import React, { useState } from 'react';
import { Bot, Sparkles, Sliders, Save, RotateCcw } from 'lucide-react';
import { DEFAULT_AI_CONFIG } from '../constants';

const AIConfig: React.FC = () => {
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_AI_CONFIG.systemPrompt);
  const [temperature, setTemperature] = useState(DEFAULT_AI_CONFIG.temperature);
  const [model, setModel] = useState(DEFAULT_AI_CONFIG.model);

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-2 tracking-tight">
             <Bot className="text-ai" /> Configuração da IA
          </h1>
          <p className="text-text-muted">Defina a personalidade e as regras de negócio do agente virtual.</p>
        </div>
        <button className="text-sm text-text-muted hover:text-primary flex items-center gap-1 transition-colors">
          <RotateCcw size={14} /> Resetar Padrões
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prompt Editor */}
        <div className="lg:col-span-2 space-y-4">
           <div className="bg-surface rounded-xl border border-border flex flex-col h-[600px] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
                 <h2 className="font-bold text-text flex items-center gap-2 text-sm">
                   <Sparkles size={16} className="text-yellow-500" /> SYSTEM PROMPT
                 </h2>
                 <span className="text-[10px] bg-background border border-border px-2 py-1 rounded text-text-muted font-mono">Tokens: ~145</span>
              </div>
              <textarea 
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="flex-1 bg-background p-5 text-sm font-mono text-text outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
              <div className="p-4 border-t border-border bg-surface/50">
                <button className="w-full py-2.5 bg-ai hover:bg-violet-600 text-white font-bold rounded-lg shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95">
                   <Save size={18} /> Salvar Prompt
                </button>
              </div>
           </div>
        </div>

        {/* Right Column: Parameters */}
        <div className="space-y-6">
           {/* Model Selection */}
           <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
              <h3 className="font-bold text-text mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                <Bot size={16} className="text-text-muted" /> Modelo LLM
              </h3>
              <div className="space-y-3">
                 <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-surface-hover transition-colors group">
                    <input type="radio" name="model" checked={model === 'gemini-3-flash-preview'} onChange={() => setModel('gemini-3-flash-preview')} className="text-ai focus:ring-ai bg-background border-text-muted" />
                    <div>
                       <span className="block text-sm font-bold text-text group-hover:text-primary transition-colors">Gemini 3 Flash</span>
                       <span className="block text-xs text-text-muted">Rápido, ideal para chat em tempo real.</span>
                    </div>
                 </label>
                 <label className="flex items-center gap-3 p-3 rounded-lg border border-primary/50 bg-primary/5 cursor-pointer ring-1 ring-primary/20">
                    <input type="radio" name="model" checked={model === 'gemini-3-pro-preview'} onChange={() => setModel('gemini-3-pro-preview')} className="text-ai focus:ring-ai bg-background border-text-muted" />
                    <div>
                       <span className="block text-sm font-bold text-text">Gemini 3 Pro</span>
                       <span className="block text-xs text-text-muted">Maior raciocínio, ideal para negociações.</span>
                    </div>
                 </label>
              </div>
           </div>

           {/* Temperature */}
           <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
              <h3 className="font-bold text-text mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                <Sliders size={16} className="text-text-muted" /> Criatividade
              </h3>
              <div className="mb-6">
                 <div className="flex justify-between mb-2">
                    <span className="text-xs text-text-muted">Preciso (0.0)</span>
                    <span className="text-sm font-bold text-ai">{temperature}</span>
                    <span className="text-xs text-text-muted">Criativo (1.0)</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" 
                   max="1" 
                   step="0.1" 
                   value={temperature}
                   onChange={(e) => setTemperature(parseFloat(e.target.value))}
                   className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-ai border border-border"
                 />
                 <p className="mt-3 text-xs text-text-muted leading-tight border-l-2 border-ai pl-2">
                    Valores mais baixos tornam a IA mais determinística e focada em dados. Valores altos permitem conversas mais naturais.
                 </p>
              </div>
           </div>

           {/* Guidelines */}
           <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
               <h3 className="font-bold text-text mb-3 text-sm uppercase tracking-wide">Diretrizes de Segurança</h3>
               <ul className="space-y-3 text-xs text-text-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold bg-green-500/10 rounded-full w-4 h-4 flex items-center justify-center">✓</span>
                    <span>Nunca solicitar senhas bancárias.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold bg-green-500/10 rounded-full w-4 h-4 flex items-center justify-center">✓</span>
                    <span>Confirmar identidade antes de passar valores.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold bg-green-500/10 rounded-full w-4 h-4 flex items-center justify-center">✓</span>
                    <span>Transferir para humano em caso de conflito.</span>
                  </li>
               </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIConfig;