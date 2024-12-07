// src/components/LocationSearchPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LocationSearch from './LocationSearch';

const LocationSearchPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold">Search Restaurants by Location</h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <LocationSearch />
            </main>
        </div>
    );
};

export default LocationSearchPage;