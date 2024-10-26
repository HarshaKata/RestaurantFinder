package com.example.RestaurantFinder.repo;

import com.example.RestaurantFinder.model.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {
    Optional<User> findByEmail(String email);
    User findUserByEmail(String email);
}