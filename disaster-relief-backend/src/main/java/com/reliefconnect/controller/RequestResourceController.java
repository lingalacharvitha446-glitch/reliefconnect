package com.reliefconnect.controller;

import com.reliefconnect.entity.ReliefRequest;
import com.reliefconnect.entity.RequestResource;
import com.reliefconnect.entity.Resource;
import com.reliefconnect.repository.ReliefRequestRepository;
import com.reliefconnect.repository.RequestResourceRepository;
import com.reliefconnect.repository.ResourceRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/request-resources")
@CrossOrigin(origins = "http://localhost:5173")
public class RequestResourceController {

    public record AllocationDetails(
            Long allocationId,
            String resourceCode,
            String name,
            String category,
            Integer quantityProvided,
            String unit,
            String location,
            String status,
            LocalDateTime allocatedAt) {
    }

    private final RequestResourceRepository requestResourceRepository;
    private final ReliefRequestRepository reliefRequestRepository;
    private final ResourceRepository resourceRepository;

    public RequestResourceController(
            RequestResourceRepository requestResourceRepository,
            ReliefRequestRepository reliefRequestRepository,
            ResourceRepository resourceRepository) {

        this.requestResourceRepository = requestResourceRepository;

        this.reliefRequestRepository = reliefRequestRepository;

        this.resourceRepository = resourceRepository;
    }

    // =====================================================
    // GET ALLOCATIONS FOR A REQUEST
    // =====================================================

    @GetMapping("/request/{requestId}")
    public ResponseEntity<List<RequestResource>> getByRequest(
            @PathVariable Long requestId) {

        return ResponseEntity.ok(
                requestResourceRepository
                        .findByRequestId(requestId));
    }

    @GetMapping("/request/{requestId}/details")
    public ResponseEntity<List<AllocationDetails>> getRequestAllocationDetails(
            @PathVariable Long requestId) {
        List<AllocationDetails> details = requestResourceRepository
                .findByRequestId(requestId)
                .stream()
                .map(allocation -> {
                    Resource resource = resourceRepository
                            .findById(allocation.getResourceId())
                            .orElse(null);
                    return new AllocationDetails(
                            allocation.getId(),
                            resource == null ? null : resource.getResourceCode(),
                            resource == null ? "Resource #" + allocation.getResourceId() : resource.getName(),
                            resource == null ? null : resource.getCategory(),
                            allocation.getQuantityProvided(),
                            resource == null ? null : resource.getUnit(),
                            resource == null ? null : resource.getLocation(),
                            allocation.getStatus(),
                            allocation.getAllocatedAt());
                })
                .toList();
        return ResponseEntity.ok(details);
    }

    // =====================================================
    // ALLOCATE RESOURCE TO REQUEST
    // =====================================================

    @PostMapping("/allocate")
    public ResponseEntity<?> allocateResource(
            @RequestParam Long requestId,
            @RequestParam Long resourceId,
            @RequestParam Integer quantity) {

        try {

            if (quantity == null || quantity <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Quantity must be greater than zero.");
            }

            // Find request

            ReliefRequest request = reliefRequestRepository
                    .findById(requestId)
                    .orElse(null);

            if (request == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            if (!"In Progress".equals(request.getStatus())) {
                return ResponseEntity
                        .badRequest()
                        .body("Resources can only be allocated to in-progress requests.");
            }

            // Find resource

            Resource resource = resourceRepository
                    .findById(resourceId)
                    .orElse(null);

            if (resource == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Resource not found.");
            }

            // Check available quantity

            int available = resource.getQuantity() == null
                    ? 0
                    : resource.getQuantity();

            if (available < quantity) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Insufficient resource quantity. Available: "
                                        + available);
            }

            // Reduce NGO inventory

            int remaining = available - quantity;

            resource.setQuantity(remaining);

            if (remaining == 0) {

                resource.setStatus("Depleted");

            } else if (remaining <= 10) {

                resource.setStatus("Low Stock");

            } else {

                resource.setStatus("Available");
            }

            resource.setUpdatedAt(
                    LocalDateTime.now());

            resourceRepository.save(resource);

            // Create allocation record

            RequestResource allocation = new RequestResource();

            allocation.setRequestId(requestId);

            allocation.setResourceId(resourceId);

            allocation.setQuantityRequired(quantity);

            allocation.setQuantityProvided(quantity);

            allocation.setStatus("Allocated");

            allocation.setAllocatedAt(
                    LocalDateTime.now());

            RequestResource savedAllocation = requestResourceRepository
                    .save(allocation);

            return ResponseEntity.ok(
                    savedAllocation);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Failed to allocate resource.");
        }
    }
}
