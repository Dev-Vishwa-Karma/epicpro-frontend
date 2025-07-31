import React from 'react';

const MonthSelector = ({ selectedMonth, handleMonthChange, labelClass, selectClass }) => {
  const getMonths = () => {
    return Array.from({ length: 12 }, (_, index) =>
      new Date(2000, index, 1).toLocaleString('default', { month: 'long' })
    );
  };

  const months = getMonths();

  return (
    <div>
      <label htmlFor="month-selector" className={labelClass}>
        Month:
      </label>
      <select
        id="month-selector"
        className={selectClass}
        value={selectedMonth}
        onChange={handleMonthChange}
      >
        {months.map((month, index) => (
          <option key={index} value={index + 1}>
            {month}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthSelector;
