<?php

namespace App\Exceptions;

use Exception;

class InsufficientStockException extends Exception
{
    public function __construct(string $productName, int $available, int $requested)
    {
        parent::__construct(
            "Insufficient stock for '{$productName}'. Available: {$available}, requested: {$requested}."
        );
    }
}