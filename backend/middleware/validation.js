// Input validation middleware
const validator = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Password strength validation
  isValidPassword: (password) => {
    if (!password || password.length < 8) {
      return false;
    }
    // Must have at least one uppercase, one lowercase, and one number
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber;
  },

  // Sanitize string input
  sanitizeString: (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  },

  // Validate amount
  isValidAmount: (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 1000000; // Max 1 million
  },

  // Validate account number format
  isValidAccountNumber: (accountNumber) => {
    return accountNumber && /^ACC\d+$/.test(accountNumber);
  }
};

module.exports = validator;

