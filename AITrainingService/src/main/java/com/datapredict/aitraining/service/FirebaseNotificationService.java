package com.datapredict.aitraining.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class FirebaseNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseNotificationService.class);

    /**
     * Send a notification to a specific user via Firebase Cloud Messaging
     * 
     * @param userId User ID to send notification to
     * @param title  Notification title
     * @param body   Notification body/message
     * @param data   Additional data payload
     */
    public void sendNotificationToUser(Long userId, String title, String body, Map<String, String> data) {
        try {
            logger.info("Sending notification to user_{} - title: '{}'", userId, title);

            // Topic name convention: user_{userId}
            String topic = "user_" + userId;

            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setNotification(notification)
                    .setTopic(topic);

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            String response = FirebaseMessaging.getInstance().send(messageBuilder.build());
            logger.info("✅ Successfully sent notification to topic {}: {}", topic, response);

            // SAVE TO REALTIME DATABASE
            saveNotificationToDatabase(userId, title, body, data);

        } catch (Exception e) {
            logger.error("❌ Error sending notification to user_{}: {}", userId, e.getMessage(), e);
        }
    }

    private void saveNotificationToDatabase(Long userId, String title, String body, Map<String, String> data) {
        try {
            com.google.firebase.database.DatabaseReference ref = com.google.firebase.database.FirebaseDatabase
                    .getInstance()
                    .getReference("notifications")
                    .child("user_" + userId);

            Map<String, Object> notificationData = new java.util.HashMap<>();
            notificationData.put("title", title);
            notificationData.put("body", body);
            notificationData.put("timestamp", System.currentTimeMillis());
            notificationData.put("read", false);
            notificationData.put("idUser", userId); // At root level!

            // data object contains only event-specific metadata
            if (data != null && !data.isEmpty()) {
                notificationData.put("data", data);
            }

            // push() generates a unique ID
            ref.push().setValueAsync(notificationData);
            logger.info("✅ Saved notification to Realtime Database for user_{}", userId);

        } catch (Exception e) {
            logger.error("❌ Error saving notification to database: {}", e.getMessage());
        }
    }

    /**
     * Send training completion notification
     * 
     * @param userId      User ID
     * @param bestModel   Name of the best performing model
     * @param accuracy    Accuracy of the best model
     * @param datasetName Name of the dataset used
     */
    public void sendTrainingCompleteNotification(Long userId, String bestModel, Double accuracy, String datasetName) {
        String title = "🎯 Training Complete!";
        String body = String.format("Your model '%s' achieved %.2f%% accuracy on %s",
                bestModel, accuracy * 100, datasetName);

        Map<String, String> data = Map.of(
                "type", "TRAINING_COMPLETE",
                "modelName", bestModel,
                "accuracy", String.valueOf(accuracy),
                "dataset", datasetName,
                "timestamp", String.valueOf(System.currentTimeMillis()));

        sendNotificationToUser(userId, title, body, data);
    }
}
