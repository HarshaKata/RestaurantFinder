// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ReviewsPage from './components/ReviewsPage';
import OwnerDashboard from './components/OwnerDashboard';
import AddRestaurant from './components/AddRestaurant';
import ViewReviewsPage from './components/ViewReviewsPage';
import AdminDashboard from './components/AdminDashboard';
import AddAdminForm from './components/AddAdminForm';
import SignupForm from './components/SignupForm';
import LocationSearchPage from './components/LocationSearchPage';
function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
    <Route path="/login" element={<LoginForm />} />
    <Route
        path="/dashboard"
        element={
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        }
    />
    <Route
        path="/restaurant/:restaurantId"
        element={
            <ProtectedRoute>
                <ReviewsPage />
            </ProtectedRoute>
        }
    />
    
    <Route path="/" element={<Navigate to="/dashboard" />} />
    <Route path="/owner-dashboard" element={<OwnerDashboard />} />
    // In your App.js, add this route
    <Route path="/add-restaurant" element={<AddRestaurant />} />
    // In your App.js, add this route
    <Route path="/restaurant/:restaurantId/viewreview" element={<ViewReviewsPage />} />
    <Route path="/admin-dashboard" element={<AdminDashboard />} />
    // In App.js, add the new route
    <Route path="/add-admin" element={<AddAdminForm />} />
    // In App.js add:
    <Route path="/signup" element={<SignupForm />} />
    <Route path="/location-search" element={<LocationSearchPage />} />
    

</Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;