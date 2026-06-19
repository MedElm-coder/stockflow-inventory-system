<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique(); // e.g. INV-20260619-0001
            $table->foreignId('user_id')           // cashier who made the sale
                  ->constrained()
                  ->onDelete('cascade');
            $table->decimal('total_amount', 10, 2);
            $table->decimal('amount_paid', 10, 2);
            $table->decimal('change_due', 10, 2)->default(0);
            $table->enum('payment_method', ['cash', 'card', 'other'])->default('cash');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};