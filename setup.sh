#!/bin/bash

echo "Initializing build process"
docker compose build

echo "Installing vite dependencies"
docker compose run --rm node npm install

if [ ! -f .env ]; then
    echo "APP_KEY=" > .env
fi

echo "Installing laravel dependencies and generating key"
docker compose run --rm laravel sh -c "composer install && php artisan key:generate"

docker compose up -d