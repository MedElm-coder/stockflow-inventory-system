<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $cost  = fake()->randomFloat(2, 1, 50);
        $price = round($cost * fake()->randomFloat(2, 1.2, 2.0), 2); // markup over cost

        return [
            'category_id'         => Category::factory(),
            'name'                => ucfirst(fake()->words(2, true)),
            'sku'                 => strtoupper(Str::random(3)) . '-' . fake()->unique()->numberBetween(1000, 9999),
            'description'         => fake()->optional()->sentence(),
            'price'               => $price,
            'cost_price'          => $cost,
            'stock_quantity'      => fake()->numberBetween(0, 100),
            'low_stock_threshold' => 10,
            'is_active'           => fake()->boolean(90), // ~90% active
        ];
    }

    /**
     * State: force a low-stock product (for demoing the low-stock filter).
     */
    public function lowStock(): static
    {
        return $this->state(fn () => [
            'stock_quantity'      => fake()->numberBetween(0, 8),
            'low_stock_threshold' => 10,
        ]);
    }
}