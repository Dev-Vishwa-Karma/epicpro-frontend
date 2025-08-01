export const validateFields = (fields) => {
  const errors = {};
  let fromDateValue = null;
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  // First pass: find from_date value
  fields.forEach((field) => {
    if (field.name === 'from_date' && field.value) {
      fromDateValue = new Date(field.value);
      fromDateValue.setHours(0, 0, 0, 0);
    }
  });

  // Second pass: validate all fields
  fields.forEach((field) => {
    const { name, value, type, required, minLength, maxLength, customValidator, messageName } = field;
    
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

    // if (type === 'date' && valueAsString && new Date(valueAsString).toString() === "Invalid Date") {
    //   errors[name] = `${messageName} is invalid.`;
    // }

    if (type === 'date' && valueAsString) {
      const parsedDate = new Date(valueAsString);
      if (parsedDate.toString() === "Invalid Date") {
        errors[name] = `${messageName} is invalid.`;
      } else if (name.toLowerCase().includes('dob') && parsedDate > today) {
        errors[name] = `${messageName} cannot be in the future.`;
      }
    }

    // Leave date validation (allows future dates)
    if (type === 'leave_date' && valueAsString) {
      const parsedDate = new Date(valueAsString);

      if (parsedDate.toString() === "Invalid Date") {
        errors[name] = `${messageName} is invalid.`;
      } else if (name === 'to_date' && fromDateValue && parsedDate) {
        parsedDate.setHours(0, 0, 0, 0);
        console.log('Comparing leave to_date:', parsedDate, 'with from_date:', fromDateValue);
        if (parsedDate < fromDateValue) {
          errors[name] = "To date cannot be earlier than from date";
        }
      }
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
