import React from 'react';
import { useSchoolYear } from '../contexts/SchoolYearContext';

const SchoolYearSelector = ({ className = "" }) => {
  const { selectedYear, availableYears, changeSchoolYear } = useSchoolYear();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="school-year" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Année scolaire:
      </label>
      <select
        id="school-year"
        value={selectedYear}
        onChange={(e) => changeSchoolYear(e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        {availableYears.map((year) => (
          <option key={year.value} value={year.value}>
            {year.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SchoolYearSelector;
