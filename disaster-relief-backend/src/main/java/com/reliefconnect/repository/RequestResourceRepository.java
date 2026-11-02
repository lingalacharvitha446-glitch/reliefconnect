package com.reliefconnect.repository;

import com.reliefconnect.entity.RequestResource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestResourceRepository
        extends JpaRepository<RequestResource, Long> {

    List<RequestResource> findByRequestId(Long requestId);

    List<RequestResource> findByResourceId(Long resourceId);
}