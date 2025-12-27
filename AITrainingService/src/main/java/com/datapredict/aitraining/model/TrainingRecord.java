package com.datapredict.aitraining.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "training_records")
public class TrainingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String datasetName;
    private String modelName;
    private Double accuracy;
    private Double precisionMetric;
    private Double recall;
    private Double f1Score;
    private Double trainingTime;
    private String status;
    private LocalDateTime date;
    private String description;

    @Column(columnDefinition = "LONGTEXT")
    private String fullMetrics;

    private Long userId;

    // Regression metrics (set to 0 for classification tasks)
    private Double mse;
    private Double mae;
    private Double rmse;
    private Double r2;

    // Task type: "Classification" or "Regression"
    private String type;

    public TrainingRecord() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDatasetName() {
        return datasetName;
    }

    public void setDatasetName(String datasetName) {
        this.datasetName = datasetName;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }

    public Double getPrecisionMetric() {
        return precisionMetric;
    }

    public void setPrecisionMetric(Double precisionMetric) {
        this.precisionMetric = precisionMetric;
    }

    public Double getRecall() {
        return recall;
    }

    public void setRecall(Double recall) {
        this.recall = recall;
    }

    public Double getF1Score() {
        return f1Score;
    }

    public void setF1Score(Double f1Score) {
        this.f1Score = f1Score;
    }

    public Double getTrainingTime() {
        return trainingTime;
    }

    public void setTrainingTime(Double trainingTime) {
        this.trainingTime = trainingTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFullMetrics() {
        return fullMetrics;
    }

    public void setFullMetrics(String fullMetrics) {
        this.fullMetrics = fullMetrics;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Double getMse() {
        return mse;
    }

    public void setMse(Double mse) {
        this.mse = mse;
    }

    public Double getMae() {
        return mae;
    }

    public void setMae(Double mae) {
        this.mae = mae;
    }

    public Double getRmse() {
        return rmse;
    }

    public void setRmse(Double rmse) {
        this.rmse = rmse;
    }

    public Double getR2() {
        return r2;
    }

    public void setR2(Double r2) {
        this.r2 = r2;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public static TrainingRecordBuilder builder() {
        return new TrainingRecordBuilder();
    }

    public static class TrainingRecordBuilder {
        private String datasetName;
        private String modelName;
        private Double accuracy;
        private Double precisionMetric;
        private Double recall;
        private Double f1Score;
        private Double trainingTime;
        private String status;
        private LocalDateTime date;
        private String description;
        private String fullMetrics;
        private Long userId;
        private Double mse;
        private Double mae;
        private Double rmse;
        private Double r2;
        private String type;

        public TrainingRecordBuilder datasetName(String datasetName) {
            this.datasetName = datasetName;
            return this;
        }

        public TrainingRecordBuilder modelName(String modelName) {
            this.modelName = modelName;
            return this;
        }

        public TrainingRecordBuilder accuracy(Double accuracy) {
            this.accuracy = accuracy;
            return this;
        }

        public TrainingRecordBuilder precisionMetric(Double precisionMetric) {
            this.precisionMetric = precisionMetric;
            return this;
        }

        public TrainingRecordBuilder recall(Double recall) {
            this.recall = recall;
            return this;
        }

        public TrainingRecordBuilder f1Score(Double f1Score) {
            this.f1Score = f1Score;
            return this;
        }

        public TrainingRecordBuilder trainingTime(Double trainingTime) {
            this.trainingTime = trainingTime;
            return this;
        }

        public TrainingRecordBuilder status(String status) {
            this.status = status;
            return this;
        }

        public TrainingRecordBuilder date(LocalDateTime date) {
            this.date = date;
            return this;
        }

        public TrainingRecordBuilder description(String description) {
            this.description = description;
            return this;
        }

        public TrainingRecordBuilder fullMetrics(String fullMetrics) {
            this.fullMetrics = fullMetrics;
            return this;
        }

        public TrainingRecordBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public TrainingRecordBuilder mse(Double mse) {
            this.mse = mse;
            return this;
        }

        public TrainingRecordBuilder mae(Double mae) {
            this.mae = mae;
            return this;
        }

        public TrainingRecordBuilder rmse(Double rmse) {
            this.rmse = rmse;
            return this;
        }

        public TrainingRecordBuilder r2(Double r2) {
            this.r2 = r2;
            return this;
        }

        public TrainingRecordBuilder type(String type) {
            this.type = type;
            return this;
        }

        public TrainingRecord build() {
            TrainingRecord r = new TrainingRecord();
            r.setDatasetName(datasetName);
            r.setModelName(modelName);
            r.setAccuracy(accuracy);
            r.setPrecisionMetric(precisionMetric);
            r.setRecall(recall);
            r.setF1Score(f1Score);
            r.setTrainingTime(trainingTime);
            r.setStatus(status);
            r.setDate(date);
            r.setDescription(description);
            r.setFullMetrics(fullMetrics);
            r.setUserId(userId);
            r.setMse(mse);
            r.setMae(mae);
            r.setRmse(rmse);
            r.setR2(r2);
            r.setType(type);
            return r;
        }
    }
}
