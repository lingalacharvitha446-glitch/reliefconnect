package com.reliefconnect.controller;

import com.reliefconnect.entity.Resource;
import com.reliefconnect.repository.ResourceRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceController {

    private final ResourceRepository resourceRepository;

    public ResourceController(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    // GET ALL RESOURCES
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources() {

        return ResponseEntity.ok(
                resourceRepository.findAll());
    }

    // GET RESOURCES OF A PARTICULAR NGO
    @GetMapping("/ngo/{ngoId}")
    public ResponseEntity<List<Resource>> getNgoResources(
            @PathVariable Long ngoId) {

        return ResponseEntity.ok(
                resourceRepository.findByNgoId(ngoId));
    }

    // ADD RESOURCE
    @PostMapping
    public ResponseEntity<?> addResource(
            @RequestBody Resource resource) {

        try {

            String resourceCode = "RES-" +
                    String.valueOf(System.currentTimeMillis())
                            .substring(7);

            resource.setResourceCode(resourceCode);

            if (resource.getQuantity() == null) {
                resource.setQuantity(0);
            }

            resource.setStatus(
                    calculateStatus(resource.getQuantity()));

            resource.setUpdatedAt(
                    LocalDateTime.now());

            Resource savedResource = resourceRepository.save(resource);

            return ResponseEntity.ok(savedResource);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body("Failed to add resource");
        }
    }

    // UPDATE QUANTITY
    @PutMapping("/{id}/quantity")
    public ResponseEntity<?> updateQuantity(
            @PathVariable Long id,
            @RequestParam Integer amount) {

        try {

            Resource resource = resourceRepository
                    .findById(id)
                    .orElse(null);

            if (resource == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            int currentQuantity = resource.getQuantity() == null
                    ? 0
                    : resource.getQuantity();

            int newQuantity = Math.max(0, currentQuantity + amount);

            resource.setQuantity(newQuantity);

            resource.setStatus(
                    calculateStatus(newQuantity));

            resource.setUpdatedAt(
                    LocalDateTime.now());

            Resource updatedResource = resourceRepository.save(resource);

            return ResponseEntity.ok(updatedResource);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body("Failed to update resource quantity");
        }
    }

    // DELETE RESOURCE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResource(
            @PathVariable Long id) {

        try {

            if (!resourceRepository.existsById(id)) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            resourceRepository.deleteById(id);

            return ResponseEntity.ok(
                    "Resource deleted successfully");

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body("Failed to delete resource");
        }
    }

    // STATUS CALCULATION
    private String calculateStatus(Integer quantity) {

        if (quantity == null || quantity <= 0) {
            return "Depleted";
        }

        if (quantity <= 10) {
            return "Low Stock";
        }

        return "Available";
    }
}
