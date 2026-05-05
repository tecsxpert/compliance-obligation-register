package com.internship.tool.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Schema(description = "Compliance Data Transfer Object")
public class ComplianceDTO {

    @NotBlank(message = "Title is required")
    @Size(min = 3, message = "Title must be at least 3 characters")
    @Schema(
        description = "Title of the compliance",
        example = "GST Filing"
    )
    private String title;

    @Schema(
        description = "Detailed description of compliance",
        example = "Monthly GST return submission"
    )
    private String description;

    @Schema(
        description = "Category of compliance",
        example = "Finance"
    )
    private String category;

    @NotBlank(message = "Status is required")
    @Schema(
        description = "Current status of compliance",
        example = "Pending"
    )
    private String status;

    @NotNull(message = "Risk score is required")
    @DecimalMin(value = "0.0", message = "Risk score must be positive")
    @DecimalMax(value = "10.0", message = "Risk score must be <= 10")
    @Schema(
        description = "Risk score (0 to 10)",
        example = "7.5"
    )
    private Double riskScore;

    @Schema(
        description = "Due date of compliance",
        example = "2026-05-10"
    )
    private LocalDate dueDate;

    // ✅ Getters & Setters

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}