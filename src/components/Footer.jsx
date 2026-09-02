import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Building2, ShieldAlert } from 'lucide-react';

export const Footer = () => {
  const { t } = useContext(AppContext);

  return (
    <footer className="bg-brand-900 text-white border-t border-slate-800 mt-16 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Core Message & Branding */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800 text-center md:text-left">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white">Vyapaar<span className="text-emerald-400">Mitra.AI</span></span>
              <p className="text-xs text-slate-400">VyapaarMitra Professional AI Business Advisory Platform</p>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 px-5 py-3 rounded-2xl">
            <p className="text-xs sm:text-sm font-bold text-emerald-400 tracking-wide uppercase">
              “{t.coreHeadline}”
            </p>
          </div>
        </div>

        {/* Legal Disclaimers (Sections 50 & 51) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-400 leading-relaxed font-medium">
          
          <div className="p-4 rounded-2xl bg-slate-850/60 border border-slate-800/80 space-y-1">
            <h4 className="font-extrabold text-slate-200 uppercase text-[11px] flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Financial Disclaimer
            </h4>
            <p>
              These are estimates based on available information and assumptions. Actual costs, revenue, profit, interest, eligibility, loan approval, and repayment conditions may vary. Verify important information with the relevant official authority, financial institution, or company before making decisions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-850/60 border border-slate-800/80 space-y-1">
            <h4 className="font-extrabold text-slate-200 uppercase text-[11px] flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Government Disclaimer
            </h4>
            <p>
              This platform provides information and links to official government resources. It is not itself a government portal unless explicitly stated otherwise.
            </p>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-slate-850 text-center text-xs text-slate-500 font-medium">
          &copy; 2026 VyapaarMitra Professional AI Business Advisory. All rights reserved.
        </div>

      </div>
    </footer>
  );
};
