package com.internship.tool.controller;

import com.internship.tool.dto.ComplianceDTO;
import com.internship.tool.entity.Compliance;
import com.internship.tool.service.ComplianceService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Compliance API", description = "Manage compliance records")
@RestController
@RequestMapping("/api/compliance")
public class ComplianceController {

    private final ComplianceService service;

    public ComplianceController(ComplianceService service) {
        this.service = service;
    }

    // ✅ DTO → Entity Mapping
    private Compliance mapToEntity(ComplianceDTO dto) {
        Compliance c = new Compliance();
        c.setTitle(dto.getTitle());
        c.setDescription(dto.getDescription());
        c.setCategory(dto.getCategory());
        c.setStatus(dto.getStatus());
        c.setRiskScore(dto.getRiskScore());
        c.setDueDate(dto.getDueDate());
        return c;
    }

    // ✅ CREATE
    @Operation(summary = "Create new compliance record")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Compliance created successfully"),
            @ApiResponse(responseCode = "400", description = "Validation error")
    })
    @PostMapping("/create")
    public ResponseEntity<Compliance> create(
            @Valid @RequestBody ComplianceDTO dto) {

        Compliance saved = service.createCompliance(mapToEntity(dto));

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }

    // ✅ GET ALL (PAGINATED)
    @Operation(summary = "Get all compliance records with pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List retrieved successfully")
    })
    @GetMapping("/all")
    public ResponseEntity<Page<Compliance>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Page<Compliance> data =
                service.getAllPaginated(PageRequest.of(page, size));

        return ResponseEntity.ok(data);
    }

    // ✅ GET BY ID
    @Operation(summary = "Get compliance by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Compliance found"),
            @ApiResponse(responseCode = "404", description = "Compliance not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Compliance> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getComplianceById(id));
    }

    // ✅ UPDATE
    @Operation(summary = "Update compliance record")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Updated successfully"),
            @ApiResponse(responseCode = "404", description = "Compliance not found"),
            @ApiResponse(responseCode = "400", description = "Validation error")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Compliance> update(
            @PathVariable Long id,
            @Valid @RequestBody ComplianceDTO dto) {

        Compliance updated =
                service.updateCompliance(id, mapToEntity(dto));

        return ResponseEntity.ok(updated);
    }

    // ✅ DELETE
    @Operation(summary = "Delete compliance record")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Compliance not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {

        service.deleteCompliance(id);

        return ResponseEntity.ok("Deleted successfully");
    }
}