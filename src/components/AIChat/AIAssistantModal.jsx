import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';
import { X, Send, Mic, MicOff, Bot, Volume2, VolumeX, AlertCircle, Sparkles, SlidersHorizontal } from 'lucide-react';
import { VoiceSettingsModal } from './VoiceSettingsModal';

export const AIAssistantModal = () => {
  const {
    showAIChat,
    setShowAIChat,
    selectedCategory,
    locationData,
    availableCapital,
    skillsData,
    lang,
    t
  } = useContext(AppContext);

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your VyapaarMitra AI Business Advisor. Ask me anything about starting ${selectedCategory?.name_en} in ${locationData.village}, funding schemes, or machinery.`
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micError, setMicError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up speech synthesis when unmounted
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!showAIChat) return null;

  // Text-to-Speech (TTS) Voice Readout using Selected Voice Avatar
  const speakText = (textToSpeak) => {
    if (!isVoiceOutputEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop prior speech
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const savedURI = localStorage.getItem('ag_selected_voice_uri');
    const savedSpeed = localStorage.getItem('ag_voice_speed') || '1.0';
    const voices = window.speechSynthesis.getVoices();

    if (savedURI && voices.length > 0) {
      const chosen = voices.find(v => v.voiceURI === savedURI);
      if (chosen) utterance.voice = chosen;
    } else {
      const langMatch = voices.find(v => v.lang.startsWith(lang));
      if (langMatch) utterance.voice = langMatch;
    }

    utterance.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = Number(savedSpeed);

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (questionText) => {
    const q = questionText || input;
    if (!q.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: q }];
    setMessages(newMessages);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const data = await apiFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context: {
            category: selectedCategory,
            location: locationData,
            capital: availableCapital,
            skills: skillsData
          }
        })
      });

      const aiReply = data.answer || 'Thank you for your question.';
      setMessages([...newMessages, { sender: 'ai', text: aiReply }]);

      // Speak back the AI answer out loud with selected voice
      speakText(aiReply);
    } catch (err) {
      setMessages([...newMessages, { sender: 'ai', text: 'Sorry, I encountered an issue generating an answer.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Voice Speech Input STT
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    setMicError('');
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      handleSend(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setMicError(`Microphone error: ${event.error}. Check mic permissions.`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const toggleVoiceOutput = () => {
    if (isSpeaking && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setIsVoiceOutputEnabled(!isVoiceOutputEnabled);
  };

  const presetQuestions = [
    "What are my competitors within 15 KM?",
    "Where can I sell my products?",
    "Which government scheme is suitable for me?",
    "What machinery do I need for this business?",
    "What are the main risks?"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 h-[590px] flex flex-col">
        
        {/* Header */}
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">{t.aiAssistant}</h3>
              <p className="text-[10px] text-emerald-400 font-medium">{selectedCategory?.name_en} • {locationData.village}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Configure Voice Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              title="Configure Voice Assistant & Select Voice Personas"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Toggle TTS Voice Output Button */}
            <button
              onClick={toggleVoiceOutput}
              title={isVoiceOutputEnabled ? "Voice Readout Active" : "Voice Readout Muted"}
              className={`p-2 rounded-xl transition-colors ${
                isVoiceOutputEnabled
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isVoiceOutputEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                setShowAIChat(false);
              }}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voice Spectrum Audio Visualizer */}
        {(isListening || isSpeaking) && (
          <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-xs font-bold text-emerald-400 border-b border-slate-800">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{isListening ? 'Listening to your voice...' : 'AI Speaking...'}</span>
            </span>

            {/* Pulsing Audio Spectrum Bars */}
            <div className="flex items-center space-x-1">
              <div className="w-1 h-4 bg-emerald-400 animate-bounce"></div>
              <div className="w-1 h-6 bg-emerald-400 animate-bounce delay-75"></div>
              <div className="w-1 h-3 bg-emerald-400 animate-bounce delay-150"></div>
              <div className="w-1 h-5 bg-emerald-400 animate-bounce delay-100"></div>
            </div>
          </div>
        )}

        {/* Mic error notice */}
        {micError && (
          <div className="p-2 bg-red-50 text-red-700 text-[11px] font-medium flex items-center shrink-0 border-b border-red-100">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span>{micError}</span>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 font-bold mt-1">
                  AI
                </div>
              )}

              <div className={`p-3 rounded-2xl text-xs max-w-[80%] font-medium leading-relaxed shadow-sm ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}>
                {m.text}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs shrink-0 font-bold mt-1">
                  You
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-500 text-xs italic pl-9">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
              <span>AI is processing your query...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Presets */}
        <div className="p-2 bg-white border-t border-slate-200 flex items-center space-x-1.5 overflow-x-auto shrink-0 no-scrollbar">
          {presetQuestions.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(pq)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-[10px] font-bold border border-slate-200 shrink-0 transition-colors"
            >
              {pq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 shrink-0">
          
          <button
            onClick={handleVoiceInput}
            title={t.voiceMic}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-600" />}
          </button>

          <input
            type="text"
            placeholder={t.typeQuestion}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>

        </div>

      </div>

      <VoiceSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};
