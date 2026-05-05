package com.internship.tool.repository;

import com.internship.tool.entity.Compliance;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ComplianceRepositoryTest {

    @Autowired
    private ComplianceRepository repository;

    @Test
    void testSaveAndFind() {

        Compliance c = new Compliance();
        c.setTitle("GST Filing");
        c.setDescription("Monthly return");
        c.setCategory("Finance");
        c.setStatus("Pending");
        c.setRiskScore(5.0);
        c.setDueDate(LocalDate.now()); 
        Compliance saved = repository.save(c);

        Optional<Compliance> found = repository.findById(saved.getId());

        assertNotNull(saved.getId());
        assertTrue(found.isPresent());
        assertEquals("GST Filing", found.get().getTitle());
    }
}