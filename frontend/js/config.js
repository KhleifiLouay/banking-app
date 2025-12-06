// API Configuration
// Change this to your backend URL when deploying
const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_BASE };
}

