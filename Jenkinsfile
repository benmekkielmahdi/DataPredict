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
                    echo 'Installing Python and dependencies for FeatureSelection service tests'
                    sh '''
                        # Check if python3 is available, install if missing
                        if ! command -v python3 &> /dev/null; then
                            echo "Python3 not found. Installing..."
                            apt-get update
                            apt-get install -y python3 python3-pip
                        else
                            echo "Python3 is already installed"
                        fi
                        
                        # Verify Python installation
                        python3 --version
                        pip3 --version
                        
                        # Install required Python packages for FeatureSelection service
                        pip3 install --no-cache-dir pandas nltk || pip3 install --break-system-packages pandas nltk
                        
                        # Create symlink if python command doesn't exist
                        if ! command -v python &> /dev/null; then
                            ln -s /usr/bin/python3 /usr/bin/python || true
                        fi
                        
                        echo "Python setup complete"
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
