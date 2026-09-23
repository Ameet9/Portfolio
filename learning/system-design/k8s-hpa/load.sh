#!/bin/bash

TARGET_URL=${1:-"http://localhost:80/work"}

echo "Starting load generation against $TARGET_URL"
echo "Press Ctrl+C to stop"

while true; do
  curl -s $TARGET_URL > /dev/null &
  sleep 0.1
done
