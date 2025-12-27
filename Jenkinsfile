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
