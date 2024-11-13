package com.example.RestaurantFinder.controller;

import com.example.RestaurantFinder.service.SearchService;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.RestaurantFinder.service.GeoCodingService;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestController
@RequestMapping("/api/search")
public class SearchController {

    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);
    
    @Autowired
    private SearchService searchService;

    @Autowired
    private GeoCodingService geoCodingService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Map<String, Object>>> searchRestaurants(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String price,
            @RequestParam(required = false) Double rating) {
            
        List<Map<String, Object>> results = searchService.searchRestaurants(
            q, category, price, rating
        );
        return ResponseEntity.ok(results);
    }

    @GetMapping(value = "/nearby", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'OWNER')")
    public ResponseEntity<List<Map<String, Object>>> searchNearbyRestaurants(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "2.0") Double radius) {
        
        logger.info("Searching restaurants near lat: {}, lon: {}, radius: {}", latitude, longitude, radius);
        
        try {
            List<Map<String, Object>> results = searchService.searchNearbyRestaurants(latitude, longitude, radius);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Error searching restaurants", e);
            throw e;
        }
    }
    @GetMapping("/locations")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'OWNER')")
    public ResponseEntity<List<GeoCodingService.LocationSuggestion>> getLocationSuggestions(
            @RequestParam String query) {
        System.out.println("enterted");
        logger.info("Received location search request for query: {}", query);
        
        if (query == null || query.trim().length() < 3) {
            logger.info("Query too short, returning empty list");
            return ResponseEntity.ok(List.of());
        }

        List<GeoCodingService.LocationSuggestion> suggestions = 
            geoCodingService.getLocationSuggestions(query.trim());
        
        logger.info("Returning {} suggestions for query: {}", suggestions.size(), query);
        return ResponseEntity.ok(suggestions);
    }

    @GetMapping("/test")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'OWNER')")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Search API is working!");
    }

}