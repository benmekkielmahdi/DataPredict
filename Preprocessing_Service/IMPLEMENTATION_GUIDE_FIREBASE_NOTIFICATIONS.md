# Firebase Notification Implementation Guide

This guide details the steps to implement the Firebase Cloud Messaging (FCM) notification system in a Spring Boot microservice, specifically designed to send notifications to users based on a topic subscription pattern (`user_{userId}`).

## Step 1: Add Dependencies
Add the Firebase Admin SDK to your `pom.xml`.

```xml
<dependencies>
    <!-- ... other dependencies ... -->

    <!-- Firebase Admin SDK -->
    <dependency>
        <groupId>com.google.firebase</groupId>
        <artifactId>firebase-admin</artifactId>
        <version>9.2.0</version>
    </dependency>
</dependencies>
```

## Step 2: Add Service Account Credentials
1. Obtain your `firebase-service-account.json` from the Firebase Console Project Settings > Service Accounts.
2. Place this file in `src/main/resources/firebase-service-account.json`.

## Step 3: Create Firebase Configuration
Create a configuration class to initialize the Firebase App.

**Class:** `config.FirebaseConfig`

```java
package [YOUR_PACKAGE].config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        List<FirebaseApp> apps = FirebaseApp.getApps();
        if (apps != null && !apps.isEmpty()) {
            // Avoid re-initializing if already exists
            return apps.get(0);
        }

        InputStream serviceAccount = null;
        try {
            ClassPathResource resource = new ClassPathResource("firebase-service-account.json");
            if (resource.exists()) {
                serviceAccount = resource.getInputStream();
                logger.info("Found firebase-service-account.json in classpath.");
            } else {
                logger.warn("firebase-service-account.json NOT found in classpath. Fallback to default credentials.");
            }
        } catch (Exception e) {
            logger.error("Error loading firebase config: {}", e.getMessage());
        }

        FirebaseOptions options;
        if (serviceAccount != null) {
            options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
        } else {
            options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.getApplicationDefault())
                    .build();
        }

        return FirebaseApp.initializeApp(options);
    }
}
```

## Step 4: Create Notification Service
Create a service class to handle the logic of building and sending messages.

**Class:** `service.FirebaseNotificationService`

```java
package [YOUR_PACKAGE].service;

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

    public void sendNotificationToUser(Long userId, String title, String body, Map<String, String> data) {
        try {
            logger.info("Sending notification to user_{} title: '{}'", userId, title);

            // Topic name convention: user_{userId}
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
            logger.info("Sent message to topic {}: {}", topic, response);
        } catch (Exception e) {
            logger.error("Error sending notification to user_{}: {}", userId, e.getMessage(), e);
        }
    }
}
```

## Step 5: Integration Example
Inject the service into your business logic to send notifications.

```java
@Service
public class MyBusinessService {

    @Autowired
    private FirebaseNotificationService firebaseNotificationService;

    public void doSomethingImportant(Long userId) {
        // ... business logic ...

        // Send Notification
        if (userId != null) {
            firebaseNotificationService.sendNotificationToUser(
                userId,
                "Task Completed",
                "Your task has finished successfully.",
                Map.of("taskId", "123", "status", "SUCCESS")
            );
        }
    }
}
```
