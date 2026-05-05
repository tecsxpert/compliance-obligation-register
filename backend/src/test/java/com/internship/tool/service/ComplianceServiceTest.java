package com.internship.tool.service;

import com.internship.tool.entity.Compliance;
import com.internship.tool.repository.ComplianceRepository;
import com.internship.tool.exception.ResourceNotFoundException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.data.domain.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ComplianceServiceTest {

    @Mock
    private ComplianceRepository repository;

    private ComplianceService service;

    private Compliance compliance;

    @BeforeEach
    void setup() {

        MockitoAnnotations.openMocks(this);

        // ✅ USE REAL SAFE EMAIL SERVICE (NO MOCK)
        EmailService emailService = new TestEmailService();

        service = new ComplianceService(repository, emailService);

        compliance = new Compliance();
        compliance.setTitle("Test");
        compliance.setDescription("Desc");
        compliance.setCategory("Finance");
        compliance.setStatus("Pending");
        compliance.setRiskScore(5.0);
    }

    // 1️⃣ CREATE
    @Test
    void testCreateCompliance_success() {
        when(repository.save(any())).thenReturn(compliance);

        Compliance result = service.createCompliance(compliance);

        assertNotNull(result);
        verify(repository).save(compliance);
    }

    // 2️⃣ GET ALL
    @Test
    void testGetAllCompliance_success() {
        when(repository.findAll()).thenReturn(List.of(compliance));

        assertEquals(1, service.getAllCompliance().size());
    }

    // 3️⃣ PAGINATION
    @Test
    void testGetAllPaginated_success() {
        Pageable pageable = PageRequest.of(0, 5);
        when(repository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(compliance)));

        assertEquals(1, service.getAllPaginated(pageable).getTotalElements());
    }

    // 4️⃣ GET BY ID SUCCESS
    @Test
    void testGetById_success() {
        when(repository.findById(1L)).thenReturn(Optional.of(compliance));

        assertNotNull(service.getComplianceById(1L));
    }

    // 5️⃣ GET BY ID FAIL
    @Test
    void testGetById_notFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.getComplianceById(1L));
    }

    // 6️⃣ UPDATE SUCCESS
    @Test
    void testUpdateCompliance_success() {
        when(repository.findById(1L)).thenReturn(Optional.of(compliance));
        when(repository.save(any())).thenReturn(compliance);

        Compliance updated = new Compliance();
        updated.setTitle("Updated");

        assertEquals("Updated",
                service.updateCompliance(1L, updated).getTitle());
    }

    // 7️⃣ UPDATE FAIL
    @Test
    void testUpdateCompliance_notFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.updateCompliance(1L, new Compliance()));
    }

    // 8️⃣ DELETE SUCCESS
    @Test
    void testDeleteCompliance_success() {
        when(repository.existsById(1L)).thenReturn(true);

        service.deleteCompliance(1L);

        verify(repository).deleteById(1L);
    }

    // 9️⃣ DELETE FAIL
    @Test
    void testDeleteCompliance_notFound() {
        when(repository.existsById(1L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class,
                () -> service.deleteCompliance(1L));
    }

    // 🔟 EMPTY PAGE
    @Test
    void testGetAllPaginated_empty() {
        Pageable pageable = PageRequest.of(0, 5);
        when(repository.findAll(pageable))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        assertTrue(service.getAllPaginated(pageable).isEmpty());
    }
}