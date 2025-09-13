package com.xeno.assignment.util;

import com.xeno.shopify.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtUtil {

    @Autowired
    private JwtService jwtService;

    public String getTokenFromRequest(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    public String getTenantIdFromToken(String token) {
        try {
            return jwtService.extractTenantId(token);
        } catch (Exception e) {
            return "demo-tenant"; // Default fallback
        }
    }

    public String getEmailFromToken(String token) {
        try {
            return jwtService.extractEmail(token);
        } catch (Exception e) {
            return null;
        }
    }

    public boolean isTokenValid(String token) {
        try {
            return jwtService.isTokenValid(token);
        } catch (Exception e) {
            return false;
        }
    }
}
