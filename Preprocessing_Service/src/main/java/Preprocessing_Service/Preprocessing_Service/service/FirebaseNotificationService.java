package Preprocessing_Service.Preprocessing_Service.service;

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

    public void sendNotificationToUser(Long userId, String title, String body, Map<String, String> data) {
        try {
            logger.info("Attempting to send notification to user_{} with title: '{}'", userId, title);

            // 1. Send FCM Notification (Topic)
            String topic = "user_" + userId;
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setNotification(notification)
                    .setTopic(topic);

            if (data != null) {
                messageBuilder.putAllData(data);
            }

            String response = FirebaseMessaging.getInstance().send(messageBuilder.build());
            logger.info("Successfully sent message to topic {}: {}", topic, response);

            // 2. Save to Realtime Database
            saveNotificationToDatabase(userId, title, body, data);

        } catch (Exception e) {
            logger.error("Error sending Firebase notification to user_{}: {}", userId, e.getMessage(), e);
        } catch (Throwable t) {
            logger.error("FATAL ERROR sending Firebase notification to user_{}: {}", userId, t.getMessage(), t);
        }
    }

    private void saveNotificationToDatabase(Long userId, String title, String body, Map<String, String> data) {
        try {
            FirebaseDatabase database = FirebaseDatabase.getInstance();
            DatabaseReference notificationsRef = database.getReference("notifications");
            DatabaseReference userNotificationsRef = notificationsRef.child("user_" + userId);
            DatabaseReference newNotificationRef = userNotificationsRef.push();

            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("title", title);
            notificationData.put("body", body);
            notificationData.put("timestamp", System.currentTimeMillis());
            notificationData.put("read", false);
            notificationData.put("idUser", userId); // Requested explicitly by user

            if (data != null) {
                notificationData.put("data", data);
            }

            newNotificationRef.setValueAsync(notificationData);
            logger.info("Saved notification to Realtime Database for user_{}", userId);

        } catch (Exception e) {
            logger.error("Error saving notification to Realtime Database: {}", e.getMessage(), e);
        }
    }
}
