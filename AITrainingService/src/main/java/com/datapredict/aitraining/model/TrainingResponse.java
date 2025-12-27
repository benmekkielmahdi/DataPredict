package com.datapredict.aitraining.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TrainingResponse {
    private String bestModel;
    private Map<String, Map<String, Object>> comparison;
    private List<String> reports;
}
