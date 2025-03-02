# Build stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY . .
RUN npm ci && npm run build
CMD ["npm", "run", "start"]

