<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use PDOException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
        $this->renderable(function (PDOException $e, Request $req){
            $sqlState = $e->getCode();
            $errorMessage = $e->getMessage();
            //postgres
            $driverCode = $e->errorInfo[0] ?? null; 
            // Constraint violation
            if($sqlState === '23000' ||($driverCode && str_starts_with($driverCode,'23'))){
                
                if (str_contains($errorMessage, 'UNIQUE constraint failed') || $driverCode === '23505') {
                    return response()->json(['error' => 'BAD_REQUEST'], 400);
                }
                if (str_contains($errorMessage, 'FOREIGN KEY constraint failed') || $driverCode === '23503') {
                    return response()->json(['error' => 'invalid_key'], 400);
                }

                // Safe measures but these should not happen
                if (str_contains($errorMessage, 'NOT NULL constraint failed') || $driverCode === '23502') {
                    return response()->json(['error' => 'BAD_REQUEST'], 400);
                }

                if (str_contains($errorMessage, 'CHECK constraint failed') || $driverCode === '23514') {
                    return response()->json(['error' => 'BAD_REQUEST'], 422);
                }

                // Fallback
                return response()->json(['error' => 'BAD_REQUEST'], 400);
            };
        });
    }
}
