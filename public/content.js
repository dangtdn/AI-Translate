(function() {
  if (window._aiTranslateInjected) return;
  window._aiTranslateInjected = true;

  // Create UI Elements
  const btn = document.createElement('div');
  btn.id = 'ai-translate-extension-btn';
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`;
  document.body.appendChild(btn);

  const popup = document.createElement('div');
  popup.id = 'ai-translate-extension-popup';
  popup.innerHTML = `
    <div class="header">AI Dịch sang Tiếng Anh</div>
    <div class="content" id="ai-translate-content"></div>
    <div class="actions">
      <button class="btn-cancel" id="ai-translate-cancel">Hủy</button>
      <button class="btn-apply" id="ai-translate-apply">Thay thế</button>
    </div>
  `;
  document.body.appendChild(popup);

  let activeTarget = null;
  let activeSelectionText = '';
  let activeSelectionStart = 0;
  let activeSelectionEnd = 0;
  let activeRange = null;

  // Handle selection detection
  document.addEventListener('mouseup', (e) => {
    // Ignore clicks inside our UI
    if (btn.contains(e.target) || popup.contains(e.target)) return;
    
    // Hide popup
    popup.classList.remove('show');
    
    setTimeout(() => {
      const target = e.target;
      let text = '';
      let rect = null;

      // Extract selection based on target type
      if (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && ['text', 'search'].includes(target.type))) {
        text = target.value.substring(target.selectionStart, target.selectionEnd);
        if (text.trim()) {
          activeTarget = target;
          activeSelectionStart = target.selectionStart;
          activeSelectionEnd = target.selectionEnd;
          
          // Approximate rect (simple version)
          const taRect = target.getBoundingClientRect();
          rect = { top: taRect.top + 20, left: taRect.left + 20, width: 0 };
        }
      } else if (target.isContentEditable || document.activeElement.isContentEditable) {
        const selection = window.getSelection();
        text = selection.toString();
        if (text.trim() && selection.rangeCount > 0) {
          activeTarget = target.isContentEditable ? target : document.activeElement;
          activeRange = selection.getRangeAt(0).cloneRange();
          rect = activeRange.getBoundingClientRect();
        }
      }

      if (text.trim()) {
        activeSelectionText = text;
        const top = rect.top + window.scrollY - 40;
        const left = rect.left + window.scrollX + (rect.width / 2) - 16;
        btn.style.top = Math.max(10, top) + 'px';
        btn.style.left = Math.max(10, left) + 'px';
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
      }
    }, 10);
  });

  // Handle click outside to close
  document.addEventListener('mousedown', (e) => {
    if (!btn.contains(e.target) && !popup.contains(e.target)) {
      btn.classList.remove('show');
    }
  });

  // Handle button click -> Translate
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    btn.classList.remove('show');
    
    const contentEl = document.getElementById('ai-translate-content');
    contentEl.innerHTML = '<div class="loading"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div>';
    
    const btnRect = btn.getBoundingClientRect();
    popup.style.top = (btnRect.top + window.scrollY) + 'px';
    popup.style.left = (btnRect.left + window.scrollX) + 'px';
    popup.classList.add('show');

    try {
      let translated = '';
      
      // Support Chrome Extension or Web Preview fallback
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        const res = await new Promise(resolve => {
          chrome.runtime.sendMessage({ action: "translate_text", text: activeSelectionText }, resolve);
        });
        if (res.error) throw new Error(res.error);
        translated = res.translated;
      } else {
        // Fallback for AI Studio Web Preview
        const keysStr = localStorage.getItem('api_keys');
        if (!keysStr) throw new Error('Vui lòng vào tab Cài đặt nhập API Key.');
        const keys = keysStr.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);
        const key = keys[0];
        
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" + key, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Translate the following Vietnamese text into natural, native-sounding English. Ensure the tone is appropriate for general input/communication. Return ONLY the translated English text, without markdown, quotes, or explanations.\\n\\nText: " + activeSelectionText }] }]
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Lỗi API");
        translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      }

      contentEl.innerHTML = translated.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      
      // Save data for Apply button
      document.getElementById('ai-translate-apply').dataset.result = translated;
      
    } catch (err) {
      contentEl.innerHTML = '<div style="color: #ef4444; font-size: 13px;">' + err.message + '</div>';
    }
  });

  document.getElementById('ai-translate-cancel').addEventListener('click', () => {
    popup.classList.remove('show');
  });

  document.getElementById('ai-translate-apply').addEventListener('click', (e) => {
    const newText = e.target.dataset.result;
    if (!newText || !activeTarget) return;

    if (activeTarget.tagName === 'TEXTAREA' || activeTarget.tagName === 'INPUT') {
      activeTarget.setRangeText(newText, activeSelectionStart, activeSelectionEnd, 'end');
      activeTarget.dispatchEvent(new Event('input', { bubbles: true })); // Trigger React/app bindings
    } else if (activeTarget.isContentEditable) {
      if (activeRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(activeRange);
        document.execCommand('insertText', false, newText);
      }
    }

    popup.classList.remove('show');
  });

})();
