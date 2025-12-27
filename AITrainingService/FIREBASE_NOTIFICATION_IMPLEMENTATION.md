# Firebase Notification Implementation - AITrainingService

This document details the Firebase Cloud Messaging (FCM) notification implementation for the AI Training Service.

## Overview

The Firebase notification system sends push notifications to users when their AI model training completes. Notifications include:
- Best performing model name
- Model accuracy percentage
- Dataset name used for training
- Timestamp of completion

## Implementation Steps

### 1. Added Firebase Admin SDK Dependency

**File:** `pom.xml`

Added the Firebase Admin SDK dependency (version 9.2.0):

```xml
<!-- Firebase Admin SDK -->
<dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>9.2.0</version>
</dependency>
```

### 2. Created Firebase Configuration
**File:** `src/main/java/com/datapredict/aitraining/config/FirebaseConfig.java`

This configuration class:
- Initializes the Firebase App on application startup
- Loads the service account credentials from `firebase-service-account.json`
- Sets the Realtime Database URL: `https://anas-khaiy-default-rtdb.firebaseio.com/`
- Handles fallback to default credentials if the file is not found

### 3. Created Firebase Notification Service
**File:** `src/main/java/com/datapredict/aitraining/service/FirebaseNotificationService.java`

Matches user requirements to:
1. Send FCM push notification
2. Save notification to Firebase Realtime Database

**Database Structure:**
```
notifications
  └── user_{userId}
       └── {unique_push_id}
            ├── title: "Training Complete"
            ├── body: "Your model achieved 95% accuracy"
            ├── timestamp: 1703601234567
            ├── read: false
            ├── idUser: 123
            └── data: {extras}
```

#### `sendNotificationToUser()`
Generic method to send notifications to any user via topic subscription pattern.

**Parameters:**
- `userId`: User ID to send notification to
- `title`: Notification title
- `body`: Notification body/message
- `data`: Additional data payload (optional)

**Topic Convention:** `user_{userId}`

#### `sendTrainingCompleteNotification()`
Specialized method for training completion notifications.

**Parameters:**
- `userId`: User ID
- `bestModel`: Name of the best performing model
- `accuracy`: Accuracy of the model (0.0 to 1.0)
- `datasetName`: Name of the dataset used

**Notification Format:**
- Title: "🎯 Training Complete!"
- Body: "Your model '{modelName}' achieved {accuracy}% accuracy on {dataset}"
- Data payload includes: type, modelName, accuracy, dataset, timestamp

### 4. Integrated into Training Service

**File:** `src/main/java/com/datapredict/aitraining/service/TrainingService.java`

**Changes Made:**

1. **Added dependency injection:**
   ```java
   private final FirebaseNotificationService firebaseNotificationService;
   ```

2. **Updated constructor:**
   ```java
   public TrainingService(TrainingRecordRepository trainingRecordRepository,
                         FirebaseNotificationService firebaseNotificationService) {
       this.trainingRecordRepository = trainingRecordRepository;
       this.firebaseNotificationService = firebaseNotificationService;
   }
   ```

3. **Added notification sending in `processTraining()` method:**
   - Triggers after successful training completion
   - Identifies the best performing model
   - Extracts accuracy and dataset name
   - Sends notification with wrapped error handling
   - Never fails the training process if notification fails

**Error Handling:**
- Wrapped in try-catch to prevent notification failures from affecting training
- Detailed error logging for troubleshooting
- Gracefully handles null/missing userId

## Service Account Setup

**Required File:** `src/main/resources/firebase-service-account.json`

1. Obtain from Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `firebase-service-account.json`
4. Place in `src/main/resources/` directory

**⚠️ Important:** 
- Do NOT commit this file to version control
- Add to `.gitignore`
- Each environment (dev, staging, prod) needs its own credentials

## Topic Subscription Pattern

The system uses Firebase Cloud Messaging topics for user-specific notifications:

- **Topic Format:** `user_{userId}`
- **Example:** User with ID 123 subscribes to topic `user_123`
- **Backend:** Sends messages to the topic
- **Frontend:** Users must subscribe to their topic on app launch

