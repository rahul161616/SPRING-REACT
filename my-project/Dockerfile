# Build stage
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Copy and resolve dependencies first (for better caching)
COPY pom.xml mvnw* ./
COPY .mvn ./.mvn
RUN chmod +x ./mvnw && \
    ./mvnw dependency:go-offline

# Copy source code and build
COPY src ./src
COPY .env ./
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy JAR from build stage
COPY --from=builder /app/target/*.jar app.jar

# Copy .env file
COPY .env ./

# Create directory for MySQL files (prevent initialization errors)
RUN mkdir -p /var/lib/mysql

# Set environment variables (using values from .env)
ENV DB_URL=jdbc:mysql://mysql:3306/eventdb
ENV DB_USERNAME=root
ENV DB_PASSWORD=
ENV DB_DRIVER=com.mysql.cj.jdbc.Driver
ENV JPA_DDL_AUTO=update
ENV HIBERNATE_DIALECT=org.hibernate.dialect.MySQL8Dialect
ENV APP_NAME=my-project
ENV FRONTEND_URL=http://frontend:3000
ENV JWT_SECRET_KEY=thisisasecretkeythathasbeenused

# Expose application port
EXPOSE 8080

# Set container entrypoint
ENTRYPOINT ["java", "-jar", "app.jar"]
