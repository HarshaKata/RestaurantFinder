package com.example.RestaurantFinder.controller;

import com.example.RestaurantFinder.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    
    @Autowired
    private SearchService searchService;
    
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
}