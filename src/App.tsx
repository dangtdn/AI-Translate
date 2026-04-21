import React, { useState, useEffect } from 'react';
import { TranslateTab } from './components/TranslateTab';
import { GrammarTab } from './components/GrammarTab';
import { SettingsTab } from './components/SettingsTab';
import { Languages, Wand2, Settings2, Sparkles } from 'lucide-react';
import { storage } from './lib/storage';

type Tab = 'translate' | 'grammar' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('translate');
  const [isExtension, setIsExtension] = useState(true);

  useEffect(() => {
    // Detect if running as a chrome extension popup
    const isChromeExt = typeof chrome !== 'undefined' && chrome.extension;
    setIsExtension(!!isChromeExt);
    
    // Default API keys seed for preview
    if (!isChromeExt && process.env.GEMINI_API_KEY) {
      storage.get('api_keys').then(keys => {
        if (!keys) {
          storage.set('api_keys', process.env.GEMINI_API_KEY);
        }
      });
    }
  }, []);

  const PopupContent = () => (
    <div className="w-[400px] h-[600px] bg-white flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
      {/* Header */}
      <header className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-inner">
          <Sparkles className="text-white" size={16} />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          AI Translate
        </h1>
      </header>

      {/* Navigation */}
      <nav className="flex items-center px-4 pt-3 border-b border-gray-100 bg-gray-50/50">
        {[
          { id: 'translate', label: 'Dịch', icon: <Languages size={16} /> },
          { id: 'grammar', label: 'Hoàn thiện', icon: <Wand2 size={16} /> },
          { id: 'settings', label: 'Cài đặt', icon: <Settings2 size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex-1 flex flex-col items-center gap-1.5 pb-3 pt-1 border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.icon}
            <span className="text-[11px] font-semibold uppercase tracking-wide">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
        {activeTab === 'translate' && <TranslateTab />}
        {activeTab === 'grammar' && <GrammarTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );

  if (isExtension) {
    return <PopupContent />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left side: Fake Web Page to test content script */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-y-auto w-full">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Web Component Test Playground</h2>
          <p className="text-gray-600 mb-6">
            Kiểm tra tính năng <strong>"Biến đổi đoạn text tiếng Việt thành tiếng Anh"</strong>.
            Bôi đen đoạn văn bản tiếng Việt trong ô dưới đây, nhấn vào nút AI nổi để dịch.
          </p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Textarea Tester</label>
              <textarea 
                className="w-full h-32 p-4 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                defaultValue="Chào bạn, mình mới làm xong tính năng này. Bạn thấy tốc độ xử lý như thế nào?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Input Text Tester</label>
              <input 
                type="text"
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                defaultValue="Dự án sắp tới có yêu cầu khá cao về thời gian."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ContentEditable Tester</label>
              <div 
                contentEditable 
                className="w-full p-4 min-h-[100px] border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              >
                Cảm ơn mọi người đã theo dõi bài viết này.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Extension Popup App */}
      <div className="w-[450px] bg-gray-200 border-l flex items-center justify-center flex-col shrink-0 relative overflow-hidden">
        <div className="absolute top-4 font-mono text-xs text-gray-400 font-bold tracking-widest uppercase mb-4">Extension Preview</div>
        <PopupContent />
      </div>
    </div>
  );
}
