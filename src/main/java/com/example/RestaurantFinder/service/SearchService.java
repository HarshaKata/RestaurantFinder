package com.example.RestaurantFinder.service;

import com.example.RestaurantFinder.model.Restaurant;
import com.example.RestaurantFinder.repo.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.RestaurantFinder.service.GeoCodingService;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SearchService {
    private static final Logger logger = LoggerFactory.getLogger(SearchService.class);
    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private GeoCodingService geoCodingService;
    
    public List<Map<String, Object>> searchRestaurants(
            String query, 
            String category, 
            String price, 
            Double rating) {
            
        List<Object[]> results = restaurantRepository.searchRestaurantsWithRating(
            query, category, price, rating
        );
        
        List<Map<String, Object>> response = new ArrayList<>();
        
        for (Object[] result : results) {
            Map<String, Object> restaurantMap = new HashMap<>();
            
            // Now we know exactly which index corresponds to which column
            restaurantMap.put("id", ((Number) result[0]).longValue());
            restaurantMap.put("name", (String) result[1]);
            restaurantMap.put("category", (String) result[2]);
            restaurantMap.put("cuisineType", (String) result[3]);
            restaurantMap.put("priceRange", (String) result[4]);
            restaurantMap.put("address", (String) result[5]);
            restaurantMap.put("contactInfo", (String) result[6]);
            restaurantMap.put("description", (String) result[7]);
            
            // Average rating is the last column (index 8)
            Double avgRating = ((Number) result[8]).doubleValue();
            restaurantMap.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
            
            response.add(restaurantMap);
        }
        
        return response;
    }
    // public List<Map<String, Object>> searchNearbyRestaurants(String location, double radius) {
    //     Optional<GeoCodingService.LocationCoordinates> coordinates = geoCodingService.getCoordinates(location);
    
    //     if (coordinates.isEmpty()) {
    //         return new ArrayList<>();
    //     }
    
    //     List<Object[]> results = restaurantRepository.findNearbyRestaurants(
    //         coordinates.get().latitude(),
    //         coordinates.get().longitude(),
    //         radius
    //     );
    
    //     List<Map<String, Object>> response = new ArrayList<>();
        
    //     for (Object[] result : results) {
    //         Map<String, Object> restaurantMap = new HashMap<>();
    //         restaurantMap.put("id", ((Number) result[0]).longValue());
    //         restaurantMap.put("name", (String) result[1]);
    //         restaurantMap.put("category", (String) result[2]);
    //         restaurantMap.put("cuisineType", (String) result[3]);
    //         restaurantMap.put("priceRange", (String) result[4]);
    //         restaurantMap.put("address", (String) result[5]);
    //         restaurantMap.put("contactInfo", (String) result[6]);
    //         restaurantMap.put("description", (String) result[7]);
    //         restaurantMap.put("latitude", (Double) result[8]);
    //         restaurantMap.put("longitude", (Double) result[9]);
    //         restaurantMap.put("averageRating", Math.round(((Number) result[10]).doubleValue() * 10.0) / 10.0);
    //         restaurantMap.put("distance", Math.round(((Number) result[11]).doubleValue() * 100.0) / 100.0);
    //         response.add(restaurantMap);
    //     }
        
    //     return response;
    // }
    public List<Map<String, Object>> searchNearbyRestaurants(
            Double latitude, 
            Double longitude, 
            Double radius) {
            
        // Search for restaurants within the radius (in kilometers)
        List<Object[]> results = restaurantRepository.findNearbyRestaurants(
            latitude, longitude, radius
        );
        
        List<Map<String, Object>> response = new ArrayList<>();
        
        for (Object[] result : results) {
            try {
                Map<String, Object> restaurantMap = new HashMap<>();
                
                restaurantMap.put("id", ((Number) result[0]).longValue());
                restaurantMap.put("name", (String) result[1]);
                restaurantMap.put("category", (String) result[2]);
                restaurantMap.put("cuisineType", (String) result[3]);
                restaurantMap.put("priceRange", (String) result[4]);
                restaurantMap.put("address", (String) result[5]);
                restaurantMap.put("contactInfo", (String) result[6]);
                restaurantMap.put("description", (String) result[7]);
                restaurantMap.put("latitude", (Double) result[8]);
                restaurantMap.put("longitude", (Double) result[9]);
                restaurantMap.put("averageRating", Math.round(((Number) result[10]).doubleValue() * 10.0) / 10.0);
                restaurantMap.put("distance", Math.round(((Number) result[11]).doubleValue() * 100.0) / 100.0);
                
                response.add(restaurantMap);
            } catch (Exception e) {
                logger.error("Error mapping restaurant result", e);
            }
        }
        
        return response;
    }
    
}