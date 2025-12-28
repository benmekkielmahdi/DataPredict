# DataPredict

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green)
![Python](https://img.shields.io/badge/Python-3.9-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100-009688)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED)
![SonarQube](https://img.shields.io/badge/Quality-SonarQube-5196C2)

**DataPredict** est une plateforme de **Machine Learning Low-Code Distribuée** conçue pour démocratiser l'IA via une approche de **Guided AutoML**. Elle permet de transformer des données brutes en modèles prédictifs grâce à une orchestration hybride unique.

---

## Architecture du Système

DataPredict repose sur une architecture **Microservices Hybride** structurée selon le pattern **"Java Orchestrator – Python Worker"**.



### Orchestration Polyglotte
* **Orchestrateurs (Java Spring Boot)** : Gèrent la logique métier, la sécurité (JWT), les transactions et la persistance MySQL.
* **Workers (Scripts Python)** : Exécutés via `ProcessBuilder` pour l'analyse statistique et l'entraînement intensif.
* **Expert (FastAPI)** : Un service Python dédié à la recommandation d'algorithmes via API REST.


![Architecture](https://github.com/user-attachments/assets/0cc83e21-bc9e-41a0-b9dc-2b6e7a3f7c20)

---

# Authentification Microservice

![Auth_Microservice](https://github.com/user-attachments/assets/6ccff10f-9977-428f-b9b6-26ab6965e291)


## Description
Service d'authentification et d'autorisation basé sur Spring Boot. Gère la génération et validation de tokens via des endpoints REST sécurisés.

## Architecture
- **AuthController** : Expose les endpoints API
- **AuthService** : Contient la logique métier d'authentification
- **Spring Security** : Gestion de la sécurité
- **MySQL** : Base de données

## Fonctionnalités
- Authentification par token
- Contrôle d'accès
- Gestion des rôles
- Persistance des sessions

## Technologies
- Spring Boot
- Spring Security
- MySQL
- JWT


---

# Preprocessing Microservice
![Preprocessing_Microservice](https://github.com/user-attachments/assets/d4ee37f8-47ef-463d-b4d0-2c58acec6afe)


## Description
Microservice de pipeline de traitement de données qui gère l'acquisition, le prétraitement, la transformation et la persistance des datasets. Intègre un système de notifications et une gateway pour une architecture distribuée.

## Architecture
- **Spring Boot Backend** – Orchestration principale
- **MySQL Database** – Persistance des datasets bruts et traités
- **Spring Cloud Gateway** – Point d'entrée unifié
- **Service Discovery** – Gestion des services distribués

## Composants Principaux

### DatasetController
- Gestion des opérations CRUD sur les datasets
- Pipeline de pré-traitement complet
- Implémentation de nettoyage et imputation des données
- Transformation des formats de données

### RPT (Rapid Processing Task)
- Exécution de scripts Python (`PHProotSS.py`)
- Transformation des données
- Génération de statistiques (Stats/Stats JSON)
- Traitement via NetInvoice/Imputation
- Communication avec PythonService

### Data Persistence Layer
- Sauvegarde des datasets bruts
- Persistance des datasets traités
- Apprentissage et modélisation des données
- Gestion des métadonnées

## Fonctionnalités
-  Pipeline complet de prétraitement de données
-  Transformation et nettoyage automatisé
-  Génération de statistiques détaillées
-  Persistance MySQL (brut/traité)
-  Système de notifications (Browser/Mobile via Firebase)
-  Intégration Gateway + Service Discovery

## Flux de Traitement
1. Réception de données via JSON
2. Appel du pipeline de traitement
3. Exécution des scripts Python de transformation
4. Génération de statistiques
5. Imputation et nettoyage
6. Sauvegarde en base MySQL
7. Envoi de notifications sur statut

## Technologies
- Java / Spring Boot
- MySQL
- Python (pandas, numpy, scripts personnalisés)
- Spring Cloud Gateway
- Firebase Cloud Messaging
- JSON/REST APIs

---

# Feature Selection Microservice
![FeatureSelection_Microservice](https://github.com/user-attachments/assets/f96e1cbe-caf2-43bc-9a64-27bd855ef5c9)

## Description
Microservice spécialisé dans la sélection et l'ingénierie de caractéristiques (features) pour pipelines de données analytiques. Intègre des algorithmes d'extraction, de filtrage et de scoring de features.

## Architecture
- **Spring Boot Backend** – API principale
- **Python Processing** – Algorithmes de traitement
- **Gateway Integration** – Connexion via Spring Cloud Gateway
- **Service Discovery** – Découverte de services

## Composants Principaux

### Feature Engineering Module
- Prétraitement des données numériques
- Agrégation algorithmique
- Envoi de résultats
- Calcul d'importance via Mutual Information, Pearson/ANOVA

### Feature Selection Pipeline
- **FCBE Filter** – Méthode de filtrage
- **SFS Wrapper** – Sélection séquentielle
- **Random Forest Importances** – Calcul d'importance
- Algorithmes de sélection avancés

### Classification & Vectorisation
- Vectorisation de datasets
- Classification des résultats
- Modèles de classification
- Extraction des caractéristiques

## Fonctionnalités
-  Sélection automatique de caractéristiques
-  Calcul d'importance (Mutual Information, ANOVA, Random Forest)
-  Multiple méthodes (Filter, Wrapper)
-  Intégration avec pipelines de classification
-  Optimisation des datasets pour le ML

## Flux de Traitement
1. Collecte des données
2. Prétraitement numérique
3. Calcul des scores d'importance
4. Application des méthodes de sélection (FCBE, SFS)
5. Vectorisation pour classification

## Technologies
- Java / Spring Boot
- Python (scikit-learn, pandas, numpy)
- Spring Cloud Gateway
- Algorithmes ML (Random Forest, ANOVA, SFS)
- Base de données transactionnelle

---

# Recommendation Microservice
![Recommandation_Microservice](https://github.com/user-attachments/assets/1acc04f9-8bb3-4bca-a089-23e5a100f993)


## Description
Microservice intelligent de recommandation de modèles de machine learning. Analyse les caractéristiques des datasets et recommande les modèles les plus adaptés selon plusieurs critères pondérés, avec génération automatique d'hyperparamètres.

## Architecture
- **Spring Cloud Gateway** – Point d'entrée unique
- **Service Discovery** – Découverte des services
- **Frontend React** – Interface de visualisation
- **HuaKong** – Orchestration supplémentaire

## Composants
- **Recommendation Controller** – Gestion des endpoints API
- **Recommendation Service** – Logique de recommandation
- **Filtrage Modèles** – Par type (Classification/Régression)

## Critères de Sélection
1. **Qualité des Features** (40%) – Importance et pertinence
2. **Taille du Dataset** (20%) – Échantillons et dimensions
3. **Complexité** (20%) – Ressources et temps requis
4. **Techniques particulières** (20%) – Contraintes spécifiques

## Flux
1. Réception du dataset via Gateway
2. Extraction des caractéristiques
3. Filtrage par type de problème
4. Application des critères pondérés
5. Classement des modèles
6. Génération d'hyperparamètres
7. Retour du meilleur modèle

## Fonctionnalités
- Recommandation automatisée de modèles ML
- Scoring multi-critères pondéré
- Génération d'hyperparamètres optimisés
- Filtrage dynamique par type de problème
- Intégration Gateway + Service Discovery

## Technologies
- Spring Boot
- Spring Cloud Gateway
- Service Discovery (Eureka/Consul)
- React (Frontend)
- Python/Scikit-learn (analyse)
  
---

# Training Microservice
![Training_Service](https://github.com/user-attachments/assets/07cce2e5-b4c1-420a-8112-00a8bd9c99d1)


## Description
Microservice d'entraînement de modèles de machine learning. Gère le processus complet d'entraînement depuis la réception de la requête jusqu'à l'évaluation des performances, avec sélection automatique des meilleurs algorithmes.

## Architecture
- **Spring Cloud Gateway** – Point d'entrée pour les requêtes d'entraînement
- **Frontend web Application** – Interface utilisateur (React)
- **Mobile Application** – Application mobile native

## Composants Principaux

### RPT (Rapid Processing Task)
- **Training Controller** – Gestion des endpoints d'entraînement
- **Training Service** – Orchestration du flux d'entraînement
- **Filter Top Algorithms** – Sélection des 2 meilleurs algorithmes
- **train_model.py** – Script principal d'entraînement Python

### Pipeline d'Entraînement
1. **Train/Test Split** – Division des données (typiquement 80/20)
2. **Model Training** – Entraînement des modèles sélectionnés
3. **Evaluation Metrics** – Calcul des métriques de performance

## Métriques d'Évaluation
- **Pour la Régression** : MSE (Mean Squared Error), R² Score
- **Pour la Classification** : Accuracy, F1-Score, Precision, Recall

## Fonctionnalités
-   **Entraînement Automatisé** – Pipeline complet d'entraînement
-   **Sélection d'Algorithmes** – Filtrage des 2 meilleurs modèles
-   **Évaluation Complète** – Métriques selon le type de problème
-   **Train/Test Split** – Validation robuste des modèles
-   **Intégration Python** – Exécution de scripts ML
-   **API Gateway** – Intégration avec architecture microservices

## Flux de Traitement
1. Réception de la requête d'entraînement via Gateway
2. Sélection des 2 meilleurs algorithmes selon le problème
3. Division des données (entraînement/test)
4. Entraînement des modèles sélectionnés
5. Calcul des métriques de performance
6. Retour des résultats avec comparaison

## Technologies
- **Java / Spring Boot** – Backend principal
- **Spring Cloud Gateway** – Gateway API
- **Python** (scikit-learn, pandas, numpy) – Entraînement ML
- **React** – Interface web
- **Mobile Native** – Applications mobiles


---

## Fonctionnalités Clés du système 

### Preprocessing & NLP

* **Analyse Automatique** : Détection intelligente des types de données, des valeurs manquantes et des distributions statistiques via Python.
* **Pipeline de nettoyage** : Application semi-automatisée de l'imputation (moyenne/médiane), de l'encodage et de la normalisation.

### Feature Selection (Scoring Hybride)

Évaluation de la pertinence des variables via une combinaison pondérée d'algorithmes (30% MI, 20% Pearson, 20% ANOVA, 30% RF) :

* **Statistiques** : Mutual Information, Pearson Correlation, ANOVA.
* **Avancés** : FCBF (Fast Correlation-Based Filter) et importance par Random Forest.

### Recommandation et Entraînement

* **Système Expert** : Recommandation de l'algorithme optimal (XGBoost, Random Forest, etc.) basée sur les caractéristiques du dataset.
* **Suivi Temps Réel** : Capture des métriques (Accuracy, F1, Log Loss) et envoi de notifications push via Firebase une fois l'entraînement terminé.

---

## Stack Technique

* **Backend** : Java 17 (Spring Boot 3, Spring Cloud Gateway), Python 3.9 (FastAPI).
* **Frontend** : React.js (Vite) & React Native (Expo) pour le suivi mobile.
* **Data** : MySQL (architecture une base par service), Scikit-learn, Pandas, NumPy.
* **DevOps** : Docker & Docker Compose, HashiCorp Consul, Jenkins, SonarQube.

---

## Installation et Lancement

### Prérequis

* Docker & Docker Compose
* Git

### Démarrage Rapide

1. **Cloner le projet** :
```bash
git clone [https://github.com/benmekkielmahdi/DataPredict.git](https://github.com/benmekkielmahdi/DataPredict.git)
cd DataPredict

```


2. **Lancer l'infrastructure complète** :
```bash
docker-compose up --build -d

```


3. **Accès aux services** :
* **Interface Web** : `http://localhost:3000`
* **API Gateway** : `http://localhost:8888`
* **Tableau de bord Consul** : `http://localhost:8500`



---

## Qualité et DevOps

Le projet suit des standards de qualité rigoureux via des **Quality Gates** SonarQube :

* **Couverture de code** : Seuil minimal de 80% requis.
* **Analyse Statique** : Respect du standard PEP8 pour Python et détection de code mort en Java.
* **Sécurité** : Validation systématique des tokens JWT et isolation des bases de données par service.

---

## Contributeurs

* **Anas KHAIY**
* **EL Mahdi BEN MEKKI**
* **Mohamed BOUIZERGUANE**

---

## Licence

Ce projet est sous licence **MIT**.

---

## Démonstrations

## Web App Demo 1 (Classification)



https://github.com/user-attachments/assets/0a06d9b8-a94c-41b2-94cf-a38687d48f61



## Web App Demo 2 (Régression)





https://github.com/user-attachments/assets/53922492-b29c-4ab1-8638-f320b16bc37b



## Web App Demo 3 (Classification + NLP)


https://github.com/user-attachments/assets/f16fbb84-120d-4fe1-bcc4-86af9c7a0ddc



## Mobile App Demo 1

https://github.com/user-attachments/assets/d2dd1f0f-b85a-4b9f-a66c-372fe94bee4c



## Mobile App Demo 2

https://github.com/user-attachments/assets/d9a256b3-46c5-4350-ac19-e9024852f2ea


