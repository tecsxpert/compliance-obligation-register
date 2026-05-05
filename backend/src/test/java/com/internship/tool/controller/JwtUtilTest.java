package com.internship.tool.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private final JwtUtil jwtUtil = new JwtUtil();

    @Test
    void testGenerateAndValidateToken() {

        String token = jwtUtil.generateToken("janavi");

        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertEquals("janavi", jwtUtil.extractUsername(token));
    }
}