package com.example.RestaurantFinder.controller;


import com.example.RestaurantFinder.dtos.RestaurantDto;
import com.example.RestaurantFinder.model.Restaurant;
import com.example.RestaurantFinder.service.RestaurantService;
import com.example.RestaurantFinder.utils.ErrorResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RequestMapping("/restaurants")
@RestController
public class RestaurantController {

    @Autowired
    RestaurantService restaurantService;

    @GetMapping("/getRestaurants")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getAllRestaurants() {
        try {
            List<Restaurant> restaurants = restaurantService.getAllRestaurants();
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Error fetching restaurants: " + e.getMessage(),
                            LocalDateTime.now()
                    ));
        }
    }


    @GetMapping("/restaurants/{name}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getRestaurantByName(@PathVariable String name) {
        try {
            List<Restaurant> restaurants = restaurantService.findByName(name);
            if (CollectionUtils.isEmpty(restaurants)) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse(
                                HttpStatus.NOT_FOUND.value(),
                                "Restaurant not found with name: " + name,
                                LocalDateTime.now()
                        ));
            }
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Error searching restaurant: " + e.getMessage(),
                            LocalDateTime.now()
                    ));
        }
    }

        @PostMapping("/addRestaurant")
        @PreAuthorize("hasRole('OWNER')")
        public ResponseEntity<?> addRestaurant(@RequestBody RestaurantDto restaurantDto) {
            try {
                Restaurant savedRestaurant = restaurantService.addRestaurant(restaurantDto);
                return ResponseEntity
                        .status(HttpStatus.CREATED)
                        .body(savedRestaurant);
            } catch (Exception e) {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ErrorResponse(
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "Error adding restaurant: " + e.getMessage(),
                                LocalDateTime.now()
                        ));
            }
        }

    @GetMapping("/getRestaurant/owner")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> getRestaurants() {
        try {
            List<Restaurant> restaurantsByOwner = restaurantService.getRestaurantsForOwner();
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(restaurantsByOwner);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Error adding restaurant: " + e.getMessage(),
                            LocalDateTime.now()
                    ));
        }
    }
}
