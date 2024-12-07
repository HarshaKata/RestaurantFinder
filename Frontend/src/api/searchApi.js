// src/api/searchApi.js
const API_BASE_URL = 'http://54.193.78.131:8081';

export const searchApi = {
    getLocationSuggestions: async (query) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/search/locations?query=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch suggestions');
            return await response.json();
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
            throw error;
        }
    },

    getNearbyRestaurants: async (latitude, longitude, radius = 2.0) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/search/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch nearby restaurants');
            return await response.json();
        } catch (error) {
            console.error('Error fetching nearby restaurants:', error);
            throw error;
        }
    }
};