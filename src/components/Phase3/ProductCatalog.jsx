import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';
import { Wrench, Search, ShieldCheck, ArrowRight, Filter, Scale } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductComparison } from './ProductComparison';

export const ProductCatalog = () => {
  const {
    selectedCategory,
    availableCapital,
    lang,
    t
  } = useContext(AppContext);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'compare'
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/products?category_code=${selectedCategory?.code || 'dairy'}`)
      .then(data => {
        if (data.products) setProducts(data.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCategory]);

  const filtered = products.filter(p => {
    const term = search.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(term) ||
                          p.brand.toLowerCase().includes(term) ||
                          p.supplier_name.toLowerCase().includes(term);
    const matchesPrice = !maxPrice || p.price <= Number(maxPrice);
    return matchesSearch && matchesPrice;
  });

  const handleToggleCompare = (product) => {
    if (selectedForCompare.some(p => p.id === product.id)) {
      setSelectedForCompare(selectedForCompare.filter(p => p.id !== product.id));
    } else {
      if (selectedForCompare.length >= 2) {
        alert("You can compare up to 2 machines at a time.");
        return;
      }
      setSelectedForCompare([...selectedForCompare, product]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-3xl shadow-xl border border-slate-200/80">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Wrench className="w-4 h-4" />
            <span>PHASE 03 — PRODUCTS & MACHINERY</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">{t.productsHeading}</h2>
          <p className="text-xs text-slate-500 font-medium">
            Auto-mapped equipment for <span className="font-bold text-blue-700">{selectedCategory?.name_en}</span> from verified genuine suppliers.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4 text-emerald-600" />
            <span>Products Catalog ({filtered.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'compare' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4 text-blue-600" />
            <span>Machine Comparison</span>
            {selectedForCompare.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold ml-1">
                {selectedForCompare.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'compare' ? (
        <ProductComparison
          selectedProducts={selectedForCompare}
          allProducts={products}
          onRemove={(id) => setSelectedForCompare(selectedForCompare.filter(p => p.id !== id))}
        />
      ) : (
        <div className="space-y-6">
          
          {/* Search & Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchProducts}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="number"
                placeholder="Max Budget Price (₹)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Verification System Legend */}
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-300">Genuine Company System:</span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 mr-1" /> Verified Company
              </span>
              <span className="flex items-center text-blue-400 font-bold">
                <ShieldCheck className="w-4 h-4 mr-1" /> Verified Supplier
              </span>
              <span className="flex items-center text-amber-400 font-bold">
                ⏳ Verification Pending
              </span>
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-semibold">Loading machinery catalog...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isComparing={selectedForCompare.some(item => item.id === p.id)}
                  onToggleCompare={() => handleToggleCompare(p)}
                />
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
