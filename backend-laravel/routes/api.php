<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TowingRequestController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Public - Anyone can view and create requests  
Route::get('/requests', [TowingRequestController::class, 'index']);
Route::post('/requests', [TowingRequestController::class, 'store']);
Route::get('/requests/{id}', [TowingRequestController::class, 'show']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // Towing request routes
    Route::prefix('requests')->group(function () {
        Route::put('/{id}/accept', [TowingRequestController::class, 'accept']);
        Route::put('/{id}/status', [TowingRequestController::class, 'updateStatus']);
    });
});
