import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Globe, User, LogOut, Shield, Bot, Sparkles, Building2, Mic } from 'lucide-react';
import { VoiceSettingsModal } from './AIChat/VoiceSettingsModal';

export const Navbar = () => {
  const {
    lang,
    setLang,
    t,
    user,
    logout,
    setShowAuthModal,
    setAuthMode,
    showAdmin,
    setShowAdmin,
    setShowAIChat
  } = useContext(AppContext);

  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-brand-900 text-white shadow-premium backdrop-blur-md bg-opacity-95 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Headline */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setShowAdmin(false)}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white">Vyapaar<span className="text-emerald-400">Mitra.AI</span></span>
              <span className="bg-blue-900/60 text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium border border-blue-700/50">PRO</span>
            </div>
            <p className="text-xs text-slate-300 font-medium hidden sm:block">
              {t.appTitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Voice API Config Button */}
          <button
            onClick={() => setShowVoiceSettings(true)}
            title="Configure Voice API (ElevenLabs / OpenAI / Web Speech)"
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700"
          >
            <Mic className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">Voice API</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={() => setShowAIChat(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-2 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md shadow-emerald-900/30 hover:scale-105"
          >
            <Bot className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span className="hidden md:inline">{t.aiAssistant}</span>
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5 text-sm">
            <Globe className="w-4 h-4 text-slate-400 mr-2" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-white font-medium text-xs sm:text-sm focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-slate-900 text-white">English (EN)</option>
              <option value="te" className="bg-slate-900 text-white">తెలుగు (TE)</option>
              <option value="hi" className="bg-slate-900 text-white">हिंदी (HI)</option>
            </select>
          </div>

          {/* Admin Toggle */}
          {user && user.role === 'admin' && (
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-colors border ${
                showAdmin 
                  ? 'bg-amber-500 text-slate-950 border-amber-400' 
                  : 'bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-700'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">{t.adminPanel}</span>
            </button>
          )}

          {/* User Auth Profile */}
          {user ? (
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-200 hidden lg:inline">{user.name}</span>
              <button
                onClick={logout}
                title={t.logout}
                className="text-slate-400 hover:text-red-400 p-1 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-900/30"
            >
              <User className="w-4 h-4" />
              <span>{t.login} / {t.register}</span>
            </button>
          )}

        </div>
      </div>

      <VoiceSettingsModal
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
      />
    </header>
  );
};
