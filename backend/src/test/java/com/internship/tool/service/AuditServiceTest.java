package com.internship.tool.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AuditServiceTest {

    private final AuditService auditService = new AuditService();

    @Test
    void testAuditLog() {
        String result = auditService.logAction("CREATE");

        assertNotNull(result);
        assertTrue(result.contains("CREATE"));
    }
}