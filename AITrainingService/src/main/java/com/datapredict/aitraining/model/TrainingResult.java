package com.datapredict.aitraining.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TrainingResult {
    private String algorithmName;
    private Map<String, Object> metrics; // accuracy, precision, recall, f1, loss
    private String modelArtifactPath;
}
