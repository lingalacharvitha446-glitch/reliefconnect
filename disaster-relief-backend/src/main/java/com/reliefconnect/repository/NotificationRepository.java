package com.reliefconnect.repository;

import com.reliefconnect.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByVolunteerIdOrderByCreatedAtDesc(
            Long volunteerId
    );

    List<Notification> findByVolunteerIdAndIsReadFalseOrderByCreatedAtDesc(
            Long volunteerId
    );

    long countByVolunteerIdAndIsReadFalse(
            Long volunteerId
    );

    List<Notification> findByNgoIdOrderByCreatedAtDesc(Long ngoId);

    List<Notification> findByNgoIdAndIsReadFalseOrderByCreatedAtDesc(Long ngoId);

    long countByNgoIdAndIsReadFalse(Long ngoId);
}
