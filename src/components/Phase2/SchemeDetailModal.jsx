import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { X, CheckCircle2, AlertCircle, FileCheck, ExternalLink, ShieldCheck, Info } from 'lucide-react';

export const SchemeDetailModal = ({ scheme, onClose }) => {
  const { availableCapital, t } = useContext(AppContext);

  if (!scheme) return null;

  const estimatedCost = availableCapital / 0.10;
  
  // Eligibility check logic (Section 16)
  let eligibilityStatus = 'Eligible';
  let statusColor = 'green';
  let statusReason = 'Your project cost and capital match the official scheme guidelines.';

  if (estimatedCost < scheme.min_cost) {
    eligibilityStatus = 'Not Eligible';
    statusColor = 'red';
    statusReason = `Your estimated project cost of ₹${estimatedCost.toLocaleString('en-IN')} is below the minimum required project cost of ₹${scheme.min_cost.toLocaleString('en-IN')} for this scheme.`;
  } else if (estimatedCost > scheme.max_cost) {
    eligibilityStatus = 'Not Eligible';
    statusColor = 'red';
    statusReason = `Your estimated project cost exceeds the scheme maximum cap of ₹${scheme.max_cost.toLocaleString('en-IN')}.`;
  } else if (availableCapital < (estimatedCost * (scheme.margin_pct / 100))) {
    eligibilityStatus = 'Possibly Eligible';
    statusColor = 'amber';
    statusReason = `Subject to bank appraisal of beneficiary margin capital contribution.`;
  }

  const documents = Array.isArray(scheme.documents) ? scheme.documents : JSON.parse(scheme.documents_json || '[]');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-brand-900 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
            {scheme.department}
          </span>
          <h2 className="text-xl font-black mt-1 pr-8">{scheme.name_en}</h2>
          <p className="text-xs text-slate-300 mt-1">Official Scheme Details & Document Checklist</p>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Eligibility Badge (Section 16) */}
          <div className={`p-4 rounded-2xl border flex items-start space-x-3 ${
            statusColor === 'green' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' :
            statusColor === 'amber' ? 'bg-amber-50 border-amber-300 text-amber-950' :
            'bg-red-50 border-red-300 text-red-950'
          }`}>
            <div className="mt-0.5 shrink-0">
              {statusColor === 'green' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
              {statusColor === 'amber' && <AlertCircle className="w-6 h-6 text-amber-600" />}
              {statusColor === 'red' && <AlertCircle className="w-6 h-6 text-red-600" />}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase opacity-80">Eligibility Status</span>
              <h4 className="font-extrabold text-base">{eligibilityStatus}</h4>
              <p className="text-xs font-medium mt-0.5 opacity-90">{statusReason}</p>
              <p className="text-[10px] font-bold mt-1 text-slate-500 italic">
                * Note: Final eligibility must be verified by the concerned government authority / bank.
              </p>
            </div>
          </div>

          {/* Key Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center text-xs">
            <div>
              <span className="text-slate-500 font-bold block text-[10px]">Max Loan Limit</span>
              <span className="font-black text-slate-900 text-sm">₹{(scheme.max_loan_amount/100000).toFixed(2)} Lakh</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px]">Interest Rate</span>
              <span className="font-black text-emerald-600 text-sm">{scheme.interest_rate}% p.a.</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px]">Tenure</span>
              <span className="font-black text-slate-900 text-sm">{scheme.tenure_years} Years</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px]">Moratorium</span>
              <span className="font-black text-blue-600 text-sm">{scheme.moratorium_months} Months</span>
            </div>
          </div>

          {/* Scheme Rules & Benefits */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center">
              <Info className="w-4 h-4 mr-2 text-blue-600" />
              Scheme Rules & Benefits
            </h4>
            <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {scheme.rules}
            </p>
          </div>

          {/* Required Documents (Section 23) */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center">
              <FileCheck className="w-4 h-4 mr-2 text-emerald-600" />
              Required Documents Checklist (Phase 2)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {documents.map((doc, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 51 Government Disclaimer */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
            🛡️ <strong>Government Disclaimer:</strong> {t.govtDisclaimer}
          </div>

        </div>

        {/* Footer Apply CTA */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2"
          >
            Close
          </button>

          <a
            href={scheme.official_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30"
          >
            <span>APPLY ON OFFICIAL WEBSITE</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};
