package com.example.RestaurantFinder.controller;

import jakarta.persistence.EntityNotFoundException;
import com.example.RestaurantFinder.dtos.ReviewDto;
import com.example.RestaurantFinder.model.Restaurant;
import com.example.RestaurantFinder.model.Reviews;
import com.example.RestaurantFinder.model.User;
import com.example.RestaurantFinder.repo.RestaurantRepository;
import com.example.RestaurantFinder.repo.ReviewsRepository;
import com.example.RestaurantFinder.repo.UserRepository;
import com.example.RestaurantFinder.utils.ErrorResponse;
import com.example.RestaurantFinder.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RequestMapping("/reviews")
@RestController
public class ReviewController {

    @Autowired
    ReviewsRepository reviewsRepository;

    @Autowired
    RestaurantRepository restaurantRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping("/getReviews/{restaurantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER','OWNER')")
    public ResponseEntity<?> getReviewsForRestaurant(@PathVariable String restaurantId) {
        try {
            Restaurant restaurant = restaurantRepository.findById(Long.parseLong(restaurantId)).get();
            List<Reviews> reviews = reviewsRepository.getReviewsByRestaurant(restaurant);
            return ResponseEntity.ok(reviews);
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

    @PostMapping("/addReview")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER','OWNER')")
    public ResponseEntity<?> addReviewsForRestaurant(@RequestBody ReviewDto reviewDto) {
        try {
            Restaurant restaurant = restaurantRepository.findById(reviewDto.getRestaurantId()).get();
            User user = userRepository.findById(SecurityUtils.getCurrentUserId()).get();
            Reviews newReview = new Reviews();
            newReview.setRestaurant(restaurant);
            newReview.setUser(user);
            newReview.setRating(reviewDto.getRating());
            newReview.setComment(reviewDto.getComments());

            reviewsRepository.save(newReview);
            return ResponseEntity.ok(newReview);
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

}
