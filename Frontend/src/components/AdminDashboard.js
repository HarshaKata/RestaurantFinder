// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { restaurantApi } from '../api/restaurantApi';

const AdminDashboard = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [duplicates, setDuplicates] = useState([]);
    const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
    const [duplicatesLoading, setDuplicatesLoading] = useState(false);
    const [duplicatesError, setDuplicatesError] = useState('');

    useEffect(() => {
        fetchRestaurants();
    }, []);
    // const handleShowDuplicates = async () => {
    //     setDuplicatesLoading(true);
    //     setDuplicatesError('');
    //     try {
    //         const data = await restaurantApi.getDuplicateRestaurants();
    //         setDuplicates(data);
    //         setShowDuplicatesModal(true);
    //     } catch (err) {
    //         setDuplicatesError('Failed to fetch duplicate restaurants');
    //         console.error(err);
    //     } finally {
    //         setDuplicatesLoading(false);
    //     }
    // };
    // const handleDeleteRestaurant = async (restaurantId) => {
    //     if (window.confirm('Are you sure you want to delete this restaurant?')) {
    //         try {
    //             setError('');
    //             await restaurantApi.deleteRestaurant(restaurantId);
    //             // Update the restaurants state by filtering out the deleted restaurant
    //             setRestaurants(prevRestaurants => 
    //                 prevRestaurants.filter(restaurant => restaurant.id !== restaurantId)
    //             );
    //         } catch (err) {
    //             console.error('Delete error:', err);
    //             setError('Failed to delete restaurant');
    //         }
    //     }
    // };
    const handleDeleteRestaurant = async (restaurantId) => {
        if (window.confirm('Are you sure you want to delete this restaurant?')) {
            try {
                setError('');
                await restaurantApi.deleteRestaurant(restaurantId);
                // Update main restaurant list
                setRestaurants(prevRestaurants => 
                    prevRestaurants.filter(restaurant => restaurant.id !== restaurantId)
                );
                // If we're in duplicates modal, refresh the duplicates list
                if (showDuplicatesModal) {
                    refreshDuplicates();
                }
            } catch (err) {
                console.error('Delete error:', err);
                setError('Failed to delete restaurant');
            }
        }
    };
    const refreshDuplicates = async () => {
        try {
            const data = await restaurantApi.getDuplicateRestaurants();
            setDuplicates(data);
        } catch (err) {
            setDuplicatesError('Failed to refresh duplicate restaurants');
            console.error(err);
        }
    };
    const handleShowDuplicates = async () => {
        setDuplicatesLoading(true);
        setDuplicatesError('');
        try {
            await refreshDuplicates();
            setShowDuplicatesModal(true);
        } catch (err) {
            setDuplicatesError('Failed to fetch duplicate restaurants');
            console.error(err);
        } finally {
            setDuplicatesLoading(false);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const data = await restaurantApi.getAllRestaurants();
            setRestaurants(data);
        } catch (err) {
            setError('Failed to fetch restaurants');
            console.error(err);
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
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/add-admin')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Add Admin
                </button>
                <button
        onClick={handleShowDuplicates}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        disabled={duplicatesLoading}
    >
        {duplicatesLoading ? 'Loading...' : 'Remove Duplicates'}
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
                <h2 className="text-2xl font-bold mb-6">All Restaurants</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

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
            <div className="mt-4">
                <p className="text-sm text-gray-500">Location: {restaurant.location}</p>
                <p className="text-sm text-gray-500">Cuisine: {restaurant.cuisine}</p>
                <p className="text-sm text-gray-500">Owner: {restaurant.owner?.firstName || 'Unknown'}</p>
            </div>
            <div className="mt-4 flex space-x-4">
                <button
                    onClick={() => navigate(`/restaurant/${restaurant.id}/viewreview`)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    View Reviews
                </button>
                <button
    onClick={() => handleDeleteRestaurant(restaurant.id)}
    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
>
    Delete
</button>
            </div>
        </div>
    </div>
))}
                </div>
                {showDuplicatesModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Duplicate Restaurants</h3>
                    <button
                        onClick={() => setShowDuplicatesModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                {duplicatesError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {duplicatesError}
                    </div>
                )}

                {duplicatesLoading ? (
                    <div className="text-center py-4">Loading duplicates...</div>
                ) : duplicates.length === 0 ? (
                    <div className="text-center py-4 text-gray-600">
                        No duplicate restaurants found.
                    </div>
                ) : (
                    <div className="space-y-4">
{duplicates.map((restaurant) => (
        <div key={restaurant.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold text-lg">{restaurant.name}</h4>
                    <p className="text-sm text-gray-600">{restaurant.address}</p>
                    <p className="text-sm text-gray-500">
                        Owner: {restaurant.owner?.firstName || 'Unknown'}
                    </p>
                    <div className="mt-2">
                        <p className="text-sm">Cuisine: {restaurant.cuisineType}</p>
                        <p className="text-sm">Contact: {restaurant.contactInfo}</p>
                    </div>
                </div>
                <button
                    onClick={async () => {
                        await handleDeleteRestaurant(restaurant.id);
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                    Delete
                </button>
            </div>
        </div>
    ))}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => setShowDuplicatesModal(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )}
                {restaurants.length === 0 && (
                    <p className="text-center text-gray-500 mt-4">
                        No restaurants found.
                    </p>
                )}
            </main>
        </div>
        
    );
};

export default AdminDashboard;