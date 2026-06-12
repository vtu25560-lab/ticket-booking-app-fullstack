package edu.springorm.demo.repository;

import edu.springorm.demo.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    // No code needed here! Spring handles the SQL logic.
}