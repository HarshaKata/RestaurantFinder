// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { restaurantApi } from '../api/restaurantApi';

// const AddRestaurant = () => {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [addressSuggestions, setAddressSuggestions] = useState([]);
//     const [showSuggestions, setShowSuggestions] = useState(false);

//     const categories = [
//         "Fine Dining",
//         "Casual Dining",
//         "Fast Food",
//         "Café",
//         "Bistro",
//         "Pizzeria",
//         "Steakhouse",
//         "Seafood",
//         "Vegetarian",
//         "Food Truck",
//         "Buffet",
//         "Pub",
//         "Other"
//     ];

//     const [formData, setFormData] = useState({
//         name: '',
//         description: '',
//         category: '',
//         address: '',
//         contactInfo: '',
//         cuisineType: '',
//         latitude: '',
//         longitude: '',
//         priceRange: '',
//         restaurantId: ''
//     });

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         // Check if all required fields are filled
//         if (!formData.latitude || !formData.longitude) {
//             setError('Please select a valid address from the suggestions');
//             setLoading(false);
//             return;
//         }

//         try {
//             const response = await fetch('http://localhost:8081/restaurants/addRestaurant', {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('token')}`,
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(formData)
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to add restaurant');
//             }

//             // If successful, navigate back to owner dashboard
//             navigate('/owner-dashboard');
//         } catch (err) {
//             console.error('Error adding restaurant:', err);
//             setError('Failed to add restaurant. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleAddressChange = async (e) => {
//         const address = e.target.value;
//         setFormData(prev => ({ ...prev, address }));

//         if (address.length > 3) {
//             try {
//                 const response = await fetch(
//                     `http://localhost:8081/api/search/locations?query=${encodeURIComponent(address)}`,
//                     {
//                         headers: {
//                             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//                             'Accept': 'application/json'
//                         }
//                     }
//                 );

//                 if (!response.ok) throw new Error('Failed to fetch location data');

//                 const suggestions = await response.json();
//                 setAddressSuggestions(suggestions);
//                 setShowSuggestions(true);
//             } catch (error) {
//                 console.error('Error fetching addresses:', error);
//             }
//         } else {
//             setAddressSuggestions([]);
//             setShowSuggestions(false);
//         }
//     };

//     const handleSelectAddress = (suggestion) => {
//         setFormData(prev => ({
//             ...prev,
//             address: suggestion.displayName,
//             latitude: suggestion.latitude,
//             longitude: suggestion.longitude
//         }));
//         setShowSuggestions(false);
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-2xl mx-auto">
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                     <div className="flex justify-between items-center mb-6">
//                         <h2 className="text-2xl font-bold">Add New Restaurant</h2>
//                         <button
//                             onClick={() => navigate('/owner-dashboard')}
//                             className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
//                         >
//                             Back
//                         </button>
//                     </div>

//                     {error && (
//                         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//                             {error}
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         {/* Name field */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Name</label>
//                             <input
//                                 type="text"
//                                 name="name"
//                                 required
//                                 value={formData.name}
//                                 onChange={handleChange}
//                                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
//                             />
//                         </div>

//                         {/* Category dropdown */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Category</label>
//                             <select
//                                 name="category"
//                                 required
//                                 value={formData.category}
//                                 onChange={handleChange}
//                                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
//                             >
//                                 <option value="">Select a category</option>
//                                 {categories.map((category, index) => (
//                                     <option key={index} value={category}>
//                                         {category}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* Address field with suggestions */}
//                         <div className="relative">
//                             <label className="block text-sm font-medium text-gray-700">Address</label>
//                             <input
//                                 type="text"
//                                 name="address"
//                                 required
//                                 value={formData.address}
//                                 onChange={handleAddressChange}
//                                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
//                             />
//                             {showSuggestions && addressSuggestions.length > 0 && (
//                                 <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
//                                     {addressSuggestions.map((suggestion, index) => (
//                                         <div
//                                             key={index}
//                                             className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                                             onClick={() => handleSelectAddress(suggestion)}
//                                         >
//                                             {suggestion.displayName}
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Coordinates display */}
//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Latitude</label>
//                                 <input
//                                     type="text"
//                                     value={formData.latitude}
//                                     readOnly
//                                     className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Longitude</label>
//                                 <input
//                                     type="text"
//                                     value={formData.longitude}
//                                     readOnly
//                                     className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
//                                 />
//                             </div>
//                         </div>
                        

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Contact Info</label>
//                             <input
//                                 type="text"
//                                 name="contactInfo"
//                                 required
//                                 value={formData.contactInfo}
//                                 onChange={handleChange}
//                                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Description</label>
//                             <textarea
//                                 name="description"
//                                 required
//                                 value={formData.description}
//                                 onChange={handleChange}
//                                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Cuisine Type</label>
//                             <input
//                                 type="text"
//                                 name="cuisineType"
//                                 required
//                                 value={formData.cuisineType}
//                                 onChange={handleChange}
//                                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Price Range</label>
//                             <input
//                                 type="text"
//                                 name="priceRange"
//                                 required
//                                 value={formData.priceRange}
//                                 onChange={handleChange}
//                                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
//                             />
//                         </div>

