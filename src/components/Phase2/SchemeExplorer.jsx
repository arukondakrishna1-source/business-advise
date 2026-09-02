import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';
import { Landmark, Search, CheckCircle2, ArrowRight, ExternalLink, Calculator, FileText } from 'lucide-react';
import { SchemeCalculator } from './SchemeCalculator';
import { SchemeDetailModal } from './SchemeDetailModal';

export const SchemeExplorer = () => {
  const {
    availableCapital,
    selectedCategory,
    setCurrentPhase,
    lang,
    t
  } = useContext(AppContext);

  const [schemes, setSchemes] = useState([]);
  const [autoSelectedCode, setAutoSelectedCode] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'calculator'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/schemes?capital=${availableCapital}&category=${selectedCategory?.code}`)
      .then(data => {
        if (data.schemes) setSchemes(data.schemes);
        if (data.autoSelectedCode) setAutoSelectedCode(data.autoSelectedCode);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [availableCapital, selectedCategory]);

  const getSchemeName = (s) => {
    if (lang === 'te') return s.name_te;
    if (lang === 'hi') return s.name_hi;
    return s.name_en;
  };

  const filtered = schemes.filter(s => {
    const term = search.toLowerCase();
    return (
      s.name_en.toLowerCase().includes(term) ||
      s.name_te.toLowerCase().includes(term) ||
      s.name_hi.toLowerCase().includes(term) ||
      s.department.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Phase 2 Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-3xl shadow-xl border border-slate-200/80">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <Landmark className="w-4 h-4" />
            <span>PHASE 02 — GOVERNMENT SCHEMES & APPLICATION</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">{t.schemesHeading}</h2>
          <p className="text-xs text-slate-500 font-medium">
            Schemes filtered for your business category ({selectedCategory?.name_en}) and capital (₹{availableCapital.toLocaleString('en-IN')}).
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Landmark className="w-4 h-4 text-emerald-600" />
            <span>All Schemes ({filtered.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'calculator' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-blue-600" />
            <span>{t.schemeCalcHeading}</span>
          </button>
        </div>
      </div>

      {activeTab === 'calculator' ? (
        <SchemeCalculator />
      ) : (
        <div className="space-y-6">
          
          {/* Automatic Scheme Recommendation Banner */}
          {autoSelectedCode && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-500/30">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xl shrink-0">
                  ⚡
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">Automated AI Scheme Recommendation</span>
                  <h4 className="text-lg font-black text-white">
                    {autoSelectedCode === 'MICRO_FINANCE' ? 'Micro Finance Scheme (Cost ≤ ₹1.40 Lakh)' : 'Term Loan Scheme (Cost > ₹1.40 Lakh up to ₹50 Lakh)'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    Matches your project cost calculation: ₹{(availableCapital / 0.10).toLocaleString('en-IN')} (90% Loan + 10% Beneficiary Capital).
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  const matched = schemes.find(s => s.code === autoSelectedCode);
                  if (matched) setSelectedScheme(matched);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shrink-0"
              >
                View Selected Scheme Rules →
              </button>
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search government schemes by name, department, or rules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
            />
          </div>

          {/* Scheme Cards Grid */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-semibold">Loading government schemes catalog...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(s => {
                const isAuto = s.code === autoSelectedCode;

                return (
                  <div
                    key={s.code}
                    className={`p-6 rounded-3xl bg-white border transition-all duration-200 flex flex-col justify-between shadow-md hover:shadow-xl ${
                      isAuto ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                          {s.department}
                        </span>
                        {isAuto && (
                          <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Auto Selected
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-black text-slate-900 leading-tight mb-2">
                        {getSchemeName(s)}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 mb-4 font-medium">
                        {s.benefits}
                      </p>

                      {/* Loan Limits Grid */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-center text-xs mb-4">
                        <div>
                          <span className="text-slate-500 font-bold block text-[10px]">Max Loan</span>
                          <span className="font-black text-slate-900">₹{(s.max_loan_amount/100000).toFixed(2)}L</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block text-[10px]">Interest Rate</span>
                          <span className="font-black text-emerald-600">{s.interest_rate}% p.a.</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block text-[10px]">Moratorium</span>
                          <span className="font-black text-blue-600">{s.moratorium_months} Months</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedScheme(s)}
                        className="text-xs font-extrabold text-blue-700 hover:text-blue-900 flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        <span>Eligibility & Documents</span>
                      </button>

                      <a
                        href={s.official_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition-colors"
                      >
                        <span>{t.applyOfficial}</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1 text-emerald-400" />
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Bridge to Phase 3 */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">Phase 3 Transition</span>
              <h4 className="text-lg font-black mt-0.5">REQUIRE PRODUCTS & MACHINERY</h4>
              <p className="text-xs text-slate-300">
                Explore auto-mapped equipment for {selectedCategory?.name_en} from verified genuine companies with budget comparison tools.
              </p>
            </div>

            <button
              onClick={() => setCurrentPhase(3)}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl text-sm transition-all shrink-0"
            >
              <span>Phase 3: Products & Machinery →</span>
            </button>
          </div>

        </div>
      )}

      {/* Scheme Detail & Official Apply Modal */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
        />
      )}

    </div>
  );
};
