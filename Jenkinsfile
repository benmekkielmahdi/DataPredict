pipeline {
    agent any

    environment {
        // Définit l'outil SonarScanner (doit correspondre au nom dans Jenkins Global Tool Configuration)
        SCANNER_HOME = tool 'SonarScanner'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Python (Workspace)') {
            steps {
                script {
                    echo 'Configuring global Python environment for Java tests...'
                    sh '''
                        # 1. Créer un environnement virtuel au niveau du workspace
                        python3 -m venv venv
                        
                        # 2. Installer les dépendances nécessaires aux tests Java
                        ./venv/bin/pip install --no-cache-dir pandas nltk
                        
                        # 3. Télécharger les données NLTK
                        ./venv/bin/python -m nltk.downloader punkt
                        
                        # 4. Créer un dossier bin local et un lien symbolique 'python'
                        mkdir -p bin
                        ln -sf $(pwd)/venv/bin/python ./bin/python
                        
                        echo "Python environment ready in ./bin"
                    '''
                }
            }
        }

        stage('Build & Test (Java)') {
            steps {
                script {
                    def javaProjects = [
                        'MicroService Auth', 
                        'api-gateway', 
                        'AITrainingService', 
                        'Preprocessing_Service', 
                        'FeatureSelection 2'
                    ]
                    
                    // On ajoute notre dossier bin au PATH pour que Java trouve 'python'
                    withEnv(["PATH+PYTHON=${WORKSPACE}/bin"]) {
                        javaProjects.each { project ->
                            dir(project) {
                                echo "Building Java Project: ${project}"
                                sh 'chmod +x mvnw || true'
                                
                                if (fileExists('mvnw')) {
                                    sh './mvnw clean package -DskipTests=false'
                                } else {
                                    sh 'mvn clean package -DskipTests=false'
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Build & Test (Python)') {
            steps {
                script {
                    def pythonProjects = ['ModelRecommendation', 'Preprocessing_Service']
                    
                    pythonProjects.each { project ->
                        dir(project) {
                            if (fileExists('requirements.txt')) {
                                echo "Building Python Project: ${project}"
                                sh '''
                                    # Création d'un venv spécifique au module pour éviter les conflits
                                    python3 -m venv venv_module
                                    . venv_module/bin/activate
                                    pip install --upgrade pip
                                    pip install -r requirements.txt
                                    pip install pytest pytest-cov
                                    
                                    if [ -d "tests" ] || ls test_*.py 1> /dev/null 2>&1; then
                                        python -m pytest --cov=. --cov-report=xml
                                    else
                                        echo "No tests found for ${project}"
                                    fi
                                '''
                            }
                        }
                    }
                }
            }
        }

        stage('Static Analysis (SonarQube)') {
            steps {
                // 'DOCKER_SONAR' doit correspondre au nom dans Jenkins > Configurer le système
                withSonarQubeEnv('DOCKER_SONAR') {
                    sh """
                        ${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey=DataPredict \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://sonarqube:9000
                    """
                }
            }
        }
    }
    
    post {
        always {
            // CORRECTION : Les arguments doivent être nommés ici
            junit testResults: '**/target/surefire-reports/*.xml', allowEmptyResults: true
            cleanWs()
        }
        failure {
            echo 'Le pipeline a échoué. Vérifiez les logs de compilation ou de tests.'
        }
    }
}