import React, { useContext } from 'react';
import { AppContext, AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { PhaseStepper } from './components/PhaseStepper';
import { AuthModal } from './components/AuthModal';
import { LocationSelector } from './components/Phase1/LocationSelector';
import { CategorySelector } from './components/Phase1/CategorySelector';
import { SkillsAndCapital } from './components/Phase1/SkillsAndCapital';
import { CompetitorMap } from './components/Phase1/CompetitorMap';
import { AdvisoryReport } from './components/Phase1/AdvisoryReport';
import { SchemeExplorer } from './components/Phase2/SchemeExplorer';
import { ProductCatalog } from './components/Phase3/ProductCatalog';
import { AIAssistantModal } from './components/AIChat/AIAssistantModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { Footer } from './components/Footer';

const MainContent = () => {
  const {
    currentPhase,
    currentStep,
    showAdmin,
    t
  } = useContext(AppContext);

  if (showAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="space-y-6">
      {/* PHASE 1 */}
      {currentPhase === 1 && (
        <div>
          {/* Phase 1 Sub-step Wizard Breadcrumb */}
          <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center text-xs font-bold text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <span className={currentStep === 1 ? 'text-blue-700 font-extrabold' : ''}>1. Location</span>
            <span>→</span>
            <span className={currentStep === 2 ? 'text-blue-700 font-extrabold' : ''}>2. Business</span>
            <span>→</span>
            <span className={currentStep === 3 ? 'text-blue-700 font-extrabold' : ''}>3. Capital & Skills</span>
            <span>→</span>
            <span className={currentStep === 4 ? 'text-blue-700 font-extrabold' : ''}>4. 15 KM Map</span>
            <span>→</span>
            <span className={currentStep === 5 ? 'text-emerald-700 font-extrabold' : ''}>5. AI Report</span>
          </div>

          {currentStep === 1 && <LocationSelector />}
          {currentStep === 2 && <CategorySelector />}
          {currentStep === 3 && <SkillsAndCapital />}
          {currentStep === 4 && <CompetitorMap />}
          {currentStep === 5 && <AdvisoryReport />}
        </div>
      )}

      {/* PHASE 2 */}
      {currentPhase === 2 && <SchemeExplorer />}

      {/* PHASE 3 */}
      {currentPhase === 3 && <ProductCatalog />}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <PhaseStepper />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MainContent />
        </main>

        <AuthModal />
        <AIAssistantModal />
        <Footer />
      </div>
    </AppProvider>
  );
}

export default App;
