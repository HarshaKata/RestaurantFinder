package com.example.RestaurantFinder.repo;

import com.example.RestaurantFinder.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.RestaurantFinder.model.User;
import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findAllByName(String name);
    @Query("SELECT r FROM Restaurant r " +
            "WHERE (r.name, r.address) IN " +
            "(SELECT r2.name, r2.address FROM Restaurant r2 GROUP BY r2.name, r2.address HAVING COUNT(r2) > 1)")
    List<Restaurant> findDuplicateRestaurants();

    List<Restaurant> findAllByOwner(User owner);

    @Query(value = 
        "SELECT " +
        "   r.id, " +
        "   r.name, " +
        "   r.category, " +
        "   r.cuisine_type, " +
        "   r.price_range, " +
        "   r.address, " +
        "   r.contact_info, " +
        "   r.description, " +
        "   r.photo_url"+
        "   COALESCE(AVG(CAST(rev.rating AS FLOAT)), 0) as avg_rating " +
        "FROM restaurants r " +
        "LEFT JOIN reviews rev ON r.id = rev.restaurant_id " +
        "WHERE (:query IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%'))) " +
        "AND (:category IS NULL OR LOWER(r.category) = LOWER(:category)) " +
        "AND (:price IS NULL OR r.price_range = :price) " +
        "GROUP BY r.id, r.name, r.category, r.cuisine_type, r.price_range, " +
        "         r.address, r.contact_info, r.description " +
        "HAVING (:rating IS NULL OR COALESCE(AVG(CAST(rev.rating AS FLOAT)), 0) >= :rating) " +
        "ORDER BY avg_rating DESC", 
        nativeQuery = true)
    List<Object[]> searchRestaurantsWithRating(
        @Param("query") String query,
        @Param("category") String category,
        @Param("price") String price,
        @Param("rating") Double rating
    );
    @Query(value = 
        "SELECT " +
        "   r.id, " +
        "   r.name, " +
        "   r.category, " +
        "   r.cuisine_type, " +
        "   r.price_range, " +
        "   r.address, " +
        "   r.contact_info, " +
        "   r.description, " +
        "   r.latitude, " +
        "   r.longitude, " +
        "   COALESCE(AVG(CAST(rev.rating AS FLOAT)), 0) as avg_rating, " +
        "   (" +
        "       6371 * acos(" +
        "           cos(radians(:latitude)) * cos(radians(r.latitude)) * " +
        "           cos(radians(r.longitude) - radians(:longitude)) + " +
        "           sin(radians(:latitude)) * sin(radians(r.latitude))" +
        "       )" +
        "   ) AS distance " +
        "FROM restaurants r " +
        "LEFT JOIN reviews rev ON r.id = rev.restaurant_id " +
        "WHERE r.latitude IS NOT NULL " +
        "AND r.longitude IS NOT NULL " +
        "GROUP BY r.id, r.name, r.category, r.cuisine_type, r.price_range, " +
        "         r.address, r.contact_info, r.description, r.latitude, r.longitude " +
        "HAVING distance <= :radius " +
        "ORDER BY distance", 
        nativeQuery = true)
    List<Object[]> findNearbyRestaurants(
        @Param("latitude") double latitude,
        @Param("longitude") double longitude,
        @Param("radius") double radius
    );
}