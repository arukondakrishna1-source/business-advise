import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Calculator, IndianRupee, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export const SchemeCalculator = () => {
  const { availableCapital, setAvailableCapital, t } = useContext(AppContext);

  const capital = Math.max(availableCapital, 10000);
  
  // Section 17 Formulas
  const projectCost = Math.round(capital / 0.10);
  
  // Automatic Logic A vs B (Section 20)
  const isMicroFinance = projectCost <= 140000;
  
  const schemeName = isMicroFinance ? 'Micro Finance Scheme (MFS)' : 'Term Loan Scheme (TLS)';
  const maxLoanLimit = isMicroFinance ? 125000 : 4500000;
  const interestRate = isMicroFinance ? 6.5 : 8.0;
  const tenureYears = isMicroFinance ? 3 : 7;
  const moratoriumMonths = isMicroFinance ? 3 : 6;

  // Loan Amount capped at max loan limit
  const rawLoan = projectCost * 0.90;
  const loanAmount = Math.min(rawLoan, maxLoanLimit);

  // EMI Calculation: P * r * (1+r)^n / ((1+r)^n - 1)
  const totalMonths = tenureYears * 12;
  const monthlyRate = (interestRate / 100) / 12;
  
  const emi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  const totalRepayment = emi * totalMonths;
  const totalInterest = totalRepayment - loanAmount;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">{t.schemeCalcHeading}</h3>
          <p className="text-xs text-slate-500 font-medium">
            Beneficiary Contribution = 10% | Agency Loan = 90%
          </p>
        </div>
      </div>

      {/* Input Capital */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase">
          Enter Your Available Margin Capital (10% Contribution):
        </label>
        <div className="relative max-w-sm">
          <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-400">₹</span>
          <input
            type="number"
            value={capital}
            onChange={(e) => setAvailableCapital(Number(e.target.value))}
            className="w-full pl-8 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-base font-black text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Calculated Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-slate-900">
          <span className="text-[10px] font-bold uppercase text-blue-700">{t.projectCost}</span>
          <div className="text-xl font-black text-blue-950 mt-1">₹{projectCost.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-blue-600 font-medium">(Capital ÷ 10%)</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-900">
          <span className="text-[10px] font-bold uppercase text-emerald-700">{t.potentialLoan}</span>
          <div className="text-xl font-black text-emerald-950 mt-1">₹{loanAmount.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-emerald-600 font-medium">(Project Cost × 90%)</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900">
          <span className="text-[10px] font-bold uppercase text-slate-500">{t.interestRate}</span>
          <div className="text-xl font-black text-slate-900 mt-1">{interestRate}% p.a.</div>
          <span className="text-[10px] text-slate-500 font-medium">Repayment: {tenureYears} Years</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-slate-900">
          <span className="text-[10px] font-bold uppercase text-amber-700">{t.emiAmount}</span>
          <div className="text-xl font-black text-amber-950 mt-1">₹{emi.toLocaleString('en-IN')} / mo</div>
          <span className="text-[10px] text-amber-700 font-medium">Moratorium: {moratoriumMonths} Months</span>
        </div>

      </div>

      {/* Moratorium Explanation */}
      <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 text-xs font-medium space-y-1">
        <div className="font-extrabold flex items-center text-indigo-900">
          <Clock className="w-4 h-4 mr-1.5 text-indigo-600" />
          Moratorium Period Effect ({moratoriumMonths} Months)
        </div>
        <p>
          During the initial {moratoriumMonths} months moratorium, principal loan repayment is deferred to allow your business setup to stabilize. Interest accrues per scheme guidelines during this window.
        </p>
      </div>

      {/* Financial Summary */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-center text-xs gap-4">
        <div>
          <span className="text-slate-400 font-bold block">Selected Scheme Structure:</span>
          <span className="font-black text-sm text-emerald-400">{schemeName}</span>
        </div>

        <div className="flex items-center space-x-6 text-right">
          <div>
            <span className="text-slate-400 font-bold block">Total Interest Payable:</span>
            <span className="font-extrabold text-amber-400">₹{totalInterest.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block">Total Repayment Amount:</span>
            <span className="font-extrabold text-white text-sm">₹{totalRepayment.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
