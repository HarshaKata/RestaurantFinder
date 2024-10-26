package com.example.RestaurantFinder.repo;

import com.example.RestaurantFinder.model.Restaurant;
import com.example.RestaurantFinder.model.Reviews;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewsRepository extends JpaRepository<Reviews,Long> {

    List<Reviews> getReviewsByRestaurant(Restaurant restaurant);
}
