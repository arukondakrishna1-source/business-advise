import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Lightbulb, Landmark, Wrench, ChevronRight } from 'lucide-react';

export const PhaseStepper = () => {
  const { currentPhase, setCurrentPhase, t } = useContext(AppContext);

  const phases = [
    {
      num: 1,
      id: '01',
      title: t.phase1Title,
      sub: t.phase1Sub,
      icon: Lightbulb
    },
    {
      num: 2,
      id: '02',
      title: t.phase2Title,
      sub: t.phase2Sub,
      icon: Landmark
    },
    {
      num: 3,
      id: '03',
      title: t.phase3Title,
      sub: t.phase3Sub,
      icon: Wrench
    }
  ];

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Core Headline Banner */}
        <div className="text-center mb-4">
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-emerald-400 uppercase">
            {t.coreHeadline}
          </p>
        </div>

        {/* 3-Phase Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {phases.map((p, idx) => {
            const IconComponent = p.icon;
            const isActive = currentPhase === p.num;
            const isPassed = currentPhase > p.num;

            return (
              <div
                key={p.num}
                onClick={() => setCurrentPhase(p.num)}
                className={`relative flex items-center p-3.5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-900/80 to-slate-800 border-blue-500 shadow-lg shadow-blue-950/50 scale-[1.02]'
                    : isPassed
                    ? 'bg-slate-800/60 border-emerald-500/40 text-slate-300 hover:bg-slate-800'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm mr-3.5 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : isPassed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Phase {p.id}</span>
                    {isActive && (
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    )}
                  </div>
                  <h3 className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                    {p.title.split('—')[1] || p.title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{p.sub}</p>
                </div>

                {idx < 2 && (
                  <ChevronRight className="hidden md:block w-5 h-5 text-slate-600 ml-2" />
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
