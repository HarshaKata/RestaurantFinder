// src/components/LocationSearch.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const LocationSearch = () => {
    const navigate = useNavigate(); // Add this line
    const [locationInput, setLocationInput] = useState('');
    // const [locationInput, setLocationInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [radius, setRadius] = useState(2);
    const [restaurants, setRestaurants] = useState([]);
    const [error, setError] = useState('');

    const fetchLocationSuggestions = async (query) => {
        if (query.length < 3) return;
        
        try {
            const response = await fetch(
                `http://54.193.78.131:8081/api/search/locations?query=${encodeURIComponent(query)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            if (!response.ok) throw new Error('Failed to fetch suggestions');
            
            const data = await response.json();
            
            setSuggestions(data);
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to fetch location suggestions');
        }
    };

    const selectLocation = (displayName, latitude, longitude) => {
        setLocationInput(displayName);
        setSelectedLocation({ displayName, latitude, longitude });
        setSuggestions([]); // Clear suggestions
    };

    const searchRestaurants = async () => {
        if (!selectedLocation) {
            setError('Please select a location from the suggestions');
            return;
        }

        try {
            const response = await fetch(
                `http://54.193.78.131:8081/api/search/nearby?latitude=${selectedLocation.latitude}&longitude=${selectedLocation.longitude}&radius=${radius}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            if (!response.ok) throw new Error('Search failed');
            
            const data = await response.json();
            console.log('Restaurant data:', data);
            setRestaurants(data);

            setError('');
        } catch (error) {
            console.error('Error:', error);
            setError('Error searching restaurants. Please try again.');
        }
    };

    // Debounce function for input
    let debounceTimeout;
    const handleInputChange = (e) => {
        const value = e.target.value;
        setLocationInput(value);
        setSelectedLocation(null); // Clear selected location when input changes

        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            fetchLocationSuggestions(value);
        }, 300);
    };

    return (
        <div>
            <div className="mb-6 relative">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={locationInput}
                        onChange={handleInputChange}
                        placeholder="Enter location (e.g., San Jose, CA)"
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        autoComplete="off"
                    />
                    <input
                        type="number"
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        min="0.1"
                        max="10"
                        step="0.1"
                        className="w-20 p-2 border border-gray-300 rounded-md"
                    />
                    <button
                        onClick={searchRestaurants}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Search
                    </button>
                </div>

                {/* Location Suggestions */}
                {suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => selectLocation(
                                    suggestion.displayName,
                                    suggestion.latitude,
                                    suggestion.longitude
                                )}
                            >
                                {suggestion.displayName}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {/* Restaurant Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {restaurants.map((restaurant, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold">{restaurant.name}</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>{restaurant.address}</p>
                <p>Distance: {restaurant.distance.toFixed(2)} km</p>
                <p>Rating: {restaurant.source === 'osmrestaurant' ? 'N/A' : `${restaurant.averageRating} ⭐`}</p>
                <p>Category: {restaurant.category || 'N/A'}</p>
                <p>Cuisine: {restaurant.cuisineType || 'N/A'}</p>
                <p>Price Range: {restaurant.priceRange || 'N/A'}</p>
                <p>Contact: {restaurant.contactInfo || 'N/A'}</p>
            </div>
            {restaurant.source === 'Database' && (
                <button
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    View Reviews
                </button>
            )}
        </div>
    ))}
</div>

            {restaurants.length === 0 && !error && (
                <div className="text-center text-gray-500">
                    No restaurants found in this area.
                </div>
            )}
        </div>
    );
};

export default LocationSearch;