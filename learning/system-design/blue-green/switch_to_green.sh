#!/bin/bash

# Modify nginx.conf to point to green
sed -i 's/server blue:5000;/server green:5000;/g' ./nginx/nginx.conf

# Reload nginx configuration
# Using docker compose to execute inside the container
docker compose exec nginx nginx -s reload

echo "Switched to green successfully!"
