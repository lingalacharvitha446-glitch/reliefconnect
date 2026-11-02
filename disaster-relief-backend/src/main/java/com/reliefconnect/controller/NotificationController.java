package com.reliefconnect.controller;

import com.reliefconnect.entity.Notification;
import com.reliefconnect.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(
            NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Get all notifications for a volunteer
    @GetMapping("/volunteer/{volunteerId}")
    public ResponseEntity<List<Notification>> getVolunteerNotifications(
            @PathVariable Long volunteerId) {

        return ResponseEntity.ok(
                notificationRepository
                        .findByVolunteerIdOrderByCreatedAtDesc(volunteerId)
        );
    }

    // Get only unread notifications
    @GetMapping("/volunteer/{volunteerId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(
            @PathVariable Long volunteerId) {

        return ResponseEntity.ok(
                notificationRepository
                        .findByVolunteerIdAndIsReadFalseOrderByCreatedAtDesc(
                                volunteerId
                        )
        );
    }

    // Get unread notification count
    @GetMapping("/volunteer/{volunteerId}/count")
    public ResponseEntity<Long> getUnreadCount(
            @PathVariable Long volunteerId) {

        return ResponseEntity.ok(
                notificationRepository
                        .countByVolunteerIdAndIsReadFalse(volunteerId)
        );
    }

    @GetMapping("/ngo/{ngoId}")
    public ResponseEntity<List<Notification>> getNgoNotifications(
            @PathVariable Long ngoId) {
        return ResponseEntity.ok(
                notificationRepository.findByNgoIdOrderByCreatedAtDesc(ngoId)
        );
    }

    @GetMapping("/ngo/{ngoId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNgoNotifications(
            @PathVariable Long ngoId) {
        return ResponseEntity.ok(
                notificationRepository
                        .findByNgoIdAndIsReadFalseOrderByCreatedAtDesc(ngoId)
        );
    }

    @GetMapping("/ngo/{ngoId}/count")
    public ResponseEntity<Long> getNgoUnreadCount(
            @PathVariable Long ngoId) {
        return ResponseEntity.ok(
                notificationRepository.countByNgoIdAndIsReadFalse(ngoId)
        );
    }

    // Mark one notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id) {

        Notification notification =
                notificationRepository.findById(id).orElse(null);

        if (notification == null) {
            return ResponseEntity.notFound().build();
        }

        notification.setIsRead(true);

        Notification updated =
                notificationRepository.save(notification);

        return ResponseEntity.ok(updated);
    }

    // Mark all notifications as read for a volunteer
    @PutMapping("/volunteer/{volunteerId}/read-all")
    public ResponseEntity<?> markAllAsRead(
            @PathVariable Long volunteerId) {

        List<Notification> notifications =
                notificationRepository
                        .findByVolunteerIdOrderByCreatedAtDesc(
                                volunteerId
                        );

        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }

        notificationRepository.saveAll(notifications);

        return ResponseEntity.ok(
                "All notifications marked as read."
        );
    }

    @PutMapping("/ngo/{ngoId}/read-all")
    public ResponseEntity<?> markAllNgoNotificationsAsRead(
            @PathVariable Long ngoId) {
        List<Notification> notifications =
                notificationRepository.findByNgoIdOrderByCreatedAtDesc(ngoId);
        notifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok("All notifications marked as read.");
    }

    // Create a notification
    @PostMapping
    public ResponseEntity<?> createNotification(
            @RequestBody Notification notification) {

        try {
            if (notification.getVolunteerId() == null
                    && notification.getNgoId() == null) {
                return ResponseEntity.badRequest()
                        .body("A volunteer ID or NGO ID is required.");
            }

            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());

            Notification saved =
                    notificationRepository.save(notification);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Failed to create notification.");
        }
    }
}
