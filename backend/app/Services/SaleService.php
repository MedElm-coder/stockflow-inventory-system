<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SaleService
{
    /**
     * Process a sale transaction.
     *
     * @param  array  $items  Each: ['product_id' => int, 'quantity' => int]
     * @param  array  $payment ['amount_paid' => float, 'payment_method' => string]
     */
    public function createSale(User $cashier, array $items, array $payment): Sale
    {
        return DB::transaction(function () use ($cashier, $items, $payment) {
            $total = 0;
            $lineItems = [];

            foreach ($items as $item) {
                // Lock the row for update to prevent race conditions on stock
                $product = Product::where('id', $item['product_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                $quantity = (int) $item['quantity'];

                if ($product->stock_quantity < $quantity) {
                    throw new InsufficientStockException(
                        $product->name,
                        $product->stock_quantity,
                        $quantity
                    );
                }

                $subtotal = round($product->price * $quantity, 2);
                $total += $subtotal;

                // Snapshot price/name at time of sale
                $lineItems[] = [
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'unit_price'   => $product->price,
                    'quantity'     => $quantity,
                    'subtotal'     => $subtotal,
                ];

                // Deduct stock
                $product->decrement('stock_quantity', $quantity);
            }

            $amountPaid = round((float) $payment['amount_paid'], 2);

            if ($amountPaid < $total) {
                throw new InsufficientStockException(
                    'payment', // reuse generic guard; message overridden below
                    0,
                    0
                );
            }

            // Create the sale
            $sale = Sale::create([
                'reference'      => $this->generateReference(),
                'user_id'        => $cashier->id,
                'total_amount'   => $total,
                'amount_paid'    => $amountPaid,
                'change_due'     => round($amountPaid - $total, 2),
                'payment_method' => $payment['payment_method'] ?? 'cash',
            ]);

            // Create line items
            $sale->items()->createMany($lineItems);

            return $sale->load('items', 'cashier');
        });
    }

    /**
     * Generate a unique invoice reference, e.g. INV-20260620-A1B2C3.
     */
    private function generateReference(): string
    {
        return 'INV-' . now()->format('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
    }
}