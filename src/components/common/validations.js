export const validateFields = (fields) => {
  const errors = {};

  fields.forEach((field) => {
    const { name, value, type, required, pattern, minLength, maxLength, customValidator, messageName } = field;

    // Ensure value is treated as a string if it's not already
    const valueAsString = value ? String(value) : "";

    // Check for required fields
    if (required && valueAsString.trim() === "") {
      errors[name] = `${messageName} is required.`;
      return;
    }

    // Custom validation if provided
    if (customValidator) {
      const customError = customValidator(value);
      if (customError) {
        errors[name] = customError;
        return;
      }
    }

    // Name pattern check (only for 'name' type)
    if (type === 'name' && valueAsString && !/^[A-Za-z\s]+$/.test(valueAsString)) {
      errors[name] = `${messageName} must not contain special characters or numbers.`;
    }

    // Email pattern check (only for 'email' type)
    if (type === 'email' && valueAsString && !/\S+@\S+\.\S+/.test(valueAsString)) {
      errors[name] = `${messageName} is not a valid email.`;
    }

    // Mobile validation (only for 'mobile' type and should be exactly 10 digits)
    if (type === 'mobile' && valueAsString && !/^\d{10}$/.test(valueAsString)) {
      errors[name] = `${messageName} must be exactly 10 digits.`;
    }

    // Date validation (for 'date' type like DOB or Joining Date)
    if (type === 'date' && valueAsString && new Date(valueAsString).toString() === "Invalid Date") {
      errors[name] = `${messageName} is invalid.`;
    }

    // Visibility Priority (integer validation)
    if (type === 'visibilityPriority' && valueAsString && !Number.isInteger(Number(valueAsString))) {
      errors[name] = `${messageName} must be a valid integer.`;
    }

    // Min/Max length validation (if applicable)
    if (minLength && valueAsString.length < minLength) {
      errors[name] =  `${messageName} must be at least ${minLength} characters.`;
    }
    if (maxLength && valueAsString.length > maxLength) {
      errors[name] = `${messageName} must be less than ${maxLength} characters.`;
    }
  });

  return errors;
};
