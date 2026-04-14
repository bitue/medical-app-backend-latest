FROM node:18-alpine AS builder

# Install necessary build dependencies (Python and build tools for node-gyp)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

WORKDIR /app

RUN npm install -g @nestjs/cli pnpm ts-node typeorm-ts-node-esm

# Copy package.json and pnpm-lock.yaml first (for better caching)
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --no-frozen-lockfile

# Rebuild bcrypt
RUN npm rebuild bcrypt --build-from-source

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Prune dev dependencies after build
RUN pnpm prune --prod

# ---- Production image ----
FROM node:18-alpine

WORKDIR /app

# Copy built app and production node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.build.json ./

ENV NODE_ENV=production
ENV NODE_PATH=/app/node_modules

EXPOSE 3000

CMD ["node", "dist/src/main.js"]