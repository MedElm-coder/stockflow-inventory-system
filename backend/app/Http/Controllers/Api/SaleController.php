<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\InsufficientStockException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sale\StoreSaleRequest;
use App\Http\Resources\SaleResource;
use App\Models\Sale;
use App\Services\SaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SaleController extends Controller
{
    public function __construct(private SaleService $saleService)
    {
    }

    /**
     * List sales (most recent first), with optional date filtering.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Sale::with(['cashier', 'items'])->latest();

        if ($from = $request->query('from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->query('to')) {
            $query->whereDate('created_at', '<=', $to);
        }
        if ($reference = $request->query('search')) {
            $query->where('reference', 'like', "%{$reference}%");
        }

        return SaleResource::collection($query->paginate(15));
    }

    /**
     * Process a new sale.
     */
    public function store(StoreSaleRequest $request): JsonResponse
    {
        try {
            $sale = $this->saleService->createSale(
                $request->user(),
                $request->validated()['items'],
                [
                    'amount_paid'    => $request->validated()['amount_paid'],
                    'payment_method' => $request->validated()['payment_method'] ?? 'cash',
                ]
            );
        } catch (InsufficientStockException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return (new SaleResource($sale))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show a single sale with its items.
     */
    public function show(Sale $sale): SaleResource
    {
        return new SaleResource($sale->load(['cashier', 'items']));
    }
}