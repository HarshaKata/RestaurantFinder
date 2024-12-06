package com.example.RestaurantFinder.service;


import com.example.RestaurantFinder.dtos.RestaurantDto;
import com.example.RestaurantFinder.model.Restaurant;
import com.example.RestaurantFinder.model.User;
import com.example.RestaurantFinder.repo.RestaurantRepository;
import com.example.RestaurantFinder.repo.UserRepository;
import com.example.RestaurantFinder.utils.SecurityUtils;
import io.jsonwebtoken.Jwt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RestaurantService {

    @Autowired
    RestaurantRepository restaurantRepository;

    @Autowired
    UserRepository userRepository;
    public List<Restaurant> getAllRestaurants(){
        return restaurantRepository.findAll();
    }

    public List<Restaurant> findByName(String restaurantName){
        return restaurantRepository.findAllByName(restaurantName);
    }


    public Restaurant addRestaurant(RestaurantDto restaurantDto) {
        // Get the current user's ID from JWT token
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        Long userId =  SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(userId).get();
        Restaurant newRestaurant = new Restaurant();
        newRestaurant.setDescription(restaurantDto.getDescription());
        newRestaurant.setName(restaurantDto.getName());
        newRestaurant.setCategory(restaurantDto.getCategory());
        newRestaurant.setAddress(restaurantDto.getAddress());
        newRestaurant.setContactInfo(restaurantDto.getContactInfo());
        newRestaurant.setCuisineType(restaurantDto.getCuisineType());
        newRestaurant.setLatitude(Double.valueOf(restaurantDto.getLatitude()));
        newRestaurant.setLongitude(Double.valueOf(restaurantDto.getLongitude()));
        newRestaurant.setOwner(currentUser);
        newRestaurant.setPriceRange(restaurantDto.getPriceRange());
        return restaurantRepository.save(newRestaurant);
    }

    public Restaurant updateRestaurant(RestaurantDto restaurantDto) {
        // Get the current user's ID from JWT token
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        Long userId =  SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(userId).get();

        Restaurant newRestaurant = new Restaurant();
        newRestaurant.setDescription(restaurantDto.getDescription());
        newRestaurant.setName(restaurantDto.getName());
        newRestaurant.setCategory(restaurantDto.getCategory());
        newRestaurant.setAddress(restaurantDto.getAddress());
        newRestaurant.setContactInfo(restaurantDto.getContactInfo());
        newRestaurant.setCuisineType(restaurantDto.getCuisineType());
        newRestaurant.setLatitude(Double.valueOf(restaurantDto.getLatitude()));
        newRestaurant.setLongitude(Double.valueOf(restaurantDto.getLongitude()));
        newRestaurant.setOwner(currentUser);
        newRestaurant.setPriceRange(restaurantDto.getPriceRange());
        // Set the owner ID

        return restaurantRepository.save(newRestaurant);
    }

    public List<Restaurant> getRestaurantsForOwner() {
        Long userId =  SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(userId).get();
        return restaurantRepository.findAllByOwner(currentUser);
    }


}
