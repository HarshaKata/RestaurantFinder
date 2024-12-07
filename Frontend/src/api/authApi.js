


// src/api/authApi.js
const API_BASE_URL = 'http://54.193.78.131:8081';

export const authApi = {
  login: async (credentials) => {
    try {
      console.log('Sending login request with:', credentials); // Debug log
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login error:', errorData); // Debug log
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      console.log('Login response:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Login error:', error); // Debug log
      throw error;
    }
  },
  // ... rest of the code
  // In src/api/authApi.js add:
signup: async (userData) => {
  try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create account');
      }

      return await response.json();
  } catch (error) {
      console.error('Error during signup:', error);
      throw error;
  }
},
  // In src/api/authApi.js, add this function:
  registerAdmin: async (userData) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/admins`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userData.email,
                password: userData.password,
                userName: userData.userName,
                role: 'ADMIN'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create admin account');
        }

        return await response.json();
    } catch (error) {
        console.error('Error registering admin:', error);
        throw error;
    }
}
};

