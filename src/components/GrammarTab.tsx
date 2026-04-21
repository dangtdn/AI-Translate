import React, { useState } from 'react';
import { fixAndSuggest } from '../lib/gemini';
import { Copy, Check, Loader2, Wand2, Lightbulb } from 'lucide-react';

export function GrammarTab() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ corrected: string; explanation: string; alternatives: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAlternativeText, setCopiedAlternativeText] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleFix = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fixAndSuggest(text);
      setResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result?.corrected) return;
    navigator.clipboard.writeText(result.corrected);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAlternative = (alt: string) => {
    navigator.clipboard.writeText(alt);
    setCopiedAlternativeText(alt);
    setTimeout(() => setCopiedAlternativeText(null), 2000);
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="relative border rounded-xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-400 transition-all">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập câu tiếng Anh cần sửa ngữ pháp hoặc ý tưởng/ngữ cảnh để được gợi ý..."
          className="w-full min-h-[100px] p-4 text-[15px] resize-none outline-none rounded-xl"
        />
      </div>

      <button
        onClick={handleFix}
        disabled={isLoading || !text.trim()}
        className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium text-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
        <span>Sửa lỗi & Gợi ý</span>
      </button>

      {error && <div className="text-xs text-red-500 bg-red-50 p-2 rounded">{error}</div>}

      {result && (
        <div className="mt-2 space-y-3 animate-in fade-in zoom-in-95 duration-200 pb-4">
          <div className="border border-green-100 bg-green-50/50 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between bg-green-50 px-4 py-2 border-b border-green-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-green-700">Chính/Đã sửa</span>
              <button
                onClick={copyToClipboard}
                className="p-1.5 text-green-600 hover:bg-green-100 hover:text-green-800 rounded transition-all"
                title="Copy"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <div className="p-4 text-[15px] text-gray-800 font-medium">
              {result.corrected}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Giải thích / Phân tích</div>
            {result.explanation}
          </div>

          {result.alternatives && result.alternatives.length > 0 && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
                <Lightbulb size={14} /> Gợi ý dùng thêm
              </div>
              {result.alternatives.map((alt, idx) => (
                <div 
                  key={idx} 
                  className="flex gap-3 group items-center bg-white border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all rounded-xl p-3 pl-4"
                >
                  <p className="flex-1 text-[15px] text-gray-800">{alt}</p>
                  <button
                    onClick={() => copyAlternative(alt)}
                    className="p-1.5 text-gray-400 hover:text-amber-600 bg-gray-50 hover:bg-amber-50 rounded-lg transition-all"
                    title="Copy"
                  >
                    {copiedAlternativeText === alt ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
