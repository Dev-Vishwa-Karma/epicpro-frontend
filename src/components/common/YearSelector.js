import React from 'react';
import moment from 'moment';

const YearSelector = ({ selectedYear, handleYearChange, labelClass, selectClass }) => {
  const currentYear = moment().year();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

  return (
    <div>
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