## Testing

### Test Notification Sending

1. Start the service
2. Check logs for Firebase initialization:
   ```
   Firebase App initialized successfully.
   ```

3. Trigger a training job via the API:
   ```bash
   curl -X POST http://localhost:8083/api/training/train \
     -H "Content-Type: application/json" \
     -H "X-User-Id: 123" \
     -d '{
       "datasetId": "export/processed_data.csv",
       "algorithms": [...],
       "targetColumn": "target",
       "taskType": "classification"
     }'
   ```

4. Check logs for notification confirmation:
   ```
   ✅ Successfully sent notification to topic user_123: projects/.../messages/...
   Training complete notification sent to user_123
   ```

### Frontend Subscription (React Native)

Users must subscribe to their topic:

```javascript
import messaging from '@react-native-firebase/messaging';

// Subscribe to user-specific topic
const userId = getUserId(); // Get from your auth system
await messaging().subscribeToTopic(`user_${userId}`);
```

## Notification Data Structure

```json
{
  "notification": {
    "title": "🎯 Training Complete!",
    "body": "Your model 'RandomForest' achieved 95.50% accuracy on processed_data.csv"
  },
  "data": {
    "type": "TRAINING_COMPLETE",
    "modelName": "RandomForest",
    "accuracy": "0.955",
    "dataset": "processed_data.csv",
    "timestamp": "1703601234567"
  }
}
```

## Troubleshooting

### Firebase App Not Initialized
**Error:** `IllegalStateException: FirebaseApp with name [DEFAULT] doesn't exist`

**Solution:**
1. Ensure `firebase-service-account.json` is in `src/main/resources/`
2. Check application logs for initialization errors
3. Verify service account file is valid JSON

### Notifications Not Received
**Possible Causes:**

1. **User not subscribed to topic**
   - Verify frontend subscribes to `user_{userId}` on app launch
   - Check subscription in Firebase Console

2. **Invalid service account**
   - Regenerate service account key from Firebase Console
   - Ensure correct project is selected

3. **Network/Firewall issues**
   - Ensure service can reach Firebase APIs
   - Check for proxy/firewall blocking

### Dependency Resolution Issues
**Error:** Maven cannot resolve `firebase-admin`

**Solution:**
```bash
# Clear Maven cache and rebuild
mvn clean install -U
```

## Environment Variables (Optional)

You can externalize the service account path:

```yaml
# application.yml
firebase:
  service-account-path: ${FIREBASE_SERVICE_ACCOUNT_PATH:firebase-service-account.json}
```

Update `FirebaseConfig.java`:
```java
@Value("${firebase.service-account-path}")
private String serviceAccountPath;
```

## Best Practices

1. ✅ **Never block the main thread** - Notifications are sent asynchronously
2. ✅ **Always handle exceptions** - Don't let notification failures break business logic
3. ✅ **Use meaningful titles and messages** - Help users understand what happened
4. ✅ **Include relevant data** - Frontend can use data to navigate or update UI
5. ✅ **Log everything** - Makes debugging much easier
6. ✅ **Test with real devices** - Emulators may not fully support FCM

## Integration with Other Services

To add Firebase notifications to another microservice:

1. Copy `pom.xml` dependency
2. Copy `FirebaseConfig.java` to your config package
3. Copy `FirebaseNotificationService.java` to your service package
4. Update package names
5. Add `firebase-service-account.json` to resources
6. Inject and use `FirebaseNotificationService` where needed

## Related Services

This implementation mirrors the Firebase notification setup in:
- **Preprocessing_Service** - Sends notifications on dataset import/export
- **AITrainingService** - Sends notifications on training completion

Both services share the same topic subscription pattern and service account.

## Support

For issues or questions:
1. Check application logs
2. Verify Firebase Console for message delivery status
3. Test with Firebase Cloud Messaging Test Tool
4. Review Firebase Admin SDK documentation

---

**Last Updated:** December 26, 2025  
**Version:** 1.0.0  
**Author:** AI Training Service Team
