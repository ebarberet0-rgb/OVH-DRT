# =============================================================================
# Dockerfile - Yamaha DRT API
# Multi-stage build for production
# =============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

# Install build dependencies for bcrypt native compilation and OpenSSL
RUN apk add --no-cache python3 make g++ openssl openssl-dev

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY turbo.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/
COPY packages/types/package*.json ./packages/types/
COPY packages/config/package*.json ./packages/config/

# Install all dependencies
RUN npm ci

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages

# Generate Prisma client
RUN npm run db:generate -w @yamaha-drt/database

# Build all packages and API
RUN npm run build -w @yamaha-drt/types
RUN npm run build -w @yamaha-drt/database
RUN npm run build -w @yamaha-drt/api

# Stage 2: Production
FROM node:20-alpine AS production

# Install runtime dependencies for bcrypt and OpenSSL
RUN apk add --no-cache python3 make g++ openssl openssl-dev

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/
COPY packages/types/package*.json ./packages/types/
COPY packages/config/package*.json ./packages/config/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema for migrations
COPY packages/database/prisma ./packages/database/prisma

# Create uploads directory
RUN mkdir -p /app/uploads /app/apps/api/logs

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the API
CMD ["node", "apps/api/dist/index.js"]
