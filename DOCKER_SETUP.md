# Docker Setup Guide

This project uses Docker with separate configurations for local development and production.

---

## File Structure

```
├── docker-compose.yml          # Base configuration (app only)
├── docker-compose.dev.yml      # Local development override (exposes port 3000)
├── docker-compose.prod.yml    # Production override (nginx + SSL + certbot)
├── Dockerfile                  # Multi-stage build (builder + production)
├── nginx/
│   ├── dev.conf               # HTTP-only nginx for local testing
│   ├── default.conf           # HTTP config for certbot challenge
│   └── nginx-https.conf      # Full HTTPS config for production
├── init-letsencrypt.sh        # SSL certificate bootstrap script (production only)
└── production.env             # Environment variables (NOT committed to git)
```

---

## Local Development Testing

### Prerequisites

- Docker Desktop installed
- `production.env` file exists with correct credentials (Neon DB, DO Spaces, etc.)

### Step 1: Build and Run Locally

```bash
# Build the image
docker compose build

# Start with dev override (exposes port 3000 to host)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker compose logs -f app
```

### Step 2: Test the Application

```bash
# Test if app is running
curl http://localhost:3000

# Test database connection (check logs for DB connection success)
docker compose logs app | grep -i "database\|postgres\|connected"
```

### Step 3: Test with Nginx (Optional)

```bash
# Stop the current setup
docker compose down

# Start with nginx (HTTP only, no SSL)
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f <(cat <<EOF
services:
  nginx:
    image: nginx:alpine
    container_name: nginx
    ports:
      - '80:80'
    volumes:
      - ./nginx/dev.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - app
    networks:
      - app-network
    restart: unless-stopped
EOF
) up -d

# Access via nginx
curl http://localhost
```

### Step 4: Clean Up

```bash
docker compose down
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

---

## Production Deployment

### Prerequisites

- Domain DNS configured (carebod.xyz pointing to server IP)
- Docker and docker-compose installed on server
- Ports 80 and 443 open on server firewall

### Step 1: Deploy to Server

```bash
# SSH into server
ssh root@your-server

# Navigate to project directory
cd /root/medical-app-backend-latest

# Pull the docker branch
git fetch origin
git checkout docker
git pull origin docker

# Ensure production.env exists and has correct values
cat production.env
```

### Step 2: Generate SSL Certificates

```bash
# Make the init script executable
chmod +x init-letsencrypt.sh

# Run SSL bootstrap (generates certificates)
./init-letsencrypt.sh
```

This script will:

1. Create certbot directories
2. Request SSL certificates from Let's Encrypt
3. Start the full stack (app + nginx + certbot)

### Step 3: Verify Deployment

```bash
# Check all containers are running
docker compose ps

# Check logs
docker compose logs -f

# Test HTTPS access
curl https://api.carebd.xyz
curl https://carebd.xyz
```

### Step 4: SSL Certificate Auto-Renewal

The certbot container automatically renews certificates every 12 hours. No manual intervention needed.

---

## Troubleshooting

### Local Testing Issues

**App won't start:**

```bash
# Check logs
docker compose logs app

# Verify production.env exists
ls -la production.env

# Rebuild image
docker compose build --no-cache
```

**Database connection fails:**

- Verify `production.env` has correct Neon DB credentials
- Check Neon DB is accessible from your network
- Check logs: `docker compose logs app | grep -i "postgres\|database"`

### Production Issues

**Nginx fails to start:**

- SSL certificates must exist in `./certbot/conf/`
- Run `./init-letsencrypt.sh` to generate them

**SSL certificate errors:**

- Verify domain DNS is pointing to correct IP
- Check ports 80/443 are open: `ufw status` or `firewall-cmd --list-ports`
- Check certbot logs: `docker compose logs certbot`

**Container restarts:**

```bash
# Check logs
docker compose logs -f app

# Restart specific service
docker compose restart app
docker compose restart nginx
```

---

## Environment Variables Required

Your `production.env` should contain:

```env
# PostgreSQL (Neon DB)
POSTGRES_HOST=ep-bitter-breeze-ad3muiqv-pooler.c-2.us-east-1.aws.neon.tech
POSTGRES_PORT=5432
POSTGRES_USER=neondb_owner
POSTGRES_PASSWORD=npg_G3MNxOh6YijT
POSTGRES_DB=medicalapp
SSL_MODE=require
CHANNEL_BINDING=require

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Stripe
PUBLISHED_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# DigitalOcean Spaces
DO_SPACES_ACCESS_KEY=DO0032Q462B7T6QADFF2
DO_SPACES_SECRET_KEY=epL1YNgvL3L5L4VkNfID4q2iVaLFMNOPY7QkdbOA26A
DO_SPACES_ENDPOINT=https://ams3.digitaloceanspaces.com
DO_SPACES_BUCKET=medical-app-digital-ocean
DO_SPACES_REGION=ams3
```

---

## Useful Commands

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f
docker compose logs -f app

# Rebuild specific service
docker compose build app
docker compose up -d app

# Execute command in container
docker compose exec app sh
docker compose exec app npm run migration:run

# Remove all volumes (WARNING: deletes data)
docker compose down -v
```
