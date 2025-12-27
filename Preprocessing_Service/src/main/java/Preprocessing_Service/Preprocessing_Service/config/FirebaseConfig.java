package Preprocessing_Service.Preprocessing_Service.config;

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
            logger.info("FirebaseApp already exists, returning existing instance.");
            return apps.get(0);
        }

        InputStream serviceAccount = null;
        try {
            // Try to load from classpath
            ClassPathResource resource = new ClassPathResource("firebase-service-account.json");
            if (resource.exists()) {
                serviceAccount = resource.getInputStream();
                logger.info("Found firebase-service-account.json in classpath.");
            } else {
                logger.warn(
                        "firebase-service-account.json NOT found in classpath (src/main/resources). Firebase may fail if GOOGLE_APPLICATION_CREDENTIALS is not set.");
            }
        } catch (Exception e) {
            logger.error("Error looking for firebase-service-account.json: {}", e.getMessage());
        }

        FirebaseOptions options;
        if (serviceAccount != null) {
            options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl("https://anas-khaiy-default-rtdb.firebaseio.com/")
                    .build();
            logger.info("Initialized FirebaseApp with service account from file and database URL.");
        } else {
            // Fallback to default credentials (GOOGLE_APPLICATION_CREDENTIALS env var)
            logger.warn(
                    "Using Google Application Default Credentials for Firebase. This typically requires 'gcloud auth application-default login' locally or configured service account in cloud.");
            options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.getApplicationDefault())
                    .setDatabaseUrl("https://anas-khaiy-default-rtdb.firebaseio.com/")
                    .build();
        }

        return FirebaseApp.initializeApp(options);
    }
}
