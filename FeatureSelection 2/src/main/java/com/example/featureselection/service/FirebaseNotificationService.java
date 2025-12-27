package com.example.featureselection.service;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class FirebaseNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseNotificationService.class);

    /**
     * Send a notification to a specific user via their topic (user_{userId})
     * and save it to Firebase Realtime Database.
     * 
     * @param userId The user ID
     * @param title  The notification title
     * @param body   The notification body
     * @param data   Optional data payload
     */
    public void sendNotificationToUser(String userId, String title, String body, Map<String, String> data) {
        try {
            logger.info("Sending notification to user_{}: title='{}', body='{}'", userId, title, body);

            // 1. Send FCM Push Notification
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
            logger.info("Successfully sent FCM message to topic {}: {}", topic, response);

            // 2. Save to Realtime Database
            saveNotificationToDatabase(userId, title, body, data);

        } catch (Exception e) {
            logger.error("Error processing notification for user_{}: {}", userId, e.getMessage(), e);
        }
    }

    private void saveNotificationToDatabase(String userId, String title, String body, Map<String, String> data) {
        try {
            DatabaseReference ref = FirebaseDatabase.getInstance()
                    .getReference("notifications")
                    .child("user_" + userId)
                    .push();

            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("title", title);
            notificationData.put("body", body);
            notificationData.put("timestamp", System.currentTimeMillis());
            notificationData.put("read", false);

            // Explicitly requested idUser at top level
            // Note: If userId is numeric string, it stays string here unless parsed.
            // The example showed integer '2', but our input is String.
            // We will store as is (likely String) to be safe.
            notificationData.put("idUser", userId);

            if (data != null) {
                notificationData.put("data", data);
            }

            ref.setValueAsync(notificationData);
            logger.info("Saved notification to Realtime Database for user_{}", userId);

        } catch (Exception e) {
            logger.error("Error saving to Realtime Database for user_{}: {}", userId, e.getMessage(), e);
        }
    }
}
