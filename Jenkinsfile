pipeline {
    agent any

    environment {
        // Defines the scanner home if installed as a tool called 'SonarScanner' in Jenkins Global Configuration
        SCANNER_HOME = tool 'SonarScanner' 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Python Dependencies') {
    steps {
        script {
            echo 'Creating Virtual Environment and installing dependencies...'
            sh '''
                # 1. Créer l'environnement virtuel dans le dossier 'venv'
                python3 -m venv venv
                
                # 2. Installer les packages à l'intérieur du venv
                ./venv/bin/pip install --no-cache-dir pandas nltk
                
                # 3. Télécharger les données NLTK via le venv
                ./venv/bin/python -m nltk.downloader punkt
                
                # 4. Créer le dossier bin local pour tromper le code Java
                mkdir -p bin
                
                # 5. LIEN CRUCIAL : On fait pointer 'python' vers le python du VENV
                # On utilise $(pwd) pour avoir le chemin complet (absolu)
                ln -sf $(pwd)/venv/bin/python ./bin/python
                
                echo "Python Virtual Environment ready."
            '''
        }
    }
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
                    
                    javaProjects.each { project ->
                        dir(project) {
                            echo "Building and Testing Java Project: ${project}"
                            // Ensure mvnw is executable
                            sh 'chmod +x mvnw || true'
                            // Use Maven Wrapper if available, else system maven
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

        stage('Build & Test (Python)') {
            steps {
                script {
                    def pythonProjects = ['ModelRecommendation', 'Preprocessing_Service']
                    
                    pythonProjects.each { project ->
                        dir(project) {
                            if (fileExists('requirements.txt')) {
                                echo "Building and Testing Python Project: ${project}"
                                sh '''
                                    # Create virtual environment to isolate dependencies
                                    python3 -m venv venv
                                    . venv/bin/activate
                                    
                                    # Install dependencies
                                    pip install --upgrade pip
                                    pip install -r requirements.txt
                                    pip install pytest pytest-cov
                                    
                                    # Run tests
                                    # Assuming tests are in 'tests' directory or standard layout
                                    if [ -d "tests" ] || ls test_*.py 1> /dev/null 2>&1; then
                                        python3 -m pytest --cov=. --cov-report=xml
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
                withSonarQubeEnv('DOCKER_SONAR') { // Match the name in Jenkins Configure System
                    sh """
                        ${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey=DataPredict \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://sonarqube:9000 \
                        -Dsonar.login=\${SONAR_AUTH_TOKEN}
                    """
                }
            }
        }

        // stage('Quality Gate') {
        //     steps {
        //         timeout(time: 1, unit: 'HOURS') {
        //             // Waits for the result of the analysis (Webhook)
        //             // Ensure a Webhook is configured in SonarQube pointing to Jenkins
        //             waitForQualityGate abortPipeline: true
        //         }
        //     }
        // }
    }
    
    post {
        always {
            cleanWs()
        }
        failure {
            echo 'Pipeline failed. Please check logs.'
        }
    }
}
