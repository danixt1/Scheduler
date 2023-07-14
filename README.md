# Scheduler
System to mark events and fire with possibilite to make HTTP requestm created using **PHP(Laravel)** and **Typescript + React** in front end.

To Run the program first of all prepare the **.env**:
```env
DB_CONNECTION=mysql #or you can use sqlite,postgre
DB_USERNAME=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=scheduler
```
After that run migrate to prepare the db
```bash
php artisan migrate
```
To Compile the front-end run:
```bash
npm install && npm run build
```
And finally you can access the site using:
```bash
php artisan serve
```