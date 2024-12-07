// src/api/restaurantApi.js
const API_BASE_URL = 'http://54.193.78.131:8081';

export const restaurantApi = {
  getAllRestaurants: async () => {
    const token = localStorage.getItem('token');
    try {
      console.log('Making request with token:', token); // Debug log
      const response = await fetch(`${API_BASE_URL}/restaurants/getRestaurants`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Response status:', response.status); // Debug log
        throw new Error('Failed to fetch restaurants');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  },

  searchRestaurants: async (name) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/restaurants/${name}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search restaurants');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching restaurants:', error);
      throw error;
    }
  },
  getOwnerRestaurants: async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/restaurants/getRestaurant/owner`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch owner restaurants');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching owner restaurants:', error);
            throw error;
        }
    },
    addRestaurant: async (restaurantData) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/restaurants/addRestaurant`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(restaurantData)
            });
    
            if (!response.ok) {
                throw new Error('Failed to add restaurant');
            }
    
            return await response.json();
        } catch (error) {
            console.error('Error adding restaurant:', error);
            throw error;
        }
    },
    // In src/api/restaurantApi.js
updateRestaurant: async (restaurantData) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/updateRestaurant`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(restaurantData)
        });

        if (!response.ok) {
            throw new Error('Failed to update restaurant');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating restaurant:', error);
        throw error;
    }
},
// In src/api/restaurantApi.js
getDuplicateRestaurants: async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/getDuplicateRestaurants`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch duplicate restaurants');
        return await response.json();
    } catch (error) {
        console.error('Error fetching duplicate restaurants:', error);
        throw error;
    }
},
// In src/api/restaurantApi.js
// In restaurantApi.js
deleteRestaurant: async (restaurantId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/deleteRestaurant?restaurantId=${restaurantId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete restaurant');
        }

        // Don't try to parse as JSON since it's a text response
        return await response.text();
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        throw error;
    }
}
};