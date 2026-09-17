<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
Route::get('/', function () {
    return view('welcome');
});
Route::get('/init-db', function () {
    Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);
    return 'Database migrated and seeded successfully!';
});
Route::get('/setup-db-now', function () {
    Artisan::call('migrate:fresh', ['--force' => true]);
    Artisan::call('db:seed', ['--force' => true]);
    return 'Database migrated and seeded successfully!';
});