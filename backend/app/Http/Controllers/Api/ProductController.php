<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * List products with search, filtering, and pagination.
     *
     * Query params:
     *   search        - matches name or SKU
     *   category_id   - filter by category
     *   stock         - "low" returns only low-stock items
     *   status        - "active" / "inactive"
     *   per_page      - results per page (default 15)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with('category');

        // Search by name or SKU
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Filter by stock status (low stock only)
        if ($request->query('stock') === 'low') {
            $query->whereColumn('stock_quantity', '<=', 'low_stock_threshold');
        }

        // Filter by active status
        if ($request->query('status') === 'active') {
            $query->where('is_active', true);
        } elseif ($request->query('status') === 'inactive') {
            $query->where('is_active', false);
        }

        $perPage = (int) $request->query('per_page', 15);
        $products = $query->latest()->paginate($perPage);

        return ProductResource::collection($products);
    }

    /**
     * Store a new product (with optional image).
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($data);

        return (new ProductResource($product->load('category')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show a single product.
     */
    public function show(Product $product): ProductResource
    {
        return new ProductResource($product->load('category'));
    }

    /**
     * Update a product (optionally replacing its image).
     */
    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Delete the old image if present
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $data['image_path'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        return new ProductResource($product->load('category'));
    }

    /**
     * Delete a product (and its image).
     */
    public function destroy(Product $product): JsonResponse
    {
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully.']);
    }
}