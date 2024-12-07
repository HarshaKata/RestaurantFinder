// src/components/ReviewsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reviewApi } from '../api/reviewApi';
import { useAuth } from '../contexts/AuthContext';

const ViewReviewsPage = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { restaurantId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchReviews();
    }, [restaurantId]);

    const fetchReviews = async () => {
        try {
            const data = await reviewApi.getReviews(restaurantId);
            setReviews(data);
        } catch (err) {
            setError('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };
    
    const handleBackNavigation = () => {
        if (user.role === 'OWNER') { // OWNER
            navigate('/owner-dashboard');
        } else if (user.role === 'ADMIN') { // ADMIN
            navigate('/admin-dashboard');
        } else { // Regular user
            navigate('/dashboard');
        }
    };
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Restaurant Reviews</h2>
                    <button
                        onClick={handleBackNavigation}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {reviews.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="flex items-center">
                                            <div className="text-yellow-400 mr-2">
                                                {'★'.repeat(review.rating)}
                                                {'☆'.repeat(5 - review.rating)}
                                            </div>
                                            <span className="text-gray-600">
                                                {review.rating} out of 5
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            by {review.user?.firstName || 'Anonymous'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                        No reviews yet for this restaurant.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewReviewsPage;