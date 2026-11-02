package com.reliefconnect.repository;

import com.reliefconnect.entity.ReliefRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReliefRequestRepository
        extends JpaRepository<ReliefRequest, Long> {

    List<ReliefRequest> findByVictimId(Long victimId);

    List<ReliefRequest> findByStatus(String status);
}