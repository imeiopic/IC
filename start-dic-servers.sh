#!/bin/bash
# Start both DIC backend servers: translation API and WebSocket

# Start translation API (port 3000)
echo "Starting DIC translation API on port 3000..."
(cd api/dic && node server.js &)

# Start WebSocket server (port 5001)
echo "Starting DIC WebSocket server on port 5001..."
(cd api/dic && node ws.js &)

echo "Both DIC servers started."