//                         <div className="flex justify-end">
//                             <button
//                                 type="submit"
//                                 disabled={loading || !formData.latitude || !formData.longitude}
//                                 className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
//                                     (loading || !formData.latitude || !formData.longitude) ? 'opacity-50 cursor-not-allowed' : ''
//                                 }`}
//                             >
//                                 {loading ? 'Adding...' : 'Add Restaurant'}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AddRestaurant;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddRestaurant = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const categories = [
        "Fine Dining",
        "Casual Dining",
        "Fast Food",
        "Café",
        "Bistro",
        "Pizzeria",
        "Steakhouse",
        "Seafood",
        "Vegetarian",
        "Food Truck",
        "Buffet",
        "Pub",
        "Other"
    ];

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        address: '',
        contactInfo: '',
        cuisineType: '',
        latitude: '',
        longitude: '',
        priceRange: '',
        restaurantId: ''
    });

    useEffect(() => {
        // Cleanup function to revoke object URL when component unmounts
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const formDataToSend = new FormData();
        formDataToSend.append('restaurantDetails', new Blob(
            [JSON.stringify({
                name: formData.name,
                description: formData.description,
                category: formData.category,
                address: formData.address,
                contactInfo: formData.contactInfo,
                cuisineType: formData.cuisineType,
                latitude: formData.latitude.toString(),
                longitude: formData.longitude.toString(),
                priceRange: formData.priceRange
            })], 
            { type: 'application/json' }
        ));

        if (selectedImage) {
            formDataToSend.append('restaurantImage', selectedImage);
        }
        for (let pair of formDataToSend.entries()) {
            console.log(pair[0], pair[1]);
        }

        const response = await fetch('http://54.193.78.131:8081/restaurants/addRestaurant', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json',
            },
            body: formDataToSend
        });

        if (!response.ok) throw new Error('Failed to add restaurant');
        navigate('/owner-dashboard');
    } catch (err) {
        setError('Failed to add restaurant. Please try again.');
    } finally {
        setLoading(false);
    }
};

    const handleAddressChange = async (e) => {
        const address = e.target.value;
        setFormData(prev => ({ ...prev, address }));

        if (address.length > 3) {
            try {
                const response = await fetch(
                    `http://54.193.78.131:8081/api/search/locations?query=${encodeURIComponent(address)}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Accept': 'application/json'
                        }
                    }
                );

                if (!response.ok) throw new Error('Failed to fetch location data');

                const suggestions = await response.json();
                setAddressSuggestions(suggestions);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error fetching addresses:', error);
            }
        } else {
            setAddressSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectAddress = (suggestion) => {
        setFormData(prev => ({
            ...prev,
            address: suggestion.displayName,
            latitude: suggestion.latitude,
            longitude: suggestion.longitude
        }));
        setShowSuggestions(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Add New Restaurant</h2>
                        <button
                            onClick={() => navigate('/owner-dashboard')}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Back
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Category dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                name="category"
                                required
                                value={formData.category}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">Select a category</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Address field with suggestions */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                type="text"
                                name="address"
                                required
                                value={formData.address}
                                onChange={handleAddressChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {showSuggestions && addressSuggestions.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {addressSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleSelectAddress(suggestion)}
                                        >
                                            {suggestion.displayName}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Coordinates display */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                                <input
                                    type="text"
                                    value={formData.latitude}
                                    readOnly
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                                <input
                                    type="text"
                                    value={formData.longitude}
                                    readOnly
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Restaurant Image</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {imagePreview ? (
                                        <div className="mb-4">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="mx-auto h-32 w-auto"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedImage(null);
                                                    setImagePreview(null);
                                                }}
                                                className="mt-2 text-sm text-red-600 hover:text-red-700"
                                            >
                                                Remove image
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 48 48"
                                            >
                                                <path
                                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <div className="flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                                >
                                                    <span>Upload a file</span>
                                                    <input
                                                        id="file-upload"
                                                        name="file-upload"
                                                        type="file"
                                                        className="sr-only"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, GIF up to 5MB
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Info</label>
                            <input
                                type="text"
                                name="contactInfo"
                                required
                                value={formData.contactInfo}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cuisine Type</label>
                            <input
                                type="text"
                                name="cuisineType"
                                required
                                value={formData.cuisineType}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price Range</label>
                            <input
                                type="text"
                                name="priceRange"
                                required
                                value={formData.priceRange}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !formData.latitude || !formData.longitude}
                                className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                    (loading || !formData.latitude || !formData.longitude) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Adding...' : 'Add Restaurant'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddRestaurant;