import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Save, Settings2 } from 'lucide-react';

export function SettingsTab() {
  const [keysInput, setKeysInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    storage.get('api_keys').then(keys => {
      if (keys) {
        setKeysInput(keys);
      }
    });
  }, []);

  const handleSave = async () => {
    await storage.set('api_keys', keysInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-4 pt-2">
      <div className="flex items-center space-x-2 text-gray-800 mb-2">
        <Settings2 size={20} className="text-blue-500" />
        <h2 className="font-semibold text-lg hover:text-blue-600 transition-colors">Thiết lập hệ thống</h2>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gemini API Keys
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Nhập API Key của Google Gemini. Có thể nhập nhiều key để chống rate limit, ngăn cách nhau bằng dấu phẩy (,) hoặc xuống dòng.
        </p>
        <textarea
          value={keysInput}
          onChange={(e) => setKeysInput(e.target.value)}
          placeholder="Nhập API key tại đây..."
          className="w-full min-h-[120px] p-3 text-sm font-mono border rounded-lg bg-white resize-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            {isSaved ? <span className="flex items-center gap-1"><Save size={16} /> Đã lưu</span> : <span className="flex items-center gap-1"><Save size={16} /> Lưu cài đặt</span>}
          </button>
        </div>
      </div>
      
      <div className="p-4 border rounded-xl bg-orange-50/50 border-orange-100">
        <h3 className="text-sm font-semibold text-orange-800 mb-1">Cách dùng "Replace with AI"</h3>
        <p className="text-xs text-orange-700/80 leading-relaxed">
          Bôi đen một đoạn text tiếng Việt trong bất kỳ input hoặc textarea nào trên web, một nút "AI" nhỏ sẽ hiện ra. Bấm vào Nút đó để tự động dịch và thay thế bằng tiếng Anh tự nhiên!
        </p>
      </div>
    </div>
  );
}
