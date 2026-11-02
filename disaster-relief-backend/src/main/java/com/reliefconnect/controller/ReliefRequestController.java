package com.reliefconnect.controller;

import com.reliefconnect.entity.ReliefRequest;
import com.reliefconnect.entity.Notification;
import com.reliefconnect.entity.User;

import com.reliefconnect.repository.ReliefRequestRepository;
import com.reliefconnect.repository.NotificationRepository;
import com.reliefconnect.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:5173")
public class ReliefRequestController {

        private final ReliefRequestRepository reliefRequestRepository;
        private final NotificationRepository notificationRepository;
        private final UserRepository userRepository;

        public ReliefRequestController(
                        ReliefRequestRepository reliefRequestRepository,
                        NotificationRepository notificationRepository,
                        UserRepository userRepository) {

                this.reliefRequestRepository = reliefRequestRepository;
                this.notificationRepository = notificationRepository;
                this.userRepository = userRepository;
        }

        // =====================================================
        // CREATE REQUEST
        // =====================================================

        @PostMapping
        public ResponseEntity<?> createRequest(
                        @RequestBody ReliefRequest request) {

                try {

                        String requestCode = "R-" + String.valueOf(System.currentTimeMillis())
                                        .substring(7);

                        request.setRequestCode(requestCode);

                        request.setStatus("Pending");

                        request.setCreatedAt(LocalDateTime.now());

                        ReliefRequest savedRequest = reliefRequestRepository.save(request);

                        return ResponseEntity.ok(savedRequest);

                } catch (Exception e) {

                        return ResponseEntity
                                        .badRequest()
                                        .body("Failed to create relief request");
                }
        }

        // =====================================================
        // GET ALL REQUESTS
        // =====================================================

        @GetMapping
        public ResponseEntity<List<ReliefRequest>> getAllRequests() {

                return ResponseEntity.ok(
                                reliefRequestRepository.findAll());
        }

        // =====================================================
        // GET REQUESTS OF A PARTICULAR VICTIM
        // =====================================================

        @GetMapping("/victim/{victimId}")
        public ResponseEntity<List<ReliefRequest>> getVictimRequests(
                        @PathVariable Long victimId) {

                return ResponseEntity.ok(
                                reliefRequestRepository.findByVictimId(victimId));
        }

        // =====================================================
        // GET REQUESTS BY STATUS
        // =====================================================

        @GetMapping("/status/{status}")
        public ResponseEntity<List<ReliefRequest>> getRequestsByStatus(
                        @PathVariable String status) {

                return ResponseEntity.ok(
                                reliefRequestRepository.findByStatus(status));
        }

        // =====================================================
        // UPDATE REQUEST STATUS
        // =====================================================

        @PutMapping("/{id}/status")
        public ResponseEntity<?> updateRequestStatus(
                        @PathVariable Long id,
                        @RequestParam String status) {

                try {

                        ReliefRequest request = reliefRequestRepository
                                        .findById(id)
                                        .orElse(null);

                        if (request == null) {
                                return ResponseEntity
                                                .notFound()
                                                .build();
                        }

                        String oldStatus = request.getStatus();

                        request.setStatus(status);

                        ReliefRequest updatedRequest = reliefRequestRepository.save(request);

                        // =================================================
                        // CREATE VOLUNTEER NOTIFICATIONS
                        // =================================================

                        if ("Approved".equalsIgnoreCase(status)
                                        && !"Approved".equalsIgnoreCase(oldStatus)) {

                                List<User> volunteers = userRepository
                                                .findAll()
                                                .stream()
                                                .filter(user -> "Volunteer".equalsIgnoreCase(
                                                                user.getRole()))
                                                .toList();

                                for (User volunteer : volunteers) {

                                        Notification notification = new Notification();

                                        notification.setVolunteerId(
                                                        volunteer.getId());

                                        notification.setRequestId(
                                                        updatedRequest.getId());

                                        notification.setTitle(
                                                        "New Relief Task Available");

                                        notification.setMessage(
                                                        updatedRequest.getType()
                                                                        + " assistance is required at "
                                                                        + updatedRequest.getLocation()
                                                                        + ". Priority: "
                                                                        + updatedRequest.getPriority());

                                        notification.setType(
                                                        "RELIEF_REQUEST");

                                        notification.setIsRead(false);

                                        notification.setCreatedAt(
                                                        LocalDateTime.now());

                                        notificationRepository.save(
                                                        notification);
                                }
                        }

                        return ResponseEntity.ok(updatedRequest);

                } catch (Exception e) {

                        e.printStackTrace();

                        return ResponseEntity
                                        .badRequest()
                                        .body(
                                                        "Failed to update request status: "
                                                                        + e.getMessage());
                }
        }

