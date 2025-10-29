# Frontend Dockerfile for WriteWave
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Expose port (Vite default is 5173, but we'll map to 8080)
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

