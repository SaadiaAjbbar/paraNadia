<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ServiceController;
use App\Http\Controllers\API\ReservationController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\DashboardController;

// Routes العامة
Route::post('/login', [AuthController::class, 'login']);

// Routes المحمية بـ Token
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    // Dashboard & Financial Reports
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/reports', [DashboardController::class, 'report']); // <--- Route

    // Products & Stock Management
    Route::patch('/products/{product}/add-stock', [ProductController::class, 'addStock']); // <--- Route Restock


    // Services & Reservations
    Route::apiResource('services', ServiceController::class);
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus']);

    // Categories & Products
    Route::apiResource('categories', CategoryController::class);
    Route::get('/products/low-stock', [ProductController::class, 'lowStock']);
    Route::apiResource('products', ProductController::class);

    // Orders
    Route::apiResource('orders', OrderController::class)->except(['update', 'destroy']);
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);


});
