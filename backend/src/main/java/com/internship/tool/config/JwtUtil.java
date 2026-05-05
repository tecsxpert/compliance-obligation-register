package com.internship.tool.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // ✅ Secret key (must be at least 32 characters)
    private final String SECRET = "mysecretkeymysecretkeymysecretkey";

    // ✅ Generate signing key
    private Key getSignKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    // ✅ Generate JWT Token
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 hours
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Extract Username
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    // ✅ Extract Expiration
    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    // ✅ Extract all claims
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ Check if token expired
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // ✅ Validate Token (IMPORTANT FOR YOUR ERROR)
    public boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}