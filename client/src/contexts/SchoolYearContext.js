import React, { createContext, useContext, useState, useEffect } from 'react';

const SchoolYearContext = createContext();

export const useSchoolYear = () => {
  const context = useContext(SchoolYearContext);
  if (!context) {
    throw new Error('useSchoolYear must be used within a SchoolYearProvider');
  }
  return context;
};

export const SchoolYearProvider = ({ children }) => {
  // Générer les années scolaires disponibles (5 ans en arrière et 5 ans en avant)
  const generateSchoolYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = -5; i <= 5; i++) {
      const year = currentYear + i;
      years.push({
        value: `${year}-${year + 1}`,
        label: `${year}-${year + 1}`,
        startYear: year,
        endYear: year + 1
      });
    }
    
    return years;
  };

  const [availableYears] = useState(generateSchoolYears());
  const [selectedYear, setSelectedYear] = useState(() => {
    // Par défaut, sélectionner l'année scolaire 2025-2026
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Si on est entre août (7) et juillet (6), on est dans l'année scolaire en cours
    // L'année scolaire commence en août et se termine en juillet
    let schoolYear;
    if (currentMonth >= 7) { // Août (7) à Décembre (11)
      schoolYear = currentYear;
    } else { // Janvier (0) à Juillet (6)
      schoolYear = currentYear - 1;
    }
    
    // Pour l'instant, forcer l'année 2025-2026
    return '2025-2026';
  });

  // Sauvegarder la sélection dans localStorage
  useEffect(() => {
    localStorage.setItem('selectedSchoolYear', selectedYear);
  }, [selectedYear]);

  // Charger la sélection depuis localStorage au démarrage
  useEffect(() => {
    const savedYear = localStorage.getItem('selectedSchoolYear');
    // Forcer l'année 2025-2026 pour corriger le problème
    if (savedYear !== '2025-2026') {
      setSelectedYear('2025-2026');
      localStorage.setItem('selectedSchoolYear', '2025-2026');
    } else if (savedYear && availableYears.some(year => year.value === savedYear)) {
      setSelectedYear(savedYear);
    }
  }, [availableYears]);

  const changeSchoolYear = (year) => {
    setSelectedYear(year);
  };

  const getCurrentYearInfo = () => {
    return availableYears.find(year => year.value === selectedYear) || availableYears[5];
  };

  const value = {
    selectedYear,
    availableYears,
    changeSchoolYear,
    getCurrentYearInfo
  };

  return (
    <SchoolYearContext.Provider value={value}>
      {children}
    </SchoolYearContext.Provider>
  );
};
