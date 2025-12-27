# Guide d'Installation et Configuration CI/CD (Jenkins + SonarQube)

Ce guide explique comment mettre en place l'infrastructure CI/CD pour le projet **DataPredict** en utilisant les fichiers générés.

## 1. Démarrage de l'Infrastructure

Assurez-vous que Docker Desktop est lancé.

1. Ouvrez un terminal à la racine du projet.
2. Lancez les conteneurs Jenkins et SonarQube avec la commande suivante :
   ```bash
   docker-compose -f docker-compose-devops.yml up -d --build
   ```

## 2. Configuration Initiale de Jenkins

1. Accédez à Jenkins via [http://localhost:8080](http://localhost:8080).
2. Récupérez le mot de passe administrateur initial :
   ```bash
   docker exec jenkins_server cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Suivez l'assistant d'installation (les plugins recommandés sont déjà pré-installés via le Dockerfile, mais complétez si nécessaire).
4. Créez votre compte administrateur.

### Configuration des Outils
1. Allez dans **Manage Jenkins > Tools**.
2. **SonarScanner** :
   - Ajoutez un scanner nommé `SonarScanner`.
   - Cochez "Install automatically" (Installer automatiquement).
3. **Maven** :
   - Ajoutez une installation Maven.
   - **Name** : `DataPredict` (Ce nom est impératif car utilisé dans le Jenkinsfile).
   - Cochez "Install automatically".

### Configuration des Credentials (GitHub)
Si votre repo est privé, ajoutez vos identifiants GitHub dans **Manage Jenkins > Credentials**.

## 3. Configuration de SonarQube

1. Accédez à SonarQube via [http://localhost:9000](http://localhost:9000).
2. Connectez-vous (login: `admin`, password: `admin`). Changez le mot de passe.
3. Créez un Token d'authentification :
   - Allez dans **User > My Account > Security**.
   - Générez un token (type: "User Token") nommé `jenkins-token`.
   - **Copiez ce token**.

### 4. Liaison Jenkins -> SonarQube

1. Retournez dans Jenkins : **Manage Jenkins > System**.
2. Cherchez la section **SonarQube servers**.
3. Ajoutez un serveur :
   - **Name** : `DOCKER_SONAR` (Doit correspondre exactement au nom dans le `Jenkinsfile`).
   - **Server URL** : `http://sonarqube:9000` (Nom du conteneur SonarQube).
   - **Server authentication token** : Ajoutez le token SonarQube généré précédemment (type "Secret text").
4. Sauvegardez.

## 5. Création du Job Pipeline

1. Nouveau Item > Pipeline.
2. Nom : `DataPredict-Pipeline`.
3. Dans la section **Pipeline** :
   - Definition : `Pipeline script from SCM`.
   - SCM : `Git`.
   - Repository URL : Indiquez le chemin de votre repo ou dossier local.
   - Script Path : `Jenkinsfile`.
4. Sauvegardez et lancez le build ("Build Now").

## Résumé du Flux
1. Le pipeline fait le checkout.
2. Il compile et teste les microservices Java.
3. Il installe les dépendances et teste les scripts Python.
4. Le Scanner envoie le code à SonarQube.
5. Le Scanner envoie le code à SonarQube pour analyse (en mode "fire and forget").
6. Le pipeline se termine (le résultat de l'analyse sera consultable sur le dashboard SonarQube).
