// src/components/ReviewsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reviewApi } from '../api/reviewApi';

const ReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newReview, setNewReview] = useState({
        rating: 5,
        comments: ''
    });
    const { restaurantId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchReviews();
    }, [restaurantId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await reviewApi.getReviews(restaurantId);
            setReviews(data);
        } catch (err) {
            setError('Failed to load reviews');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            await reviewApi.addReview({
                restaurantId: parseInt(restaurantId),
                rating: parseInt(newReview.rating),
                comments: newReview.comments
            });
            setNewReview({ rating: 5, comments: '' }); // Reset form
            fetchReviews(); // Reload reviews
        } catch (err) {
            setError('Failed to add review');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Restaurant Reviews</h2>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Back to Restaurants
                    </button>
                </div>

                {/* Add Review Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-4">Add Your Review</h3>
                    <form onSubmit={handleSubmitReview}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Rating</label>
                            <select
                                value={newReview.rating}
                                onChange={(e) => setNewReview({...newReview, rating: e.target.value})}
                                className="w-full p-2 border rounded-md"
                            >
                                {[5,4,3,2,1].map(num => (
                                    <option key={num} value={num}>
                                        {num} Star{num !== 1 ? 's' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Comments</label>
                            <textarea
                                value={newReview.comments}
                                onChange={(e) => setNewReview({...newReview, comments: e.target.value})}
                                className="w-full p-2 border rounded-md"
                                rows="4"
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                        >
                            Submit Review
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                {/* Reviews List */}
                <div className="bg-white rounded-lg shadow-md">
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <div key={review.id} className={`p-6 ${index !== 0 ? 'border-t' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="text-yellow-500 text-xl">
                                            {'★'.repeat(review.rating)}
                                            {'☆'.repeat(5 - review.rating)}
                                        </span>
                                        <span className="ml-2 text-gray-600">
                                            by {review.user?.firstName || 'Anonymous'}
                                        </span>
                                    </div>
                                </div>
                                <p className="mt-2 text-gray-700">{review.comment}</p>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            No reviews yet. Be the first to review!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewsPage;