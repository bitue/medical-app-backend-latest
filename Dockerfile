FROM node:18-alpine

# Install necessary build dependencies (Python and build tools for node-gyp)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Set working directory
WORKDIR /app

RUN rm -rf node_modules

RUN npm install -g @nestjs/cli ts-node typeorm-ts-node-esm

# Copy package.json and pnpm-lock.yaml first (for better caching)
COPY package.json pnpm-lock.yaml ./

# Install dependencies including devDependencies (needed for build)
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile

# Rebuild bcrypt (will now succeed because Python and build tools are available)
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application (ensure src/ and tsconfig.json are copied)
COPY . .

# Debugging: List files to ensure everything is copied
RUN ls -la /app

# Set environment variables
ENV NODE_ENV=production

ENV NODE_PATH=/app/node_modules

# Ensure TypeScript is built before the app starts (run tsc)
RUN pnpm run build

# Debugging: Verify dist folder exists and contains the expected files
RUN ls -la /app/dist || echo "Build failed: dist folder missing"

# Prune dev dependencies after build
RUN pnpm prune --prod

# Expose application port
EXPOSE 3000

# Start the application
CMD [ "npm", "run", "start:dev"]
# CMD ["sh", "-c", "pnpm run migration:generate && pnpm run migration:run && pnpm run start:dev"]