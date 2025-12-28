pipeline {
    agent any

    environment {
        // Définit l'outil SonarScanner
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
                    echo 'Configuring global Python environment and NLTK data...'
                    sh '''
                        # 1. Vérifier si l'environnement virtuel existe déjà
                        if [ ! -d "venv" ]; then
                            echo "Creating venv..."
                            echo "Creating venv..."
                            python3.10 -m venv venv
                            ./venv/bin/pip install --upgrade pip setuptools wheel
                            ./venv/bin/pip install --no-cache-dir --only-binary :all: pandas nltk
                        else
                            echo "venv already exists. Skipping creation."
                        fi
                        
                        # 2. Vérifier si NLTK data existe déjà
                        if [ ! -d "nltk_data" ]; then
                            echo "Downloading NLTK data..."
                            mkdir -p nltk_data
                            ./venv/bin/python -m nltk.downloader -d ./nltk_data punkt
                        else
                            echo "nltk_data already exists. Skipping download."
                        fi
                        
                        # 3. Créer un dossier bin pour "tromper" le PATH (toujours recréer le lien pour être ŝur)
                        mkdir -p bin
                        ln -sf $(pwd)/venv/bin/python ./bin/python
                        
                        echo "Python environment and NLTK data ready."
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
                    
                    // On injecte le chemin vers Python et le dossier de données NLTK
                    withEnv([
                        "PATH+PYTHON=${WORKSPACE}/bin",
                        "NLTK_DATA=${WORKSPACE}/nltk_data"
                    ]) {
                        javaProjects.each { project ->
                            dir(project) {
                                echo "Building Java Project: ${project}"
                                sh 'chmod +x mvnw || true'
                                
                                if (fileExists('mvnw')) {
                                    sh '''
                                        chmod +x mvnw
                                        . ../venv/bin/activate
                                        ./mvnw clean package -DskipTests=false
                                    '''
                                } else {
                                    sh '''
                                        . ../venv/bin/activate
                                        mvn clean package -DskipTests=false
                                    '''
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
                                    # Venv spécifique au module pour isoler les dépendances de prod
                                    python3.10 -m venv venv_module
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
            // Publication des résultats de tests (obligatoire de nommer testResults)
            junit testResults: '**/target/surefire-reports/*.xml', allowEmptyResults: true
            // Nettoyer le workspace mais garder l'environnement Python pour le cache
            cleanWs(patterns: [
                [pattern: 'venv/**', type: 'EXCLUDE'],
                [pattern: 'nltk_data/**', type: 'EXCLUDE']
            ])
        }
        failure {
            echo 'Le pipeline a échoué. Vérifiez les erreurs de tests ci-dessus.'
        }
    }
}