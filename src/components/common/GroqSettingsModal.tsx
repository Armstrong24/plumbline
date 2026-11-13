import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';
import { Modal } from './Modal';
import { groqService } from '../../services/ai/groqService';
import { GroqConfig } from '../../types';

interface GroqSettingsModalProps { isOpen: boolean; onClose: () => void; onSaved?: () => void; }

export const GroqSettingsModal: React.FC<GroqSettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [config, setConfig] = useState<GroqConfig>(groqService.getConfig());
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setResult(null);
    groqService.getConfigAsync().then(setConfig);
  }, [isOpen]);

  const test = async () => {
    setTesting(true);
    const outcome = await groqService.testConnection();
    setResult(outcome);
    setConfig(await groqService.getConfigAsync());
    setTesting(false);
    onSaved?.();
  };

  return <Modal isOpen={isOpen} onClose={onClose} title="Groq AI configuration" subtitle="The API key stays on the backend and is never sent to the browser." maxWidth="lg">
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
        <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
        <div><strong>Configure Groq on the server</strong><p className="mt-1">Open <code>backend/.env</code> and set <code>GROQ_API_KEY</code> and <code>GROQ_MODEL</code>, then restart the backend.</p></div>
      </div>
      <div className="rounded-xl border border-stone-200 p-4 text-xs space-y-2">
        <div className="flex justify-between gap-3"><span className="text-stone-500">Configuration status</span><strong className={config.isActive ? 'text-emerald-700' : 'text-amber-700'}>{config.isActive ? 'Configured' : 'Not configured'}</strong></div>
        <div className="flex justify-between gap-3"><span className="text-stone-500">Model</span><code>{config.model}</code></div>
        <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#0A4A3D] font-semibold hover:underline">Create a Groq API key <ExternalLink className="w-3 h-3" /></a>
      </div>
      {result && <div className={`p-3 rounded-xl border text-xs flex gap-2 ${result.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'}`}>{result.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}<span>{result.message}</span></div>}
      <div className="flex justify-end"><button type="button" disabled={testing} onClick={test} className="px-4 py-2 rounded-xl bg-[#0A4A3D] text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-60"><RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />{testing ? 'Testing…' : 'Test backend connection'}</button></div>
    </div>
  </Modal>;
};
