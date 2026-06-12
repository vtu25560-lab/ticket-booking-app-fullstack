package edu.springorm.demo.controller;

import edu.springorm.demo.model.Booking;
import edu.springorm.demo.repository.BookingRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingRepository repository;

    // Constructor Injection (better than field injection)
    @Autowired
    public BookingController(BookingRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/add")
    public ResponseEntity<Booking> bookTicket(@RequestBody Booking booking) {

        // Null safety check
        if (booking == null || booking.getTickets() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Business logic
        double totalAmount = booking.getTickets() * 150.0;
        booking.setTotalAmount(totalAmount);

        Booking savedBooking = repository.save(booking);

        return ResponseEntity.ok(savedBooking);
    }
}