const VoiceEngine = (() => {
  let db = null;

  async function openDB() {
    if (db) return db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('callingo_voice', 1);
      req.onupgradeneeded = e => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains('recordings')) {
          d.createObjectStore('recordings');
        }
      };
      req.onsuccess = e => { db = e.target.result; resolve(db); };
      req.onerror = () => reject(req.error);
    });
  }

  function normalize(word) {
    return word.toLowerCase().replace(/[^a-z']/g, '');
  }

  async function saveWord(lang, word, blob) {
    const d = await openDB();
    const key = `${lang}_${normalize(word)}`;
    const buf = await blob.arrayBuffer();
    return new Promise((resolve, reject) => {
      const tx = d.transaction('recordings', 'readwrite');
      tx.objectStore('recordings').put(buf, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getWord(lang, word) {
    const d = await openDB();
    const key = `${lang}_${normalize(word)}`;
    return new Promise(resolve => {
      const tx = d.transaction('recordings', 'readonly');
      const req = tx.objectStore('recordings').get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async function hasWord(lang, word) {
    return !!(await getWord(lang, word));
  }

  async function countWords(lang) {
    const d = await openDB();
    return new Promise(resolve => {
      const tx = d.transaction('recordings', 'readonly');
      const req = tx.objectStore('recordings').getAllKeys();
      req.onsuccess = () => {
        resolve((req.result || []).filter(k => k.startsWith(lang + '_')).length);
      };
      req.onerror = () => resolve(0);
    });
  }

  async function getAllWords(lang) {
    const d = await openDB();
    return new Promise(resolve => {
      const tx = d.transaction('recordings', 'readonly');
      const req = tx.objectStore('recordings').getAllKeys();
      req.onsuccess = () => {
        const prefix = lang + '_';
        const words = new Set((req.result || [])
          .filter(k => k.startsWith(prefix))
          .map(k => k.slice(prefix.length)));
        resolve(words);
      };
      req.onerror = () => resolve(new Set());
    });
  }

  async function playBuffer(arrayBuffer) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = await ctx.decodeAudioData(arrayBuffer.slice(0));
    return new Promise(resolve => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.onended = () => { ctx.close(); resolve(); };
      src.start();
    });
  }

  function speakWordTTS(word) {
    return new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'en-GB'; u.rate = 0.88; u.pitch = 1.05;
      const v = speechSynthesis.getVoices().find(x => x.lang.startsWith('en'));
      if (v) u.voice = v;
      u.onend = resolve; u.onerror = resolve;
      speechSynthesis.speak(u);
    });
  }

  async function speakWithUserVoice(text, lang) {
    const words = text.split(/\s+/).filter(Boolean);
    const buffers = await Promise.all(words.map(w => getWord(lang, w)));
    window.isSpeaking = true;
    for (let i = 0; i < words.length; i++) {
      if (buffers[i]) {
        await playBuffer(buffers[i]);
      } else {
        await speakWordTTS(words[i]);
      }
      if (i < words.length - 1) await new Promise(r => setTimeout(r, 20));
    }
    window.isSpeaking = false;
  }

  return { saveWord, getWord, hasWord, countWords, getAllWords, playBuffer, speakWithUserVoice, normalize };
})();
