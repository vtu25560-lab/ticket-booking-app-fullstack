package edu.springorm.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("edu.springorm.demo.model")
@EnableJpaRepositories("edu.springorm.demo.repository")
public class TicketBookingBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(TicketBookingBackendApplication.class, args);
    }
}