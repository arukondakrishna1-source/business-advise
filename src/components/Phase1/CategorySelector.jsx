import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';
import {
  Search,
  Milk,
  Egg,
  Footprints,
  Sprout,
  Fish,
  Utensils,
  Cake,
  Scissors,
  Smartphone,
  ShoppingBag,
  Coffee,
  Sparkles,
  Sun,
  Wrench,
  Factory,
  Printer,
  ArrowRight,
  ArrowLeft,
  Briefcase
} from 'lucide-react';

const iconMap = {
  Milk,
  Egg,
  Footprints,
  Sprout,
  Fish,
  Utensils,
  Cake,
  Scissors,
  Smartphone,
  ShoppingBag,
  Coffee,
  Sparkles,
  Sun,
  Wrench,
  Factory,
  Printer
};

export const CategorySelector = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    setCurrentStep,
    lang,
    t
  } = useContext(AppContext);

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/categories')
      .then(data => {
        if (data.categories) setCategories(data.categories);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = categories.filter(c => {
    const term = search.toLowerCase();
    return (
      c.name_en.toLowerCase().includes(term) ||
      c.name_te.toLowerCase().includes(term) ||
      c.name_hi.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term)
    );
  });

  const getCategoryTitle = (c) => {
    if (lang === 'te') return c.name_te;
    if (lang === 'hi') return c.name_hi;
    return c.name_en;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-xl border border-slate-200/80">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {t.categoryHeading}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Choose the business you intend to start in your selected area.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchCategory}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 font-medium">Loading business categories...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto pr-1">
          {filtered.map(c => {
            const IconComp = iconMap[c.icon] || Briefcase;
            const isSelected = selectedCategory?.code === c.code;

            return (
              <div
                key={c.code}
                onClick={() => setSelectedCategory(c)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50 border-blue-600 shadow-md shadow-blue-500/10 ring-2 ring-blue-600/20'
                    : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-tight mb-1">
                    {getCategoryTitle(c)}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {c.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Investment:</span>
                  <span className="text-blue-700 font-bold">₹{(c.typical_investment_min/100000).toFixed(1)}L - ₹{(c.typical_investment_max/100000).toFixed(1)}L</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backStep}</span>
        </button>

        <button
          type="button"
          disabled={!selectedCategory}
          onClick={() => setCurrentStep(3)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 text-sm transition-all disabled:opacity-50"
        >
          <span>{t.nextStep}: Skills & Capital</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
