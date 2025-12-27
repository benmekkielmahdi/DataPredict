# Training Metrics Enhancement - Implementation Summary

## Overview
Enhanced the `TrainingRecord` model to support both **Classification** and **Regression** metrics with a new `type` column to distinguish between task types.

## Changes Made

### 1. TrainingRecord Model (`TrainingRecord.java`)

#### New Fields Added:
```java
// Regression metrics (set to 0 for classification tasks)
private Double mse;    // Mean Squared Error
private Double mae;    // Mean Absolute Error
private Double rmse;   // Root Mean Squared Error
private Double r2;     // R² Score

// Task type: "Classification" or "Regression"
private String type;
```

#### Getters and Setters:
- Added getters and setters for all new fields (MSE, MAE, RMSE, R2, Type)

#### Builder Pattern Updated:
- Added builder methods for all new fields:
  - `.mse(Double mse)`
  - `.mae(Double mae)`
  - `.rmse(Double rmse)`
  - `.r2(Double r2)`
  - `.type(String type)`

### 2. TrainingService (`TrainingService.java`)

#### Method Signature Updated:
```java
private void saveTrainingRecord(String datasetId, TrainingResult result, 
                                String description, Long userId, String taskType)
```
- Added `taskType` parameter to determine which metrics to populate

#### Logic Implementation:
```java
boolean isClassification = "classification".equalsIgnoreCase(taskType);
boolean isRegression = "regression".equalsIgnoreCase(taskType);

if (isClassification) {
    builder.accuracy(getDoubleMetric(metrics, "accuracy"))
           .precisionMetric(getDoubleMetric(metrics, "precision"))
           .recall(getDoubleMetric(metrics, "recall"))
           .f1Score(getDoubleMetric(metrics, "f1"))
           .mse(0.0)
           .mae(0.0)
           .rmse(0.0)
           .r2(0.0);
} else if (isRegression) {
    builder.accuracy(0.0)
           .precisionMetric(0.0)
           .recall(0.0)
           .f1Score(0.0)
           .mse(getDoubleMetric(metrics, "mse"))
           .mae(getDoubleMetric(metrics, "mae"))
           .rmse(getDoubleMetric(metrics, "rmse"))
           .r2(getDoubleMetric(metrics, "r2"));
}
```

#### Type Column:
```java
.type(isClassification ? "Classification" : "Regression")
```

### 3. Python Training Script (`train_model.py`)

#### Added RMSE Calculation:
```python
else:  # Regression
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mse)  # NEW: Added RMSE calculation
    r2 = r2_score(y_test, y_pred)
    
    metrics = {
        "mse": round(mse, 4),
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),  # NEW: Added to metrics
        "r2": round(r2, 4),
        "accuracy": round(max(0, r2), 4),
        "trainingTime": round(training_time, 2)
    }
```

## Database Schema Changes

The database will automatically create/update the following columns in the `training_records` table:

| Column Name | Type | Description |
|------------|------|-------------|
| `mse` | DOUBLE | Mean Squared Error (0.0 for classification) |
| `mae` | DOUBLE | Mean Absolute Error (0.0 for classification) |
| `rmse` | DOUBLE | Root Mean Squared Error (0.0 for classification) |
| `r2` | DOUBLE | R² Score (0.0 for classification) |
| `type` | VARCHAR | "Classification" or "Regression" |

### Existing Classification Metrics:
| Column Name | Type | Description |
|------------|------|-------------|
| `accuracy` | DOUBLE | Accuracy Score (0.0 for regression) |
| `precision_metric` | DOUBLE | Precision Score (0.0 for regression) |
| `recall` | DOUBLE | Recall Score (0.0 for regression) |
| `f1_score` | DOUBLE | F1 Score (0.0 for regression) |

## Behavior

### For Classification Tasks:
- **Populated**: accuracy, precision, recall, f1Score, type="Classification"
- **Set to 0.0**: mse, mae, rmse, r2

### For Regression Tasks:
- **Populated**: mse, mae, rmse, r2, type="Regression"
- **Set to 0.0**: accuracy, precision, recall, f1Score

## Testing

To test the implementation:

1. **Classification Task**:
   ```bash
   # Send a training request with taskType="classification"
   # Verify that MSE, MAE, RMSE, R2 = 0.0
   # Verify that accuracy, precision, recall, f1 are populated
   # Verify that type = "Classification"
   ```

2. **Regression Task**:
   ```bash
   # Send a training request with taskType="regression"
   # Verify that MSE, MAE, RMSE, R2 are populated
   # Verify that accuracy, precision, recall, f1 = 0.0
   # Verify that type = "Regression"
   ```

## Migration Notes

If you have existing records in the database, they will have NULL values for the new columns. Consider running a migration script to:
- Set default values (0.0) for missing metrics
- Infer and set the `type` based on existing metrics

Example SQL:
```sql
-- Set default values for new columns
UPDATE training_records 
SET mse = 0.0, mae = 0.0, rmse = 0.0, r2 = 0.0 
WHERE mse IS NULL;

-- Infer type from existing data
UPDATE training_records 
SET type = CASE 
    WHEN accuracy > 0 OR precision_metric > 0 THEN 'Classification'
    ELSE 'Unknown'
END
WHERE type IS NULL;
```

## Next Steps

1. **Test the changes** with both classification and regression datasets
2. **Update frontend** to display regression metrics appropriately
3. **Update API documentation** to reflect the new fields
4. **Consider adding charts** for regression metrics (e.g., predicted vs actual scatter plot)

---
*Last Updated: 2025-12-26*
