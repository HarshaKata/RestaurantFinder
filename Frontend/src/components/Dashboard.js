

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { restaurantApi } from '../api/restaurantApi';
// In your Dashboard.js or relevant component
import LocationSearch from './LocationSearch';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Existing search states
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [rating, setRating] = useState('');

    // Location search states
    const [locationInput, setLocationInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [radius, setRadius] = useState(2);

    useEffect(() => {
        fetchRestaurants();
    }, []);
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
    
    const searchByLocation = async () => {
        if (!selectedLocation) {
            setError('Please select a location from the suggestions');
            return;
        }
    
        setLoading(true);
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
            setRestaurants(data);
            setError('');
        } catch (error) {
            console.error('Error:', error);
            setError('Error searching restaurants. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleLocationInputChange = (e) => {
        const value = e.target.value;
        setLocationInput(value);
        setSelectedLocation(null);
    
        clearTimeout(window.debounceTimeout);
        window.debounceTimeout = setTimeout(() => {
            fetchLocationSuggestions(value);
        }, 300);
    };
    
    const handleLocationClear = () => {
        setLocationInput('');
        setSelectedLocation(null);
        setRadius(2);
        setSuggestions([]);
        fetchRestaurants();
    };
    const fetchRestaurants = async () => {
        try {
            const data = await restaurantApi.getAllRestaurants();
            setRestaurants(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch restaurants');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Construct query parameters
            const params = new URLSearchParams();
            if (searchTerm.trim()) params.append('q', searchTerm.trim());
            if (category) params.append('category', category);
            if (priceRange) params.append('price', priceRange); // This will now pass just the number
            if (rating) params.append('rating', rating); // Ensure rating is passed as integer

            // If no filters are applied, fetch all restaurants
            if (!params.toString()) {
                fetchRestaurants();
                return;
            }

            // Make API call to the search endpoint
            const response = await fetch(`http://54.193.78.131:8081/api/search?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to search restaurants');
            }

            const data = await response.json();
            setRestaurants(data);
            setError('');
        } catch (err) {
            setError('Failed to search restaurants');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        setCategory('');
        setPriceRange('');
        setRating('');
        fetchRestaurants();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold">Restaurant Finder</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/location-search')}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Search by Location
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>


            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="mb-6 bg-white p-6 rounded-lg shadow">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
    <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search restaurants by name..."
        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
    
    <div className="relative">
        <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none w-[200px] p-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
            <option value="">Select Category</option>
            <option value="Fine Dining">Fine Dining</option>
            <option value="Casual Dining">Casual Dining</option>
            <option value="Fast Food">Fast Food</option>
            <option value="Cafe">Cafe</option>
            <option value="Bistro">Bistro</option>
            <option value="Pizzeria">Pizzeria</option>
            <option value="Steakhouse">Steakhouse</option>
            {/* <option value="Casual Dining">Casual Dining</option> */}
            <option value="Seafood">Seafood</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Food Truck">Food Truck</option>
            <option value="Buffet">Buffet</option>
            <option value="Pub">Pub</option>
            <option value="Other">Other</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    </div>

    <div className="relative">
        <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="appearance-none w-[200px] p-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
            <option value="">Select Price Range</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    </div>

    <div className="relative">
        <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="appearance-none w-[200px] p-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
            <option value="">Select Rating</option>
            <option value="5">5 ⭐</option>
            <option value="4">4 ⭐</option>
            <option value="3">3 ⭐</option>
            <option value="2">2 ⭐</option>
            <option value="1">1 ⭐</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    </div>
</div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Search
                            </button>
                            {(searchTerm || category || priceRange || rating) && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {restaurants.map((restaurant) => (
        <div key={restaurant.id} className="bg-white overflow-hidden shadow rounded-lg">
            {/* Image Container */}
            <div className="w-full h-48 overflow-hidden">
                {/* {restaurant.image ? ( */}
                    <img
                        src={restaurant.photoUrl}
                        // src='https://restaurants-abhr.s3.us-west-1.amazonaws.com/restaurants/adcc/e94185bb-ae1c-4fd7-b31d-c4f1c7408ae6.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241206T100740Z&X-Amz-SignedHeaders=host&X-Amz-Expires=259200&X-Amz-Credential=AKIAZI2LHILFHE2ELF3B%2F20241206%2Fus-west-1%2Fs3%2Faws4_request&X-Amz-Signature=77a5204ad0fa6eadafa87faa21132659db60d19dd805e4888ea9d3b5f3c2962b'
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentElement.innerHTML = `
                                <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span class="text-gray-500">No Image</span>
                                </div>`;
                        }}
                    />
                {/* ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                    </div>
                )} */}
            </div>

            {/* Restaurant Details */}
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{restaurant.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{restaurant.description}</p>
                <div className="mt-4">
                    <p className="text-sm text-gray-500">Location: {restaurant.address}</p>
                    <p className="text-sm text-gray-500">Cuisine: {restaurant.cuisineType}</p>
                    <button
                        onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                        View Reviews
                    </button>
                </div>
            </div>
        </div>
    ))}
</div>

                {restaurants.length === 0 && !loading && !error && (
                    <div className="text-center text-gray-500 mt-4">
                        No restaurants found.
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;