package com.example.RestaurantFinder.controller;


// import com.example.RestaurantFinder.dtos.PaginationRequestDTO;
import com.example.RestaurantFinder.dtos.RestaurantDto;
import com.example.RestaurantFinder.model.Restaurant;
import com.example.RestaurantFinder.model.Reviews;
import com.example.RestaurantFinder.repo.RestaurantRepository;
import com.example.RestaurantFinder.service.RestaurantService;
import com.example.RestaurantFinder.service.S3Service;
import com.example.RestaurantFinder.utils.ErrorResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.mail.Multipart;
import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RequestMapping("/restaurants")
@RestController
public class RestaurantController {

    @Autowired
    RestaurantService restaurantService;

    @Autowired
    RestaurantRepository restaurantRepository;

    @Autowired
    S3Service s3Service;

    @GetMapping("/getRestaurants")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getAllRestaurants() {
        try {
            List<Restaurant> restaurants = restaurantRepository.findAll();
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

    @PostMapping(value = "/addRestaurant", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> addRestaurant(
            @RequestPart(value = "restaurantDetails", required = false) RestaurantDto restaurantDto,
            @RequestPart(value = "restaurantImage", required = false) MultipartFile restaurantImage) {
        try {
            // Upload image to S3 if provided
            System.out.println(restaurantDto);
            System.out.println(restaurantImage);

            String imageUrl = null;
            if (restaurantImage != null && !restaurantImage.isEmpty()) {
                System.out.println("entered if");
                imageUrl = s3Service.uploadFile(restaurantImage,restaurantDto.getName());
                // System.out.println(imageUrl);
                restaurantDto.setPhotoUrl(imageUrl);
            }

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

    @PostMapping("/updateRestaurant")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> updateRestaurant( @RequestBody RestaurantDto restaurantDto) {
        try {
            // Fetch the restaurant by ID
            Restaurant existingRestaurant = restaurantRepository.findById(restaurantDto.getRestaurantId()).orElseThrow(() ->
                    new Exception("Restaurant not found with ID: " + restaurantDto.getRestaurantId())
            );

            // Update restaurant details
            existingRestaurant.setName(restaurantDto.getName());
            existingRestaurant.setAddress(restaurantDto.getAddress());
            existingRestaurant.setCuisineType(restaurantDto.getCuisineType());
            existingRestaurant.setDescription(restaurantDto.getDescription());
            existingRestaurant.setContactInfo(restaurantDto.getContactInfo());

            // Update restaurant hours (JSON field)
            if (restaurantDto.getHours() != null) {
                existingRestaurant.setHours(restaurantDto.getHours());
            }

            // Save the updated restaurant
            Restaurant savedRestaurant = restaurantRepository.save(existingRestaurant);

            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(savedRestaurant);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Error updating restaurant: " + e.getMessage(),
                            LocalDateTime.now()
                    ));
        }
    }
// @PostMapping(value="/updateRestaurant",consumes = {MediaType.MULTIPART_FORM_DATA_VALUE })
// @PreAuthorize("hasRole('OWNER')")
// public ResponseEntity<?> updateRestaurant(@RequestPart(value = "restaurantDetails", required = false) RestaurantDto restaurantDto,
//                                           @RequestPart(value = "restaurantImage", required = false) MultipartFile restaurantImage) {
//     try {
//         // Fetch the restaurant by ID
//         Restaurant existingRestaurant = restaurantRepository.findById(restaurantDto.getRestaurantId()).orElseThrow(() ->
//                 new Exception("Restaurant not found with ID: " + restaurantDto.getRestaurantId()));

//         // Update restaurant details
//         existingRestaurant.setName(restaurantDto.getName());
//         existingRestaurant.setAddress(restaurantDto.getAddress());
//         existingRestaurant.setCuisineType(restaurantDto.getCuisineType());
//         existingRestaurant.setDescription(restaurantDto.getDescription());
//         existingRestaurant.setContactInfo(restaurantDto.getContactInfo());

//         // Update restaurant hours (JSON field)
//         if (restaurantDto.getHours() != null) {
//             existingRestaurant.setHours(restaurantDto.getHours());
//         }

//         // Update restaurant image if provided
//         if (restaurantImage != null && !restaurantImage.isEmpty()) {
//             // Delete existing photo if exists
//             if (existingRestaurant.getPhotoUrl() != null) {
//                 s3Service.deleteFile(existingRestaurant.getPhotoUrl());
//             }

//             // Upload new photo
//             String photoUrl = s3Service.uploadFile(restaurantImage, existingRestaurant.getName());
//             System.out.println(photoUrl);
//             existingRestaurant.setPhotoUrl(photoUrl);
//         }
        
//         // Save the updated restaurant
//         Restaurant savedRestaurant = restaurantRepository.save(existingRestaurant);

//         return ResponseEntity
//                 .status(HttpStatus.OK)
//                 .body(savedRestaurant);
//     } catch (Exception e) {
//         return ResponseEntity
//                 .status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new ErrorResponse(
//                         HttpStatus.INTERNAL_SERVER_ERROR.value(),
//                         "Error updating restaurant: " + e.getMessage(),
//                         LocalDateTime.now()
//                 ));
//     }
// }


    @PostMapping("/deleteRestaurant")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRestaurant(@RequestParam Long restaurantId) {
        try {
            // Check if the restaurant exists
            Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow(() ->
                    new Exception("Restaurant not found with ID: " + restaurantId)
            );

            // Delete the restaurant
            restaurantRepository.delete(restaurant);

            // Return success response
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body("Restaurant with ID " + restaurantId + " has been deleted successfully.");
        } catch (Exception e) {
            // Handle errors
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Error deleting restaurant: " + e.getMessage(),
                            LocalDateTime.now()
                    ));
        }
    }

    @GetMapping("/getDuplicateRestaurants")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDuplicateRestaurants() {
        try {
            // Find duplicate restaurants by name and address
            List<Restaurant> duplicateRestaurants = restaurantRepository.findDuplicateRestaurants();

            // Return the list of duplicate restaurants
            return ResponseEntity.ok(duplicateRestaurants);
        } catch (Exception e) {
            // Handle errors
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Error fetching duplicate restaurants: " + e.getMessage(),
                            LocalDateTime.now()
                    ));
        }
    }





}