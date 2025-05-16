#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo -e "\033[0;36mBuilding and starting the School Management API...\033[0m"

# Build the application
echo -e "\033[0;32mBuilding the application...\033[0m"
go build -o school-management-api

if [ $? -ne 0 ]; then
    echo -e "\033[0;31mBuild failed with exit code $?\033[0m"
    exit $?
fi

# Start PostgreSQL database using Docker
echo -e "\033[0;32mStarting PostgreSQL database...\033[0m"
docker-compose up -d db

if [ $? -ne 0 ]; then
    echo -e "\033[0;31mFailed to start database with exit code $?\033[0m"
    exit $?
fi

# Run the application
echo -e "\033[0;32mStarting the application...\033[0m"
./school-management-api

# Cleanup
echo -e "\033[0;33mCleaning up...\033[0m"
rm -f school-management-api
