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
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.io.IOException;

// import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
@Service
public class RestaurantService {

    @Autowired
    RestaurantRepository restaurantRepository;

    @Autowired
    UserRepository userRepository;
    @Autowired
    S3Service s3Service;

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public List<Restaurant> findByName(String restaurantName) {
        return restaurantRepository.findAllByName(restaurantName);
    }

    public Restaurant addRestaurant(RestaurantDto restaurantDto) {
        // Get the current user's ID from JWT token
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        Long userId = SecurityUtils.getCurrentUserId();
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
        newRestaurant.setPhotoUrl(restaurantDto.getPhotoUrl());
        return restaurantRepository.save(newRestaurant);
    }

    public Restaurant updateRestaurant(RestaurantDto restaurantDto) {
        // Get the current user's ID from JWT token
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        Long userId = SecurityUtils.getCurrentUserId();
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
        Long userId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(userId).get();
        return restaurantRepository.findAllByOwner(currentUser);
    }

    public String uploadRestaurantPhoto(Long restaurantId, MultipartFile file) throws IOException {
        // Validate file
        validateImageFile(file);

        // Find the restaurant
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        // Delete existing photo if exists
        if (restaurant.getPhotoUrl() != null) {
            s3Service.deleteFile(restaurant.getPhotoUrl());
        }

        // Upload new photo
        String photoUrl = s3Service.uploadFile(file, restaurant.getName());

        // Update restaurant with new photo URL
        restaurant.setPhotoUrl(photoUrl);
        restaurantRepository.save(restaurant);

        return photoUrl;
    }

    private void validateImageFile(MultipartFile file) {
        // Check if file is empty
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        // Check file size (e.g., max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must be less than 5MB");
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.startsWith("image/jpeg") &&
                        !contentType.startsWith("image/png") &&
                        !contentType.startsWith("image/gif"))) {
            throw new IllegalArgumentException("Only JPEG, PNG, and GIF images are allowed");
        }
    }

    public String getRestaurantPhotoUrl(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        return restaurant.getPhotoUrl();
    }

}
