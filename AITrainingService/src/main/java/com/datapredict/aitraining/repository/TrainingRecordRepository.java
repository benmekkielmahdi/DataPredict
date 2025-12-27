package com.datapredict.aitraining.repository;

import com.datapredict.aitraining.model.TrainingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingRecordRepository extends JpaRepository<TrainingRecord, Long> {
    List<TrainingRecord> findAllByOrderByDateDesc();

    List<TrainingRecord> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT MAX(t.accuracy) FROM TrainingRecord t WHERE t.status = 'success' AND t.userId = ?1")
    Double findBestAccuracy(Long userId);

    long countByStatusAndUserId(String status, Long userId);

    long countByUserId(Long userId);
}
