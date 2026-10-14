# ===================================================================
# Multi-Stage Dockerfile for Spring Boot Backend
# Stage 1: Build the application with Maven
# Stage 2: Run with a minimal JRE
# ===================================================================

# --- Stage 1: Build ---
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy only POM first to leverage Docker layer caching for dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# --- Stage 2: Runtime ---
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Create upload directory
RUN mkdir -p uploads && chown -R appuser:appgroup /app

USER appuser

# Expose port (Render uses PORT env variable)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-8080}/api/subjects || exit 1

# Start the application with the prod profile
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar", \
  "--spring.profiles.active=prod"]
