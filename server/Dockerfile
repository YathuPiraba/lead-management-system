FROM node:23-slim

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build
COPY src/database/db.sql dist/database/

EXPOSE 3000

CMD ["node", "dist/main"]