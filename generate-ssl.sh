#!/bin/bash
# Generate self-signed SSL certificate for local development
# Output: ssl/server.key and ssl/server.crt

mkdir -p ssl
openssl req -x509 -newkey rsa:2048 -sha256 -days 365 \
  -nodes -keyout ssl/server.key -out ssl/server.crt \
  -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "Self-signed certificate generated at ssl/server.key and ssl/server.crt."
