FROM openjdk:17-jdk-slim

# Copy file jar
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar

# Mở port 8080 cho Fly.io
EXPOSE 8080

# Run Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
