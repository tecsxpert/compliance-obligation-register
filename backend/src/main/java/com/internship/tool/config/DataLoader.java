package com.internship.tool.config;

import com.internship.tool.entity.Compliance;
import com.internship.tool.repository.ComplianceRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(ComplianceRepository repository) {
        return args -> {

            // ❌ prevent duplicate data on restart
            if (repository.count() > 0) {
                return;
            }

            List<String> titles = List.of(
                    "GST Filing", "Income Tax Return", "ESI Compliance",
                    "PF Filing", "Company Audit", "Fire Safety Check",
                    "Environmental Clearance", "License Renewal",
                    "Data Protection Compliance", "Cybersecurity Audit"
            );

            List<String> categories = List.of(
                    "Finance", "Legal", "HR", "IT", "Operations"
            );

            List<String> statuses = List.of(
                    "Pending", "In Progress", "Completed", "Overdue"
            );

            Random random = new Random();

            for (int i = 1; i <= 30; i++) {

                Compliance c = new Compliance();

                c.setTitle(titles.get(random.nextInt(titles.size())) + " #" + i);
                c.setDescription("Auto-generated compliance record " + i);
                c.setCategory(categories.get(random.nextInt(categories.size())));
                c.setStatus(statuses.get(random.nextInt(statuses.size())));

                // 🎯 Risk score between 1.0 and 10.0
                double risk = 1 + (9 * random.nextDouble());
                c.setRiskScore(Math.round(risk * 10.0) / 10.0);

                // 📅 Mix past & future dates
                int daysOffset = random.nextInt(60) - 30; // -30 to +30 days
                c.setDueDate(LocalDate.now().plusDays(daysOffset));

                repository.save(c);
            }

            System.out.println("✅ 30 demo compliance records inserted!");
        };
    }
}