#!/bin/bash

# =============================================================
# SSL Certificate Bootstrap Script for medical-app.xyz
# Run this ONCE on the production server before starting docker-compose
# =============================================================

if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed.' >&2
  exit 1
fi

if ! [ -x "$(command -v docker-compose)" ] && ! docker compose version &>/dev/null; then
  echo 'Error: docker-compose is not installed.' >&2
  exit 1
fi

DOMAIN="medical-app.xyz"
EMAIL="ashikul.islam.ugrad16@gmail.com"
STAGING=0 # Set to 1 for staging (test certs, no rate limit)

# Create directories
echo "Creating certbot directories..."
mkdir -p ./certbot/www
mkdir -p ./certbot/conf

# Download recommended TLS parameters
echo "Downloading TLS parameters..."
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-ssl-nginx/certbot-ssl-nginx-plugins/src/nginx_config/options-ssl-nginx.ini > ./certbot/options-ssl-nginx.ini
echo "# Created at $(date)" >> ./certbot/options-ssl-nginx.ini

# Create dummy certificate so nginx can start
echo "Creating dummy certificate for $DOMAIN..."
path="/etc/letsencrypt/live/$DOMAIN"
mkdir -p "$path"
docker run --rm \
  -v ./certbot/conf:/etc/letsencrypt \
  -v ./certbot/www:/var/www/certbot \
  certbot/certbot \
  certonly --webroot \
  --webroot-path=/var/www/certbot \
  --config-dir /etc/letsencrypt \
  --work-dir /var/lib/letsencrypt \
  --logs-dir /var/log/letsencrypt \
  -d "$DOMAIN" \
  -d "api.$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --non-interactive \
  --force-renewal \
  $([ "$STAGING" = "1" ] && echo "--staging")

echo "Certificate generated successfully!"

# Start nginx with the real certificate
echo "Starting all services with docker-compose..."
docker compose up -d

echo ""
echo "============================================"
echo "  SSL setup complete for $DOMAIN!"
echo "  Your app should now be accessible at:"
echo "  https://$DOMAIN"
echo "  https://api.$DOMAIN"
echo "============================================"
