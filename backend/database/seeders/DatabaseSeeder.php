<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---- Users ----
        User::create([
            'name'     => 'Admin User',
            'email'    => 'admin@stockflow.test',
            'password' => Hash::make('password123'),
            'role'     => 'admin',
        ]);

        User::create([
            'name'     => 'Cashier User',
            'email'    => 'cashier@stockflow.test',
            'password' => Hash::make('password123'),
            'role'     => 'cashier',
        ]);

        // ---- Categories with products ----
        $categories = [
            'Beverages'     => 'Soft drinks, water, juices, and hot drinks',
            'Snacks'        => 'Chips, candy, nuts, and quick bites',
            'Dairy'         => 'Milk, cheese, yogurt, and butter',
            'Bakery'        => 'Bread, pastries, and baked goods',
            'Household'     => 'Cleaning supplies and home essentials',
            'Personal Care' => 'Toiletries and hygiene products',
        ];

        foreach ($categories as $name => $description) {
            $category = Category::create([
                'name'        => $name,
                'description' => $description,
            ]);

            Product::factory()
                ->count(6)
                ->for($category)
                ->create();

            Product::factory()
                ->count(2)
                ->lowStock()
                ->for($category)
                ->create();
        }
    }
}