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
use App\Http\Controllers\ParapharmacySettingController;

// Routes العامة
Route::post('/login', [AuthController::class, 'login']);

// Routes المحمية بـ Token
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    //  Routes just Admin )
    Route::middleware('role:admin')->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/reports', [DashboardController::class, 'report']);
        Route::get('/parapharmacy-settings', [ParapharmacySettingController::class, 'show']);
        Route::put('/parapharmacy-settings', [ParapharmacySettingController::class, 'update']);
    });

    //  Routes  Admin et Vendeuse
    Route::middleware('role:admin,vendeuse')->group(function () {
        // Products & Stock Management
        Route::patch('/products/{product}/add-stock', [ProductController::class, 'addStock']);
        Route::get('/products/low-stock', [ProductController::class, 'lowStock']);
        Route::apiResource('products', ProductController::class);

        // Categories
        Route::apiResource('categories', CategoryController::class);

        // Orders / Sales
        Route::apiResource('orders', OrderController::class)->except(['update']);
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);

        // Services & Reservations
        Route::apiResource('services', ServiceController::class);
        Route::get('/reservations', [ReservationController::class, 'index']);
        Route::post('/reservations', [ReservationController::class, 'store']);
        Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus']);
    });
});
