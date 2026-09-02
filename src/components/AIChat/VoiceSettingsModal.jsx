import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Settings, Mic, Volume2, Key, Globe, X, CheckCircle2, Play, UserCheck, Sparkles } from 'lucide-react';

export const VoiceSettingsModal = ({ isOpen, onClose }) => {
  const { lang, setLang } = useContext(AppContext);

  const [voiceProvider, setVoiceProvider] = useState(localStorage.getItem('ag_voice_provider') || 'web_speech');
  const [apiKey, setApiKey] = useState(localStorage.getItem('ag_voice_api_key') || '');
  const [voiceSpeed, setVoiceSpeed] = useState(localStorage.getItem('ag_voice_speed') || '1.0');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(localStorage.getItem('ag_selected_voice_uri') || '');
  const [testStatus, setTestStatus] = useState('');

  // Fetch all native browser system voices
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        if (!selectedVoiceURI && voices.length > 0) {
          // Find matching language voice by default
          const matching = voices.find(v => v.lang.startsWith(lang)) || voices[0];
          if (matching) setSelectedVoiceURI(matching.voiceURI);
        }
      }
    };

    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [lang]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('ag_voice_api_key', apiKey);
    localStorage.setItem('ag_voice_provider', voiceProvider);
    localStorage.setItem('ag_voice_speed', voiceSpeed);
    localStorage.setItem('ag_selected_voice_uri', selectedVoiceURI);
    setTestStatus('Voice Assistant preferences saved successfully!');
    setTimeout(() => setTestStatus(''), 3000);
  };

  const handleTestVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const testMsg = lang === 'te' 
        ? "నమస్కారం! నేను మీ వ్యాపారమిత్ర AI బహుభాషా వాయిస్ అసిస్టెంట్."
        : lang === 'hi'
        ? "नमस्ते! मैं आपका व्यापारमित्र AI बहुभाषी वॉयस असिस्टेंट हूं।"
        : "Hello! I am your VyapaarMitra AI Multilingual Voice Assistant.";

      const utterance = new SpeechSynthesisUtterance(testMsg);
      
      const chosenVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }
      utterance.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = Number(voiceSpeed);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Filter voices based on selected app language
  const filteredVoices = availableVoices.filter(v => {
    if (lang === 'te') return v.lang.includes('te') || v.lang.includes('IN');
    if (lang === 'hi') return v.lang.includes('hi') || v.lang.includes('IN');
    return v.lang.includes('en');
  });

  const displayVoices = filteredVoices.length > 0 ? filteredVoices : availableVoices;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Mic className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Multilingual Voice Assistant Setup</h3>
              <p className="text-xs text-slate-500 font-medium">Select specific voices, languages & speech speed</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {testStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
            <span>{testStatus}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs font-medium text-slate-700">
          
          {/* Language Picker */}
          <div>
            <label className="block font-bold text-slate-900 mb-1 flex items-center">
              <Globe className="w-3.5 h-3.5 mr-1 text-blue-600" />
              1. Primary Voice Language
            </label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="en">English (India / US)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          {/* Dynamic Voice Selector */}
          <div>
            <label className="block font-bold text-slate-900 mb-1 flex items-center">
              <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              2. Select Specific Voice Assistant Avatar ({displayVoices.length} voices found)
            </label>

            {availableVoices.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded-xl border">Loading system voices...</p>
            ) : (
              <select
                value={selectedVoiceURI}
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                {displayVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang}) {v.default ? ' [Default]' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Voice API Engine Provider */}
          <div>
            <label className="block font-bold text-slate-900 mb-1">3. Voice API Engine</label>
            <select
              value={voiceProvider}
              onChange={(e) => setVoiceProvider(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="web_speech">Native Multilingual Web Speech API (Zero Latency)</option>
              <option value="elevenlabs">ElevenLabs Multilingual Realtime API</option>
              <option value="openai">OpenAI Realtime Multilingual Voice API</option>
              <option value="google_cloud">Google Cloud Text-to-Speech API</option>
            </select>
          </div>

          {/* External API Key Input */}
          {voiceProvider !== 'web_speech' && (
            <div>
              <label className="block font-bold text-slate-900 mb-1 flex items-center">
                <Key className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {voiceProvider.toUpperCase()} API Key
              </label>
              <input
                type="password"
                placeholder="sk_... / elevenlabs_key_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          )}

          {/* Speech Speed */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-900 flex items-center">
                <Volume2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Speech Speed Rate
              </label>
              <span className="font-extrabold text-emerald-700">{voiceSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.05"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(e.target.value)}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestVoice}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>Test Selected Voice</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/30 transition-all"
            >
              Save Voice Preferences
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
