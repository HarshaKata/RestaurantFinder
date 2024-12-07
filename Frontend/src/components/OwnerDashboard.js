// src/components/OwnerDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { restaurantApi } from '../api/restaurantApi';

const OwnerDashboard = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    useEffect(() => {
        fetchOwnerRestaurants();
    }, []);
    const handleUpdate = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setShowUpdateModal(true);
    };

    const handleUpdateSubmit = async (updatedData) => {
        try {
            await restaurantApi.updateRestaurant({
                ...updatedData,
                restaurantId: selectedRestaurant.id
            });
            setShowUpdateModal(false);
            fetchOwnerRestaurants(); // Refresh the list
            setError('');
        } catch (err) {
            setError('Failed to update restaurant');
        }
    };
    const fetchOwnerRestaurants = async () => {
        try {
            const data = await restaurantApi.getOwnerRestaurants();
            setRestaurants(data);
            setError('');
        } catch (err) {
            console.error('Error fetching restaurants:', err);
            setError('Failed to fetch your restaurants');
        } finally {
            setLoading(false);
        }
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
                            <h1 className="text-xl font-bold">Restaurant Owner Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/add-restaurant')}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Add New Restaurant
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
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <h2 className="text-2xl font-bold mb-6">My Restaurants</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map((restaurant) => (
                        <div key={restaurant.id} className="bg-white overflow-hidden shadow rounded-lg">
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
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {restaurant.name}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    {restaurant.description}
                                </p>
                                <div className="mt-4 space-y-2">
                                    <p className="text-sm text-gray-500">
                                        Category: {restaurant.category}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Cuisine: {restaurant.cuisineType}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Price Range: {restaurant.priceRange}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Address: {restaurant.address}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Contact: {restaurant.contactInfo}
                                    </p>
                                </div>
                                <div className="mt-4 flex space-x-4">
                                    <button
                                        onClick={() => handleUpdate(restaurant)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Update Details
                                    </button>
                                    <button
                                        onClick={() => navigate(`/restaurant/${restaurant.id}/viewreview`)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        View Reviews
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {showUpdateModal && selectedRestaurant && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
                    <h2 className="text-2xl font-bold mb-4">Update Restaurant</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateSubmit(selectedRestaurant);
                    }}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={selectedRestaurant.name}
                                    onChange={(e) => setSelectedRestaurant({
                                        ...selectedRestaurant,
                                        name: e.target.value
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={selectedRestaurant.description}
                                    onChange={(e) => setSelectedRestaurant({
                                        ...selectedRestaurant,
                                        description: e.target.value
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    value={selectedRestaurant.address}
                                    onChange={(e) => setSelectedRestaurant({
                                        ...selectedRestaurant,
                                        address: e.target.value
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cuisine Type</label>
                                <input
                                    type="text"
                                    value={selectedRestaurant.cuisineType}
                                    onChange={(e) => setSelectedRestaurant({
                                        ...selectedRestaurant,
                                        cuisineType: e.target.value
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact Info</label>
                                <input
                                    type="text"
                                    value={selectedRestaurant.contactInfo}
                                    onChange={(e) => setSelectedRestaurant({
                                        ...selectedRestaurant,
                                        contactInfo: e.target.value
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hours</label>
                                <input
                                    type="text"
                                    value={selectedRestaurant.hours}
                                    onChange={(e) => setSelectedRestaurant({
                                        ...selectedRestaurant,
                                        hours: e.target.value
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowUpdateModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
                {restaurants.length === 0 && (
                    <div className="text-center text-gray-500 mt-4">
                        You haven't added any restaurants yet.
                    </div>
                )}
            </main>
        </div>
    );
};

export default OwnerDashboard;



