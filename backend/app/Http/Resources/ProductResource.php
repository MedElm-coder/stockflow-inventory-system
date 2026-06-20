<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            'sku'                 => $this->sku,
            'description'         => $this->description,
            'price'               => $this->price,
            'cost_price'          => $this->cost_price,
            'stock_quantity'      => $this->stock_quantity,
            'low_stock_threshold' => $this->low_stock_threshold,
            'is_low_stock'        => $this->isLowStock(),
            'is_active'           => $this->is_active,
            'image_url'           => $this->image_path
                ? Storage::url($this->image_path)
                : null,
            'category'            => new CategoryResource($this->whenLoaded('category')),
            'created_at'          => $this->created_at,
            'updated_at'          => $this->updated_at,
        ];
    }
}