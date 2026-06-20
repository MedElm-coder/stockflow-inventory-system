<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * High-level summary stats for the dashboard cards.
     */
    public function summary(): JsonResponse
    {
        $today = Carbon::today();

        return response()->json([
            'today_revenue'      => round((float) Sale::whereDate('created_at', $today)->sum('total_amount'), 2),
            'today_sales_count'  => Sale::whereDate('created_at', $today)->count(),
            'total_revenue'      => round((float) Sale::sum('total_amount'), 2),
            'total_sales_count'  => Sale::count(),
            'total_products'     => Product::count(),
            'low_stock_count'    => Product::whereColumn('stock_quantity', '<=', 'low_stock_threshold')->count(),
            // Inventory value at cost (what the stock on hand is worth)
            'inventory_value'    => round((float) Product::sum(DB::raw('stock_quantity * cost_price')), 2),
        ]);
    }

    /**
     * Top-selling products by quantity sold.
     */
    public function topProducts(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 5);

        $top = SaleItem::select(
                'product_id',
                'product_name',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(subtotal) as total_revenue')
            )
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_quantity')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'product_id'    => $row->product_id,
                'product_name'  => $row->product_name,
                'total_quantity' => (int) $row->total_quantity,
                'total_revenue' => round((float) $row->total_revenue, 2),
            ]);

        return response()->json(['data' => $top]);
    }

    /**
     * Sales totals per day over the last N days (for a line/bar chart).
     */
    public function salesOverTime(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 7);
        $startDate = Carbon::today()->subDays($days - 1);

        // Aggregate actual sales by day
        $rows = Sale::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as sales_count')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->pluck('revenue', 'date'); // [ 'Y-m-d' => revenue ]

        // Build a continuous series so days with zero sales still appear
        $series = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i)->toDateString();
            $series[] = [
                'date'    => $date,
                'revenue' => round((float) ($rows[$date] ?? 0), 2),
            ];
        }

        return response()->json(['data' => $series]);
    }

    /**
     * Low-stock products list (for the dashboard alert panel).
     */
    public function lowStock(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 10);

        $products = Product::whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->orderBy('stock_quantity')
            ->limit($limit)
            ->get(['id', 'name', 'sku', 'stock_quantity', 'low_stock_threshold']);

        return response()->json(['data' => $products]);
    }
}