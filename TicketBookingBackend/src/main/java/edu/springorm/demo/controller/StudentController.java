package edu.springorm.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import edu.springorm.demo.model.Student;
import edu.springorm.demo.repository.StudentRepository;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentRepository repo;

    // ✅ REGISTER
    @PostMapping("/register")
    public String register(@RequestBody Student student) {

        Student existing = repo.findByUsername(student.getUsername());

        if (existing != null) {
            return "User already exists";
        }

        repo.save(student);
        return "Registered Successfully";
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public Student login(@RequestBody Student student) {

        Student existing = repo.findByUsername(student.getUsername());

        if (existing != null && existing.getPassword().equals(student.getPassword())) {
            return existing;
        }

        return null;
    }

    // ✅ GET ALL (for testing in Workbench/React)
    @GetMapping("/all")
    public java.util.List<Student> getAllStudents() {
        return repo.findAll();
    }
}