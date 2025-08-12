import React from 'react';
import { getColor } from '../../../utils';

const CheckboxGroup = ({ label, options, selected = [], onChange }) => {
  return (
    <div className="col-sm-6 col-md-12 mb-3">
      <label className="form-label">{label}</label>
      <div className="d-flex flex-wrap">
        {options.map((skill) => (
          <label key={skill} className="colorinput mr-3 mb-2">
            <input
              type="checkbox"
              value={skill}
              checked={selected.includes(skill)}
              onChange={onChange}
              className="colorinput-input"
            />
            <span className="colorinput-color bg-blue" />
            <span className={`ml-2 tag tag-${getColor(skill)} py-1 px-2`}>
              {skill}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroup;
