package com.example.RestaurantFinder.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OverpassService {
    private static final Logger logger = LoggerFactory.getLogger(OverpassService.class);
    private static final String OVERPASS_API = "https://overpass-api.de/api/interpreter";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public OverpassService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public List<Map<String, Object>> findNearbyRestaurants(double lat, double lon, double radiusKm) {
        double radiusMeters = radiusKm * 1000;
        
        // Build Overpass QL query with more specific restaurant tags
        String query = String.format(
            """
            [out:json][timeout:25];
            (
              way["amenity"="restaurant"](around:%f,%f,%f);
              node["amenity"="restaurant"](around:%f,%f,%f);
            );
            out body;
            >;
            out skel qt;
            """,
            radiusMeters, lat, lon,
            radiusMeters, lat, lon
        );

        logger.debug("Executing Overpass query: {}", query);

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.USER_AGENT, "RestaurantFinderApp/1.0");
        headers.setContentType(MediaType.TEXT_PLAIN);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                OVERPASS_API,
                HttpMethod.POST,
                new HttpEntity<>(query, headers),
                String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                logger.error("Overpass API returned status: {}", response.getStatusCode());
                return new ArrayList<>();
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode elements = root.get("elements");
            
            if (elements == null) {
                logger.warn("No elements found in Overpass response");
                return new ArrayList<>();
            }

            List<Map<String, Object>> restaurants = new ArrayList<>();
            
            for (JsonNode element : elements) {
                try {
                    // Only process nodes and ways with tags
                    if (element.has("tags")) {
                        JsonNode tags = element.get("tags");
                        
                        // Check if it's actually a restaurant
                        if (tags.has("amenity") && "restaurant".equals(tags.get("amenity").asText())) {
                            Map<String, Object> restaurant = new HashMap<>();
                            
                            // Extract coordinates based on element type
                            double latitude = 0;
                            double longitude = 0;
                            
                            if (element.has("lat") && element.has("lon")) {
                                // For nodes
                                latitude = element.get("lat").asDouble();
                                longitude = element.get("lon").asDouble();
                            } else if (element.has("center")) {
                                // For ways
                                JsonNode center = element.get("center");
                                latitude = center.get("lat").asDouble();
                                longitude = center.get("lon").asDouble();
                            } else {
                                // Skip if no location info
                                continue;
                            }

                            // Basic info
                            restaurant.put("id", "osm_" + element.get("id").asText());
                            restaurant.put("name", tags.has("name") ? tags.get("name").asText() : "Unnamed Restaurant");
                            restaurant.put("latitude", latitude);
                            restaurant.put("longitude", longitude);
                            
                            // Additional info
                            restaurant.put("cuisineType", tags.has("cuisine") ? tags.get("cuisine").asText() : "Not specified");
                            
                            // Build address
                            StringBuilder address = new StringBuilder();
                            if (tags.has("addr:housenumber")) address.append(tags.get("addr:housenumber").asText()).append(" ");
                            if (tags.has("addr:street")) address.append(tags.get("addr:street").asText());
                            if (address.length() == 0) address.append("Address not available");
                            restaurant.put("address", address.toString());
                            
                            restaurant.put("contactInfo", tags.has("phone") ? tags.get("phone").asText() : "Contact info not available");
                            restaurant.put("description", tags.has("description") ? tags.get("description").asText() : "No description available");
                            
                            // Calculate distance
                            double distance = calculateDistance(lat, lon, latitude, longitude);
                            restaurant.put("distance", Math.round(distance * 100.0) / 100.0);
                            
                            // Additional fields to match your database schema
                            restaurant.put("category", "FROM_OSM");
                            restaurant.put("priceRange", tags.has("price_range") ? tags.get("price_range").asText() : "Not specified");
                            restaurant.put("source", "OpenStreetMap");
                            restaurant.put("averageRating", 0.0);
                            restaurant.put("source", "osmrestaurant");

                            restaurants.add(restaurant);
                            logger.debug("Added restaurant: {}", restaurant.get("name"));
                        }
                    }
                } catch (Exception e) {
                    logger.error("Error processing restaurant element: {}", e.getMessage());
                }
            }
            
            logger.info("Found {} restaurants from OpenStreetMap", restaurants.size());
            return restaurants;

        } catch (Exception e) {
            logger.error("Error fetching restaurants from Overpass API", e);
            return new ArrayList<>();
        }
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth's radius in kilometers
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
}