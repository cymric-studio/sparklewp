# Build stage
FROM node:18-alpine as build
WORKDIR /app

# Accept build argument
ARG REACT_APP_API_URL=/api

# Set as environment variable for React build
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Copy package files from frontend directory
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
