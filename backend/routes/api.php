<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require a valid Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin-only test route (proves role middleware works)
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/ping', function () {
            return response()->json(['message' => 'Hello, admin. Role check passed.']);
        });
    });
});