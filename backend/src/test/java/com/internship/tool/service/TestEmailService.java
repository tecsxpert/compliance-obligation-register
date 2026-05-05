package com.internship.tool.service;

public class TestEmailService extends EmailService {

    public TestEmailService() {
        super(null);     }

    @Override
    public void sendComplianceEmail(String to, String subject, String body) {
               System.out.println("Test email skipped");
    }
}