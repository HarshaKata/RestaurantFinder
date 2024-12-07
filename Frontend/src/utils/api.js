// src/utils/api.js
const createApiRequest = (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };