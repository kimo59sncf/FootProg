
# Base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Build frontend
RUN npm run build

# Set environment to production
ENV NODE_ENV=production

# Expose application port
EXPOSE 5000

# Start command
CMD ["npm", "run", "start"]
