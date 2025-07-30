import React from 'react';

const YearSelector = ({ selectedYear, years, handleYearChange }) => {
  return (
    <div className="col-lg-4 col-md-12 col-sm-12" style={{backgroundColor:"transparent"}}>
      <label htmlFor="year-selector" className='d-flex card-title mr-3'>
        Year:
      </label>
      <select 
        id="year-selector" 
        className='w-70 custom-select' 
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