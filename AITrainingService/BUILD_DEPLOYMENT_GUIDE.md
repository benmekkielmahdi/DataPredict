# 🚀 AITrainingService - Build & Deployment Guide

## ✅ Current Status

**Build Status:** SUCCESS ✅  
**Docker Image:** `aitraining-service:latest` (1.72GB)  
**Last Built:** December 26, 2025  

## 📦 What's Included

This Docker image contains:
- ✅ Firebase Admin SDK with Realtime Database support
- ✅ Firebase service account credentials
- ✅ Push notification system (FCM)
- ✅ Database notification persistence
- ✅ Python 3 + ML libraries (scikit-learn, pandas, numpy, xgboost)
- ✅ Training service with AI model training capabilities

## 🔨 Build Commands

### Step 1: Build JAR File
```bash
cd "/Users/anas/Downloads/Projet V1.1.1 test 2/AITrainingService"
mvn clean package -DskipTests
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
[INFO] Building jar: target/aitraining-service-0.0.1-SNAPSHOT.jar
```

### Step 2: Build Docker Image
```bash
docker build -t aitraining-service:latest .
```

**Expected Output:**
```
[+] Building 41.6s (11/11) FINISHED
 => exporting to image
```

### Verify Image
```bash
docker images aitraining-service
```

## 🏃 Running the Service

### Option 1: Standalone (for testing)
```bash
docker run -p 8083:8083 \
  -e SPRING_PROFILES_ACTIVE=dev \
  --name aitraining \
  aitraining-service:latest
```

### Option 2: With Docker Compose (recommended)
```yaml
services:
  aitraining-service:
    image: aitraining-service:latest
    ports:
      - "8083:8083"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/training_db
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=password
    volumes:
      - ./datasets:/app/datasets
    depends_on:
      - mysql
    networks:
      - microservices
```

## 🧪 Testing the Service

### 1. Health Check
```bash
curl http://localhost:8083/api/training/health
```

**Expected Response:**
```
AITrainingService is up and running
```

### 2. Trigger Training
```bash
curl -X POST http://localhost:8083/api/training/train \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 123" \
  -d '{
    "datasetId": "export/processed_data.csv",
    "targetColumn": "target",
    "taskType": "classification",
    "description": "Test training",
    "algorithms": [
      {
        "name": "RandomForest",
        "score": 0.95,
        "parameters": {
          "n_estimators": 100,
          "max_depth": 10
        }
      },
      {
        "name": "XGBoost",
        "score": 0.92,
        "parameters": {
          "learning_rate": 0.1,
          "max_depth": 5
        }
      }
    ]
  }'
```

### 3. Check Logs
```bash
docker logs -f aitraining
```

**Look for:**
```
Firebase App initialized successfully.
✅ Successfully sent notification to topic user_123
✅ Saved notification to Realtime Database for user_123
Training complete notification sent to user_123
```

### 4. Verify in Firebase
Navigate to:
```
https://console.firebase.google.com/project/anas-khaiy/database/anas-khaiy-default-rtdb/data/notifications/user_123
```

## 📁 Required Files & Volumes

### Essential Files in Image
- ✅ `app.jar` - Spring Boot application
- ✅ `firebase-service-account.json` - Firebase credentials
- ✅ `/app/python/train_model.py` - Python training script

### Volume Mounts (Optional)
```bash
-v /path/to/datasets:/app/datasets     # Dataset storage
-v /path/to/models:/app/models         # Model artifacts
```

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | 8083 | Service port |
| `SPRING_DATASOURCE_URL` | - | MySQL connection URL |
| `SPRING_DATASOURCE_USERNAME` | - | Database username |
| `SPRING_DATASOURCE_PASSWORD` | - | Database password |
| `APP_DATASET_BASE_PATH` | /tmp/datasets | Dataset directory |
| `APP_PYTHON_SCRIPT_PATH` | /app/python/train_model.py | Python script path |

## 🔍 Troubleshooting

### Error: "target/*.jar not found"
**Solution:** Build JAR first!
```bash
mvn clean package -DskipTests
```

### Error: "Firebase App not initialized"
**Check:**
1. `firebase-service-account.json` exists in JAR
2. Service account has correct permissions
3. Database URL is configured

**View inside container:**
```bash
docker run --rm aitraining-service:latest ls -la /app
docker run --rm aitraining-service:latest ls -la /app/BOOT-INF/classes
```

### Error: "Python script not found"
**Check:**
```bash
docker run --rm aitraining-service:latest ls -la /app/python
```

### Service doesn't start
**View logs:**
```bash
docker logs aitraining
```

## 📊 Image Details

**Size:** ~1.72GB
- Base OS: Ubuntu (Jammy) with JDK 17
- Python 3 + ML libraries: ~800MB
- Application JAR: ~105MB
- Dependencies: ~815MB

## 🔄 Update & Rebuild

When you make code changes:

```bash
# 1. Clean old build
mvn clean

# 2. Rebuild JAR
mvn package -DskipTests

# 3. Rebuild Docker image
docker build -t aitraining-service:latest .

# 4. Restart container (if running)
docker stop aitraining && docker rm aitraining
docker run -p 8083:8083 --name aitraining aitraining-service:latest
```

## 🚀 Deployment Checklist

- [ ] JAR file built successfully
- [ ] Docker image built
- [ ] Firebase credentials included
- [ ] Database connection configured
- [ ] Volume mounts set up for datasets
- [ ] Environment variables configured
- [ ] Health endpoint responding
- [ ] Test notification sent successfully
- [ ] Firebase Realtime Database receiving data

## 📱 Integration with Frontend

Once deployed, your React Native app can:
1. Subscribe to FCM topic: `user_{userId}`
2. Receive push notifications
3. Query notification history from Realtime Database
4. Display training results

## 🔐 Security Notes

- ⚠️ Image contains `firebase-service-account.json` - do not expose publicly
- 🔒 Use Docker secrets or environment variables for production
- 🛡️ Ensure Firebase database rules are properly configured
- 🔑 Rotate service account keys regularly

## 📚 Related Documentation

- `FIREBASE_NOTIFICATION_IMPLEMENTATION.md` - Firebase setup guide
- `FIREBASE_REALTIME_DATABASE.md` - Database integration details
- `IMPLEMENTATION_SUMMARY.md` - Feature overview

---

**Last Updated:** December 26, 2025  
**Version:** 0.0.1-SNAPSHOT  
**Status:** ✅ Ready for Deployment
