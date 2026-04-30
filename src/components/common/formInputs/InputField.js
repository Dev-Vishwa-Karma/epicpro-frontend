import React from 'react';
import Select from "react-select";


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

     type === "select" && multiple ? (
          <div className={wrapperClass}>
                {label && <label className="form-label"></label>}

                <Select
              isMulti
              options={options}

              value={
                options.filter(opt =>
                  Array.isArray(value) && value.includes(opt.value)
                )
              }

              onChange={(selected) => {
                onChange({
                  target: {
                    name,
                    value: selected ? selected.map(s => s.value) : []
                  }
                });
              }}

              placeholder={`Select ${label}`}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: base => ({ ...base, zIndex: 999999 }),
                control: base => ({
                  ...base,
                  minHeight: "38px",
                  borderColor: error ? "red" : base.borderColor
                })
              }}
            />

        </div>
      ) :

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