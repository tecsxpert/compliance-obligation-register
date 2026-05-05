package com.internship.tool.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditService {

    public String logAction(String action) {
        String log = "Action: " + action + " at " + LocalDateTime.now();
        System.out.println(log);
        return log;
    }
}