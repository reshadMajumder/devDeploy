# Use a Gradle image to build the project
FROM gradle:8.5.0-jdk17 AS build
COPY --chown=gradle:gradle . /app
WORKDIR /app
RUN gradle bootJar

# Use lightweight JDK image to run the app
FROM eclipse-temurin:17-jdk-alpine
VOLUME /tmp
COPY --from=build /app/build/libs/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]