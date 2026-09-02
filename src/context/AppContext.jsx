import React, { createContext, useState, useEffect } from 'react';
import { translations } from '../translations/i18n';
import { apiFetch } from '../utils/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ag_token') || null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'

  // Wizard state
  const [currentPhase, setCurrentPhase] = useState(1); // 1 | 2 | 3
  const [currentStep, setCurrentStep] = useState(1); // Phase 1 steps: 1(Location) -> 2(Category) -> 3(Skills/Capital) -> 4(Competitors) -> 5(Advisory Report)

  // Business Profile Data
  const [locationData, setLocationData] = useState({
    state: 'Andhra Pradesh',
    district: 'Guntur',
    mandal: 'Tadepalli',
    village: 'Tadepalli Village',
    pincode: '522501',
    lat: 16.483,
    lng: 80.601
  });

  const [selectedCategory, setSelectedCategory] = useState({
    code: 'dairy',
    name_en: 'Dairy Farming',
    name_te: 'పాడి పరిశ్రమ (Dairy)',
    name_hi: 'डेयरी फार्मिंग',
    icon: 'Milk',
    description: 'Milk production, cattle breeding, and milk processing.',
    typical_investment_min: 100000,
    typical_investment_max: 1500000
  });

  const [skillsData, setSkillsData] = useState({
    hasSkills: 'yes',
    years: '2',
    details: 'Managed 5 dairy cattle in native village'
  });

  const [availableCapital, setAvailableCapital] = useState(100000);
  const [competitorsData, setCompetitorsData] = useState(null);
  const [advisoryReport, setAdvisoryReport] = useState(null);

  // Admin View
  const [showAdmin, setShowAdmin] = useState(false);

  // AI Chat Assistant State
  const [showAIChat, setShowAIChat] = useState(false);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    if (token) {
      apiFetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(data => {
          if (data.user) setUser(data.user);
          else logout();
        })
        .catch(() => logout());
    }
  }, [token]);

  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('ag_token', userToken);
    setShowAuthModal(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ag_token');
    setShowAdmin(false);
  };

  return (
    <AppContext.Provider value={{
      lang,
      setLang,
      t,
      user,
      token,
      loginUser,
      logout,
      showAuthModal,
      setShowAuthModal,
      authMode,
      setAuthMode,
      currentPhase,
      setCurrentPhase,
      currentStep,
      setCurrentStep,
      locationData,
      setLocationData,
      selectedCategory,
      setSelectedCategory,
      skillsData,
      setSkillsData,
      availableCapital,
      setAvailableCapital,
      competitorsData,
      setCompetitorsData,
      advisoryReport,
      setAdvisoryReport,
      showAdmin,
      setShowAdmin,
      showAIChat,
      setShowAIChat
    }}>
      {children}
    </AppContext.Provider>
  );
};
