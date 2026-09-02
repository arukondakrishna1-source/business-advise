import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  CheckCircle2, AlertTriangle, XCircle, Printer, ArrowRight,
  TrendingUp, ShieldAlert, Sparkles, FileText, Landmark
} from 'lucide-react';

export const AdvisoryReport = () => {
  const {
    selectedCategory,
    locationData,
    availableCapital,
    skillsData,
    competitorsData,
    advisoryReport,
    setAdvisoryReport,
    setCurrentPhase,
    lang,
    t
  } = useContext(AppContext);

  const [loading, setLoading] = useState(!advisoryReport);

  useEffect(() => {
    apiFetch('/api/advisory/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: selectedCategory,
        location: locationData,
        capital: availableCapital,
        skills: skillsData,
        competitorsCount: competitorsData?.totalFound || 0,
        language: lang
      })
    })
      .then(data => {
        if (data.report) setAdvisoryReport(data.report);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCategory, locationData, availableCapital, skillsData, competitorsData, lang]);

  if (loading || !advisoryReport) {
    return (
      <div className="max-w-4xl mx-auto p-12 bg-white rounded-3xl shadow-xl text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-lg font-bold text-slate-800">Generating AI Location & Business Advisory Report...</h3>
        <p className="text-xs text-slate-500 mt-1">Analyzing competition density, profit formulas, and SWOT indicators.</p>
      </div>
    );
  }

  const {
    suitability,
    suitColor,
    suitabilityReason,
    marketDemand,
    customerBase,
    marketReach,
    competitionAnalysis,
    pricingGuidance,
    salesChannels,
    marketingAdvice,
    rawMaterialSupply,
    businessOperations,
    financials,
    swot,
    risks
  } = advisoryReport;

  // Chart Data for 3 Scenarios
  const chartData = [
    { name: t.conservative, Revenue: financials.scenarios.conservative.monthlyRevenue, Expenses: financials.totalMonthlyExpenses, Profit: financials.scenarios.conservative.monthlyProfit },
    { name: t.expected, Revenue: financials.scenarios.expected.monthlyRevenue, Expenses: financials.totalMonthlyExpenses, Profit: financials.scenarios.expected.monthlyProfit },
    { name: t.optimistic, Revenue: financials.scenarios.optimistic.monthlyRevenue, Expenses: financials.totalMonthlyExpenses, Profit: financials.scenarios.optimistic.monthlyProfit },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="font-extrabold text-base sm:text-lg">{t.advisoryHeading}</h2>
            <p className="text-xs text-slate-300">{locationData.village}, {locationData.mandal} • Capital: ₹{availableCapital.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors border border-slate-700"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>{t.downloadReport}</span>
          </button>

          <button
            onClick={() => setCurrentPhase(2)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-emerald-900/40"
          >
            <Landmark className="w-4 h-4" />
            <span>Phase 2: View Govt Schemes →</span>
          </button>
        </div>
      </div>

      {/* 1. BUSINESS SUCCESS CHOICE BADGE */}
      <div className={`p-6 rounded-3xl border-2 shadow-lg ${
        suitColor === 'green' ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950' :
        suitColor === 'amber' ? 'bg-amber-50/90 border-amber-500 text-amber-950' :
        'bg-red-50/90 border-red-500 text-red-950'
      }`}>
        <div className="flex items-start space-x-4">
          <div className="mt-1">
            {suitColor === 'green' && <CheckCircle2 className="w-8 h-8 text-emerald-600" />}
            {suitColor === 'amber' && <AlertTriangle className="w-8 h-8 text-amber-600" />}
            {suitColor === 'red' && <XCircle className="w-8 h-8 text-red-600" />}
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-75">{t.suitability}</span>
            <h3 className="text-2xl font-black tracking-tight mt-0.5">{suitability}</h3>
            <p className="text-sm font-medium mt-2 leading-relaxed opacity-90">
              {suitabilityReason}
            </p>
          </div>
        </div>
      </div>

      {/* 2. COMPLETE BUSINESS ADVICE */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-6">
        <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
          Location & Market Operational Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-extrabold uppercase text-blue-700">{t.marketDemand}</h4>
              <p className="text-sm text-slate-700 mt-1 font-medium">{marketDemand}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-extrabold uppercase text-blue-700">{t.customerBase}</h4>
              <p className="text-sm text-slate-700 mt-1 font-medium">{customerBase}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-extrabold uppercase text-blue-700">{t.pricingGuidance}</h4>
              <p className="text-sm text-slate-700 mt-1 font-medium">{pricingGuidance}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-extrabold uppercase text-blue-700">{t.rawMaterialSupply}</h4>
              <p className="text-sm text-slate-700 mt-1 font-medium">{rawMaterialSupply}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-extrabold uppercase text-blue-700">{t.salesChannels}</h4>
              <ul className="list-disc list-inside text-sm text-slate-700 mt-1 space-y-1 font-medium">
                {salesChannels.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-extrabold uppercase text-blue-700">{t.marketingAdvice}</h4>
              <p className="text-sm text-slate-700 mt-1 font-medium">{marketingAdvice}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-extrabold uppercase text-blue-700">{t.businessOperations}</h4>
              <p className="text-sm text-slate-700 mt-1 font-medium">{businessOperations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROFIT & LOSS FINANCIAL ANALYSIS */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-6">
        <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
          {t.financialHeading}
        </h3>

        {/* Financial Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Initial Investment */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-extrabold text-sm text-slate-900 mb-3">{t.initialInvestment}</h4>
            <div className="space-y-2 text-xs">
              {financials.initialInvestment.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-200/60 font-medium">
                  <span className="text-slate-700">{item.item}</span>
                  <span className="font-bold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-sm font-black text-blue-700">
                <span>Total Startup Cost:</span>
                <span>₹{financials.totalProjectCost.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Monthly Expenses */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-extrabold text-sm text-slate-900 mb-3">{t.monthlyExpenses}</h4>
            <div className="space-y-2 text-xs">
              {financials.monthlyExpenses.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-200/60 font-medium">
                  <span className="text-slate-700">{item.item}</span>
                  <span className="font-bold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-sm font-black text-red-600">
                <span>Total Monthly Expenses:</span>
                <span>₹{financials.totalMonthlyExpenses.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* 3-Scenario Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
          <h4 className="font-extrabold text-sm text-emerald-400">Monthly Revenue & Net Profit Scenarios</h4>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-800 pt-3">
            <div>
              <div className="text-slate-400 font-bold">{t.conservative}</div>
              <div className="font-extrabold text-emerald-400 mt-0.5">₹{financials.scenarios.conservative.monthlyProfit.toLocaleString('en-IN')} / mo</div>
            </div>
            <div>
              <div className="text-slate-400 font-bold">{t.expected}</div>
              <div className="font-extrabold text-emerald-400 mt-0.5">₹{financials.scenarios.expected.monthlyProfit.toLocaleString('en-IN')} / mo</div>
            </div>
            <div>
              <div className="text-slate-400 font-bold">{t.optimistic}</div>
              <div className="font-extrabold text-emerald-400 mt-0.5">₹{financials.scenarios.optimistic.monthlyProfit.toLocaleString('en-IN')} / mo</div>
            </div>
          </div>
        </div>

        {/* Financial Disclaimer */}
        <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
          ⚠️ {t.financialDisclaimer}
        </p>

      </div>

      {/* 4. SWOT ANALYSIS */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
          {t.swotAnalysis}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <h4 className="font-extrabold text-xs text-emerald-800 uppercase mb-2">💪 {t.strengths}</h4>
            <ul className="list-disc list-inside text-xs text-emerald-950 space-y-1 font-medium">
              {swot.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200">
            <h4 className="font-extrabold text-xs text-red-800 uppercase mb-2">⚠️ {t.weaknesses}</h4>
            <ul className="list-disc list-inside text-xs text-red-950 space-y-1 font-medium">
              {swot.weaknesses.map((s, idx) => <li key={idx}>{s}</li>)}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
            <h4 className="font-extrabold text-xs text-blue-800 uppercase mb-2">🚀 {t.opportunities}</h4>
            <ul className="list-disc list-inside text-xs text-blue-950 space-y-1 font-medium">
              {swot.opportunities.map((s, idx) => <li key={idx}>{s}</li>)}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <h4 className="font-extrabold text-xs text-amber-800 uppercase mb-2">🛡️ {t.threats}</h4>
            <ul className="list-disc list-inside text-xs text-amber-950 space-y-1 font-medium">
              {swot.threats.map((s, idx) => <li key={idx}>{s}</li>)}
            </ul>
          </div>

        </div>
      </div>

      {/* 5. BUSINESS RISKS */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
          <ShieldAlert className="w-5 h-5 mr-2 text-amber-600" />
          {t.businessRisks}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-extrabold border-b border-slate-200">
                <th className="p-3 rounded-l-xl">Identified Business Risk</th>
                <th className="p-3">Impact Level</th>
                <th className="p-3 rounded-r-xl">Recommended Mitigation Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {risks.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold">{r.risk}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                      r.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {r.impact}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BRIDGE TO PHASE 2 */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-900 to-blue-900 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-wider">Phase 2 Transition</span>
          <h3 className="text-2xl font-black mt-1">SUITABLE GOVERNMENT SCHEMES</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Based on your capital of ₹{availableCapital.toLocaleString('en-IN')} and estimated project cost of ₹{financials.totalProjectCost.toLocaleString('en-IN')}, find low-interest loans (6.5% - 8%), 90% funding, and subsidies.
          </p>
        </div>

        <button
          onClick={() => setCurrentPhase(2)}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-base transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:scale-105 shrink-0"
        >
          <span>Explore Govt Schemes</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