        // =====================================================
        // UPDATE REQUEST PRIORITY
        // =====================================================

        @PutMapping("/{id}/priority")
        public ResponseEntity<?> updateRequestPriority(
                        @PathVariable Long id,
                        @RequestParam String priority) {

                try {

                        ReliefRequest request = reliefRequestRepository
                                        .findById(id)
                                        .orElse(null);

                        if (request == null) {
                                return ResponseEntity
                                                .notFound()
                                                .build();
                        }

                        request.setPriority(priority);

                        ReliefRequest updatedRequest = reliefRequestRepository.save(request);

                        return ResponseEntity.ok(updatedRequest);

                } catch (Exception e) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(
                                                        "Failed to update request priority");
                }
        }

        // =====================================================
        // ACCEPT REQUEST BY VOLUNTEER
        // =====================================================

        @PutMapping("/{id}/accept")
        public ResponseEntity<?> acceptRequest(
                        @PathVariable Long id,
                        @RequestParam Long volunteerId,
                        @RequestParam String volunteerName) {

                try {

                        ReliefRequest request = reliefRequestRepository
                                        .findById(id)
                                        .orElse(null);

                        if (request == null) {
                                return ResponseEntity
                                                .notFound()
                                                .build();
                        }

                        if (!"Approved".equals(request.getStatus())) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Only approved requests can be accepted.");
                        }

                        request.setStatus("In Progress");

                        request.setVolunteerId(volunteerId);

                        request.setVolunteerName(volunteerName);

                        request.setVolunteerAssigned(true);

                        ReliefRequest updatedRequest = reliefRequestRepository.save(request);

                        List<User> ngos = userRepository.findAll().stream()
                                        .filter(user -> "NGO".equalsIgnoreCase(user.getRole()))
                                        .toList();

                        for (User ngo : ngos) {
                                Notification notification = new Notification();
                                notification.setNgoId(ngo.getId());
                                notification.setRequestId(updatedRequest.getId());
                                notification.setTitle("Volunteer accepted a relief request");
                                notification.setMessage(
                                                (updatedRequest.getRequestCode() == null
                                                                ? "Request #" + updatedRequest.getId()
                                                                : updatedRequest.getRequestCode())
                                                                + " (" + updatedRequest.getType() + ") at "
                                                                + updatedRequest.getLocation()
                                                                + " was accepted by " + volunteerName + ".");
                                notification.setType("VOLUNTEER_ACCEPTED_REQUEST");
                                notification.setIsRead(false);
                                notification.setCreatedAt(LocalDateTime.now());
                                notificationRepository.save(notification);
                        }

                        return ResponseEntity.ok(updatedRequest);

                } catch (Exception e) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(
                                                        "Failed to accept relief request");
                }
        }

        // =====================================================
        // COMPLETE REQUEST BY VOLUNTEER
        // =====================================================

        @PutMapping("/{id}/complete")
        public ResponseEntity<?> completeRequest(
                        @PathVariable Long id) {

                try {

                        ReliefRequest request = reliefRequestRepository
                                        .findById(id)
                                        .orElse(null);

                        if (request == null) {
                                return ResponseEntity
                                                .notFound()
                                                .build();
                        }

                        if (!"In Progress".equals(request.getStatus())) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Only active requests can be completed.");
                        }

                        request.setStatus("Completed");

                        ReliefRequest updatedRequest = reliefRequestRepository.save(request);

                        return ResponseEntity.ok(updatedRequest);

                } catch (Exception e) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(
                                                        "Failed to complete relief request");
                }
        }
}
