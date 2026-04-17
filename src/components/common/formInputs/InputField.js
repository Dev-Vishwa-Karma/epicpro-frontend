import React, { useState, useRef, useEffect } from 'react';

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  refInput,
  type = "text",
  options = [],
  disabled = false,
  required = false,
  maxLength = null,
  onInput = null,
  min = null,
  max = null,
  rows = 5,
  accept = '',
  multiple = false,
  style = {},
  autoComplete = 'off',
  firstOption= true,
  containerClassName = '',
  inputClassName = ''
}) => {
  const wrapperClass = `${(type !== 'file' && type !== 'checkbox') ? 'form-group' : ''}${containerClassName ? ` ${containerClassName}` : ''}`.trim();
  const controlClass = `form-control${error ? ' is-invalid' : ''}${inputClassName ? ` ${inputClassName}` : ''}`.trim();
  const checkboxClass = `form-check-input${error ? ' is-invalid' : ''}${inputClassName ? ` ${inputClassName}` : ''}`.trim();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  return (
    <div className={wrapperClass}>
      {label && <label className="form-label" htmlFor={name}>{label}</label>}

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          className={controlClass}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          required={required}
          ref={refInput}
          rows={rows}
          disabled={disabled}
          style={style}
        />
      ) : 

      type === 'select' && multiple ? (
       <div className="position-relative" ref={dropdownRef}>
    
    {/* Dropdown Header */}
    <div
      className={`form-control d-flex justify-content-between align-items-center ${error ? 'is-invalid' : ''}`}
      onClick={() => setOpen(!open)}
      style={{ cursor: 'pointer' }}
    >
      <span>
        {(value && value.length > 0)
          ? options
              .filter(opt => value.includes(opt.value))
              .map(opt => opt.label)
              .join(', ')
          : `Select ${label}`}
      </span>
      <span>▼</span>
    </div>

    {/* Dropdown List */}
    {open && (
      <div
        className="position-absolute bg-white border rounded w-100 mt-1 p-2"
        style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
      >
        {options.map(option => (
          <div key={option.value} className="form-check">
            <input
              type="checkbox"
              id={`${name}_${option.value}`}
              className={checkboxClass}
              checked={(value || []).includes(option.value)}
              onChange={(e) => {
                let updatedValues = [...(value || [])];

                if (e.target.checked) {
                  updatedValues.push(option.value);
                } else {
                  updatedValues = updatedValues.filter(v => v !== option.value);
                }

                onChange({
                  target: {
                    name,
                    value: updatedValues
                  }
                });
              }}
            />
            <label
              htmlFor={`${name}_${option.value}`}
              className="form-check-label ml-2"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    )}
  </div>
      )
      :

      type === 'select' && !multiple  ? (
        <select
          id={name}
          name={name}
          className={controlClass}
          value={value || ""}
          onChange={onChange}
          required={required}
          ref={refInput}
          disabled={disabled}
          style={style}
          >
          {firstOption &&  <option value="">
            {label && label.toLowerCase().startsWith('select') ? label : `Select ${label || 'Option'}`}
          </option>}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'file' ? (
        <input
          id={name}
          type="file"
          name={name}
          className={controlClass}
          onChange={onChange}
          required={required}
          ref={refInput}
          disabled={disabled}
          accept={accept}
          multiple={multiple}
          style={style}
        />
      ) : type === 'checkbox' ? (
          <input
            id={name}
            type="checkbox"
            name={name}
            className={checkboxClass}
            checked={value || false}
            onChange={onChange}
            required={required}
            ref={refInput}
            disabled={disabled}
          />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          className={controlClass}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          required={required}
          ref={refInput}
          maxLength={maxLength}
          onInput={onInput}
          disabled={disabled}
          min={min}
          max={max}
          autoComplete={autoComplete || 'off'}
          style={style}
        />
      )}

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};

export default InputField;
