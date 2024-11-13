package com.example.RestaurantFinder.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class GeoCodingService {
    private static final Logger logger = LoggerFactory.getLogger(GeoCodingService.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private static final String NOMINATIM_API = "https://nominatim.openstreetmap.org/search";

    @Autowired
    public GeoCodingService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }
    @Cacheable(value = "locationSuggestions", key = "#query")
    public List<LocationSuggestion> getLocationSuggestions(String query) {
        logger.info("Searching locations for query: {}", query);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "RestaurantFinderApp/1.0");
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        
        String url = UriComponentsBuilder.fromHttpUrl(NOMINATIM_API)
            .queryParam("q", query)
            .queryParam("format", "json")
            .queryParam("addressdetails", 1)
            .queryParam("limit", 5)
            .build()
            .toString();

        logger.info("Making request to URL: {}", url);

        try {
            ResponseEntity<String> responseEntity = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class
            );
            
            String response = responseEntity.getBody();
            logger.info("Received response: {}", response);

            if (response == null || response.isBlank()) {
                logger.warn("Received empty response from Nominatim API");
                return new ArrayList<>();
            }

            JsonNode results = objectMapper.readTree(response);
            List<LocationSuggestion> suggestions = new ArrayList<>();

            if (results.isArray()) {
                for (JsonNode result : results) {
                    try {
                        String displayName = result.get("display_name").asText();
                        double lat = Double.parseDouble(result.get("lat").asText());
                        double lon = Double.parseDouble(result.get("lon").asText());
                        
                        suggestions.add(new LocationSuggestion(displayName, lat, lon));
                        logger.info("Added suggestion: {}, {}, {}", displayName, lat, lon);
                    } catch (Exception e) {
                        logger.error("Error parsing location result: {}", result, e);
                    }
                }
            }
            
            return suggestions;
        } catch (Exception e) {
            logger.error("Error fetching location suggestions", e);
            return new ArrayList<>();
        }
    }

    @Cacheable(value = "coordinates", key = "#address")
    public Optional<LocationCoordinates> getCoordinates(String address) {
        String url = UriComponentsBuilder.fromHttpUrl(NOMINATIM_API)
            .queryParam("q", address)
            .queryParam("format", "json")
            .queryParam("limit", 1)
            .build()
            .toString();

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode results = objectMapper.readTree(response);

            if (results.isArray() && results.size() > 0) {
                JsonNode firstResult = results.get(0);
                return Optional.of(new LocationCoordinates(
                    Double.parseDouble(firstResult.get("lat").asText()),
                    Double.parseDouble(firstResult.get("lon").asText())
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    public record LocationCoordinates(double latitude, double longitude) {}
    public record LocationSuggestion(String displayName, double latitude, double longitude) {}
}
