import React from 'react';

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
  rows = 5
}) => {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={name}>{label}</label>}

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          className={`form-control${error ? ' is-invalid' : ''}`}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          required={required}
          ref={refInput}
          rows={rows}
          disabled={disabled}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          className={`form-control${error ? ' is-invalid' : ''}`}
          value={value || ""}
          onChange={onChange}
          required={required}
          ref={refInput}
          disabled={disabled}
        >
          <option value="">
            {label && label.toLowerCase().startsWith('select') ? label : `Select ${label || 'Option'}`}
          </option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          className={`form-control${error ? ' is-invalid' : ''}`}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          required={required}
          ref={refInput}
          maxLength={maxLength}
          onInput={onInput}
          disabled={disabled}
          min={min}
        />
      )}

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};

export default InputField;
