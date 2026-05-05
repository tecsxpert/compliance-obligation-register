package com.internship.tool.controller;

import com.internship.tool.config.JwtUtil;
import com.internship.tool.entity.User;
import com.internship.tool.repository.UserRepository;
import com.internship.tool.service.UserService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.http.MediaType;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // disable security filters
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private UserRepository repository;

    @MockBean
    private JwtUtil jwtUtil;

    // ✅ ADD THIS (VERY IMPORTANT)
    @MockBean
    private org.springframework.security.crypto.password.PasswordEncoder encoder;

    // ✅ TEST REGISTER
    @Test
    void testRegister() throws Exception {

        String json = """
        {
          "username": "test",
          "password": "1234"
        }
        """;

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk());
    }
}