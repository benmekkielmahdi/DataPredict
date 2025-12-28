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
                    echo 'Configuring portable Python 3.10 environment using Micromamba...'
                    sh '''
                        # 0. Clean old environment to avoid conflicts
                        rm -rf venv bin micromamba nltk_data
                        mkdir -p bin

                        # 1. Download Micromamba (Static Binary)
                        echo "Downloading Micromamba..."
                        curl -Ls https://micro.mamba.pm/api/micromamba/linux-64/latest | tar -xj bin/micromamba
                        
                        # 2. Create local environment with Python 3.10
                        echo "Installing Python 3.10..."
                        export MAMBA_ROOT_PREFIX=$(pwd)/micromamba
                        ./bin/micromamba create -y -n py310 python=3.10 -c conda-forge

                        # 3. Create symlinks to use this python easily
                        ln -sf $(pwd)/micromamba/envs/py310/bin/python3 ./bin/python3
                        ln -sf $(pwd)/micromamba/envs/py310/bin/python3 ./bin/python
                        ln -sf $(pwd)/micromamba/envs/py310/bin/pip3 ./bin/pip3
                        
                        export PATH=$(pwd)/bin:$PATH
                        
                        echo "Python version check:"
                        python3 --version

                        # 4. Create standard venv using our custom Python 3.10
                        echo "Creating project venv..."
                        python3 -m venv venv
                        
                        # Activate and install dependencies
                        . venv/bin/activate
                        pip install --upgrade pip setuptools wheel
                        pip install --no-cache-dir pandas nltk
                        
                        # NLTK Data
                        if [ ! -d "nltk_data" ]; then
                            mkdir -p nltk_data
                            python -m nltk.downloader -d ./nltk_data punkt
                        fi
                        
                        echo "Python 3.10 environment ready."
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
                                    ${WORKSPACE}/bin/python3 -m venv venv_module
                                    . venv_module/bin/activate
                                    pip install --upgrade pip setuptools wheel cython
                                    # Hack: Pre-install compatible pandas/numpy before requirements to guide resolution
                                    pip install --prefer-binary "pandas>=2.2.0" "numpy>=1.26.0"
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