import React from 'react';

const YearSelector = ({ selectedYear, handleYearChange, labelClass, selectClass }) => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear;
    const endYear = currentYear + 10;
    const years = Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i
    );

  return (
    <div className='d-flex'>
      <label htmlFor="year-selector" className={labelClass}>
        Year:
      </label>
      <select 
        id="year-selector" 
        className={selectClass} 
        value={selectedYear}
        onChange={handleYearChange}
      >
        {years.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default YearSelector;
