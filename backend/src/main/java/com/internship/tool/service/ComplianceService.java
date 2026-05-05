package com.internship.tool.service;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.internship.tool.entity.Compliance;
import com.internship.tool.exception.ResourceNotFoundException;
import com.internship.tool.repository.ComplianceRepository;

@Service
public class ComplianceService {

    private final ComplianceRepository repository;
    private final EmailService emailService;

    public ComplianceService(ComplianceRepository repository,
                             EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }

    @CacheEvict(value = "compliance", allEntries = true)
    public Compliance createCompliance(Compliance compliance) {

        Compliance saved = repository.save(compliance);

        emailService.sendComplianceEmail(
                "your_email@gmail.com",
                saved.getTitle(),
                "New compliance created: " + saved.getDescription()
        );

        return saved;
    }

    public List<Compliance> getAllCompliance() {
        return repository.findAll();
    }

    // ✅ No cache here because Page<Compliance> causes Redis serialization issue
    public Page<Compliance> getAllPaginated(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Cacheable(value = "compliance", key = "#id")
    public Compliance getComplianceById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Compliance not found with id: " + id));
    }

    @CacheEvict(value = "compliance", allEntries = true)
    public Compliance updateCompliance(Long id, Compliance updated) {

        Compliance existing = getComplianceById(id);

        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setCategory(updated.getCategory());
        existing.setStatus(updated.getStatus());
        existing.setDueDate(updated.getDueDate());
        existing.setRiskScore(updated.getRiskScore());

        Compliance saved = repository.save(existing);

        emailService.sendComplianceEmail(
                "your_email@gmail.com",
                saved.getTitle(),
                "Compliance updated"
        );

        return saved;
    }

    @CacheEvict(value = "compliance", allEntries = true)
    public void deleteCompliance(Long id) {

        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Compliance not found with id: " + id);
        }

        repository.deleteById(id);
    }
}