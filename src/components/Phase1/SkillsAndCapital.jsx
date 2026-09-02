import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Award, IndianRupee, ArrowRight, ArrowLeft } from 'lucide-react';

export const SkillsAndCapital = () => {
  const {
    skillsData,
    setSkillsData,
    availableCapital,
    setAvailableCapital,
    setCurrentStep,
    selectedCategory,
    t
  } = useContext(AppContext);

  const handleSkillsChange = (e) => {
    setSkillsData({ ...skillsData, [e.target.name]: e.target.value });
  };

  const handleCapitalChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAvailableCapital(raw ? Number(raw) : 0);
  };

  const handleNext = (e) => {
    e.preventDefault();
    setCurrentStep(4); // Move to Competitor Check Map
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-xl border border-slate-200/80">
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <Award className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {t.skillsHeading}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            For business: <span className="font-bold text-blue-700">{selectedCategory?.name_en}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleNext} className="space-y-6">
        
        {/* Experience Section */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
          <label className="block text-sm font-extrabold text-slate-900">
            {t.doYouHaveSkills}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'yes', label: t.yes },
              { id: 'some', label: t.someExperience },
              { id: 'no', label: t.no }
            ].map(opt => (
              <label
                key={opt.id}
                className={`flex items-center justify-center p-3.5 rounded-xl border cursor-pointer transition-all font-bold text-sm ${
                  skillsData.hasSkills === opt.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="hasSkills"
                  value={opt.id}
                  checked={skillsData.hasSkills === opt.id}
                  onChange={handleSkillsChange}
                  className="sr-only"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          {(skillsData.hasSkills === 'yes' || skillsData.hasSkills === 'some') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.yearsOfExp}</label>
                <input
                  type="number"
                  name="years"
                  min="0"
                  max="50"
                  value={skillsData.years}
                  onChange={handleSkillsChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.typeOfExp}</label>
                <input
                  type="text"
                  name="details"
                  placeholder="e.g. Managed family farm / Worked at shop"
                  value={skillsData.details}
                  onChange={handleSkillsChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Capital Section */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border border-emerald-200/80 space-y-3">
          <div className="flex items-center space-x-2">
            <IndianRupee className="w-5 h-5 text-emerald-700" />
            <label className="block text-sm font-extrabold text-slate-900">
              {t.availableCapital}
            </label>
          </div>

          <div className="relative max-w-md">
            <span className="absolute left-4 top-3 text-lg font-bold text-slate-500">₹</span>
            <input
              type="text"
              required
              value={availableCapital.toLocaleString('en-IN')}
              onChange={handleCapitalChange}
              className="w-full pl-9 pr-4 py-3 bg-white border border-emerald-300 rounded-2xl text-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
            />
          </div>

          <p className="text-xs text-slate-600 font-medium">
            💡 {t.capitalHint} Example formula: Available capital ₹1,00,000 enables project cost up to ₹10,00,000 with ₹9,00,000 potential loan!
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backStep}</span>
          </button>

          <button
            type="submit"
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 text-sm transition-all"
          >
            <span>{t.nextStep}: 15 KM Competitor Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>

    </div>
  );
};
