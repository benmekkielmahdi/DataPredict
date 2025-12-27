package com.example.featureselection.config;

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
            logger.info("Firebase app already initialized");
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
                    .setDatabaseUrl("https://anas-khaiy-default-rtdb.firebaseio.com/")
                    .build();
        } else {
            options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.getApplicationDefault())
                    .setDatabaseUrl("https://anas-khaiy-default-rtdb.firebaseio.com/")
                    .build();
        }

        logger.info("Initializing Firebase App...");
        return FirebaseApp.initializeApp(options);
    }
}
