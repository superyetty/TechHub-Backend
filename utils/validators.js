export const validatedEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatedPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return passwordRegex.test(password);
};

export const validatedPhoneNumber = (num) => {
  const value = num.replace(/\s+/g, "");

  if (value.startsWith("0") && value.length === 11) {
    return "+234" + value.slice(1);
  }

  if (value.startsWith("234") && value.length === 13) {
    return "+" + value;
  }

  if (value.startsWith("+234") && value.length === 14) {
    return value;
  }

  return null;
};
