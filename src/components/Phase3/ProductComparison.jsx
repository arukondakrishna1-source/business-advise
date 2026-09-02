import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Scale, CheckCircle2, ShieldCheck, ExternalLink, X, Lightbulb } from 'lucide-react';

export const ProductComparison = ({ selectedProducts, allProducts, onRemove }) => {
  const { availableCapital, t } = useContext(AppContext);

  const budgetAlts = allProducts.filter(p => p.price <= (availableCapital * 0.45));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">{t.budgetComparison}</h3>
            <p className="text-xs text-slate-500 font-medium">
              Compare machine specs, warranties, prices, and verified supplier credentials.
            </p>
          </div>
        </div>

        {selectedProducts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs font-semibold">
            No machines selected for comparison yet. Go to Products Catalog and click "Compare" on 2 machines!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedProducts.map((p, idx) => (
              <div key={p.id} className="relative p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                
                <button
                  onClick={() => onRemove(p.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>

                <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  Option {idx === 0 ? 'A' : 'B'}
                </span>

                <h4 className="font-extrabold text-base text-slate-900">{p.name}</h4>
                <div className="text-xs text-slate-500">Brand: {p.brand} ({p.model})</div>

                <div className="text-xl font-black text-emerald-700">
                  ₹{p.price.toLocaleString('en-IN')}
                </div>

                <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
                  <div className="flex justify-between py-1 border-b border-slate-200/60 font-medium">
                    <span className="text-slate-500">Supplier:</span>
                    <span className="font-bold text-slate-900">{p.supplier_name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 font-medium">
                    <span className="text-slate-500">Verification:</span>
                    <span className="font-bold text-emerald-600">{p.supplier_status}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 font-medium">
                    <span className="text-slate-500">Capacity:</span>
                    <span className="font-bold text-slate-900">{p.capacity}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 font-medium">
                    <span className="text-slate-500">Warranty:</span>
                    <span className="font-bold text-slate-900">{p.warranty}</span>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-600">
                    <strong>Specifications:</strong> {p.specs}
                  </div>
                </div>

                <a
                  href={p.official_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors mt-2"
                >
                  <span>Visit Official Product Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                </a>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 29: Friendly Budget Alternatives Finder */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-200 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 text-emerald-900 font-extrabold text-base">
          <Lightbulb className="w-5 h-5 text-emerald-600" />
          <h3>{t.lowerCostAlt} (Fitting your Available Capital: ₹{availableCapital.toLocaleString('en-IN')})</h3>
        </div>

        {budgetAlts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {budgetAlts.map(alt => (
              <div key={alt.id} className="p-3.5 bg-white rounded-2xl border border-emerald-200 shadow-sm text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Budget Pick</span>
                <h5 className="font-bold text-slate-900 truncate">{alt.name}</h5>
                <div className="text-sm font-black text-emerald-700">₹{alt.price.toLocaleString('en-IN')}</div>
                <div className="text-[11px] text-slate-500">{alt.warranty} • {alt.supplier_status}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600">All standard equipment fits your current capital profile!</p>
        )}
      </div>

    </div>
  );
};
