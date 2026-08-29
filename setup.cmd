ECHO Initializing build process
docker compose build
ECHO Installing vite dependencies
docker compose run --rm node npm install
if not exist .env (ECHO APP_KEY= > .env)
ECHO Installing laravel dependencies and generating key
docker compose run --rm laravel sh -c "composer install && php artisan key:generate"
docker compose up -d