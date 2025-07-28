# Use a Gradle image with JDK 21 to build the project
FROM gradle:8.5.0-jdk21 AS build
COPY --chown=gradle:gradle . /app
WORKDIR /app
RUN gradle bootJar

# Use lightweight JDK 21 image to run the app
FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
COPY --from=build /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
