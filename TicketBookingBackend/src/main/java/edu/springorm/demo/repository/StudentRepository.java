package edu.springorm.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import edu.springorm.demo.model.Student;

public interface StudentRepository extends JpaRepository<Student, Integer> {

    // Custom method for login
    Student findByUsername(String username);
}