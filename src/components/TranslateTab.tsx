import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check, Loader2 } from 'lucide-react';
import { translateText, TranslateLang } from '../lib/gemini';

export function TranslateTab() {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [langSource, setLangSource] = useState<TranslateLang>('en');
  const [langTarget, setLangTarget] = useState<TranslateLang>('vi');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async (text: string, from: TranslateLang, to: TranslateLang) => {
    if (!text.trim()) {
      setTargetText('');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await translateText(text, from, to);
      setTargetText(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    setLangSource(langTarget);
    setLangTarget(langSource);
    setSourceText(targetText);
    setTargetText('');
    if (targetText.trim()) {
      handleTranslate(targetText, langTarget, langSource);
    }
  };

  const copyToClipboard = () => {
    if (!targetText) return;
    navigator.clipboard.writeText(targetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Language Switch */}
      <div className="flex items-center justify-between border rounded-xl overflow-hidden bg-white/50 p-1">
        <div className="flex-1 text-center font-medium text-sm text-gray-700 py-1.5">
          {langSource === 'en' ? 'Tiếng Anh' : 'Tiếng Việt'}
        </div>
        <button 
          onClick={handleSwap}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeftRight size={18} />
        </button>
        <div className="flex-1 text-center font-medium text-sm text-gray-700 py-1.5">
          {langTarget === 'en' ? 'Tiếng Anh' : 'Tiếng Việt'}
        </div>
      </div>

      {/* Input Area */}
      <div className="relative border rounded-xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
        <textarea
          value={sourceText}
          onChange={(e) => {
            setSourceText(e.target.value);
          }}
          onBlur={() => handleTranslate(sourceText, langSource, langTarget)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleTranslate(sourceText, langSource, langTarget);
            }
          }}
          placeholder="Nhập văn bản (Ctrl+Enter để dịch)..."
          className="w-full min-h-[120px] p-4 text-[15px] resize-none outline-none rounded-xl"
        />
        {error && <div className="absolute bottom-2 left-3 right-3 text-xs text-red-500 bg-red-50 p-1.5 rounded">{error}</div>}
      </div>

      {/* Output Area */}
      <div className="relative border rounded-xl bg-gray-50 flex flex-col min-h-[120px]">
        <div className="p-4 text-[15px] text-gray-800 flex-1 whitespace-pre-wrap">
          {isLoading ? (
            <div className="flex items-center justify-center py-4 text-blue-500">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : targetText ? (
            targetText
          ) : (
            <span className="text-gray-400 italic">Bản dịch...</span>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex justify-end p-2 border-t border-gray-100">
          <button
            onClick={copyToClipboard}
            disabled={!targetText}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-all"
            title="Copy"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
