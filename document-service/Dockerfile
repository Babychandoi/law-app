# ==================== BUILD STAGE ====================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# ==================== RUNTIME STAGE ====================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Font cho docx4j render/xem trước DOCX->HTML (image alpine không có font -> Docx4JException).
# Liberation Serif/Sans/Mono tương thích metric với Times New Roman/Arial/Courier; DejaVu phủ Unicode
# (tiếng Việt). Thiếu font khiến "No physical font" + toHtml thất bại.
RUN apk add --no-cache fontconfig ttf-liberation ttf-dejavu && fc-cache -f

RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=build /app/target/*.jar app.jar

RUN chown -R spring:spring /app
USER spring

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]
