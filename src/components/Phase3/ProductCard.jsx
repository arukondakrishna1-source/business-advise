import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { ShieldCheck, ExternalLink, Scale, CheckCircle2 } from 'lucide-react';

export const ProductCard = ({ product, isComparing, onToggleCompare }) => {
  const { t } = useContext(AppContext);

  const getStatusBadge = () => {
    switch (product.supplier_status) {
      case 'Verified Company':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Verified Company
          </span>
        );
      case 'Verified Supplier':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Verified Supplier
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            ⏳ Verification Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4">
      <div>
        
        {/* Top Supplier Status */}
        <div className="flex items-center justify-between mb-2">
          {getStatusBadge()}
          <span className="text-[10px] font-bold text-slate-400 uppercase">{product.brand}</span>
        </div>

        {/* Product Title */}
        <h3 className="font-extrabold text-slate-900 text-base leading-snug">
          {product.name}
        </h3>

        <div className="text-xs text-slate-500 font-medium mb-3">Model: {product.model}</div>

        {/* Price Tag */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Price:</span>
          <span className="text-lg font-black text-emerald-700">₹{product.price.toLocaleString('en-IN')}</span>
        </div>

        {/* Specifications */}
        <div className="space-y-1.5 text-xs text-slate-600 font-medium">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Capacity:</span>
            <span className="font-bold text-slate-900">{product.capacity}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Warranty:</span>
            <span className="font-bold text-slate-900">{product.warranty}</span>
          </div>
          <div className="pt-1 text-[11px] text-slate-500 line-clamp-2">
            <strong>Specs:</strong> {product.specs}
          </div>
        </div>

      </div>

      {/* Supplier & Links */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="text-xs text-slate-600 font-medium flex justify-between items-center">
          <span>Supplier:</span>
          <span className="font-bold text-slate-900 truncate max-w-[150px]">{product.supplier_name}</span>
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={onToggleCompare}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
              isComparing
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isComparing ? 'Comparing' : 'Compare'}</span>
          </button>

          <a
            href={product.official_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            title="Visit Official Company Website"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
