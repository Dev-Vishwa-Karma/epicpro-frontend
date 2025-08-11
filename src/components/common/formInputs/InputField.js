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
  rows = 5,
  accept = '',
  multiple = false,
  style = {},
  autoComplete='off'
}) => {
  return (
    <div className={type !== 'file' && type !== 'checkbox' ? 'form-group' : ''}>
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
      ) : type === 'file' ? (
        <input
          id={name}
          type="file"
          name={name}
          className={`form-control${error ? ' is-invalid' : ''}`}
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
            className={`form-check-input${error ? ' is-invalid' : ''}`}
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
          autoComplete={autoComplete || 'off'}
        />
      )}

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};

export default InputField;
