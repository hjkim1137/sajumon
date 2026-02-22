# 1. 빌드 스테이지
FROM gradle:7.6-jdk17 AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle build --no-daemon -x test

# 2. 실행 스테이지 (에러가 발생한 openjdk 대신 amazoncorretto 사용)
FROM amazoncorretto:17-al2023-headless
EXPOSE 8080
COPY --from=build /home/gradle/src/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]