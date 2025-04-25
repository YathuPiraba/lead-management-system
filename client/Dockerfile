FROM node:23-slim AS builder

WORKDIR /app

# Copy package files for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application and build
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM node:23-slim AS runner
WORKDIR /app

ENV NODE_ENV=development

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

CMD ["npm", "run", "start"]