package com.example.RestaurantFinder.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDto {
    private Long restaurantId;
    private String name;

    private String address;

    private String contactInfo;

    private String description;

    private String category;

    private String latitude;

    private String longitude;

    private String priceRange;

    private String cuisineType;
    private String hours;
    private String photoUrl;
}