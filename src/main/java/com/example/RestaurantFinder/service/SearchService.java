package com.example.RestaurantFinder.service;

import com.example.RestaurantFinder.model.Restaurant;
import com.example.RestaurantFinder.repo.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SearchService {
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
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
}