<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')->id;

        return [
            'category_id'         => ['sometimes', 'required', 'exists:categories,id'],
            'name'                => ['sometimes', 'required', 'string', 'max:255'],
            'sku'                 => [
                'sometimes', 'required', 'string', 'max:100',
                Rule::unique('products', 'sku')->ignore($productId),
            ],
            'description'         => ['nullable', 'string'],
            'price'               => ['sometimes', 'required', 'numeric', 'min:0'],
            'cost_price'          => ['nullable', 'numeric', 'min:0'],
            'stock_quantity'      => ['sometimes', 'required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'is_active'           => ['nullable', 'boolean'],
            'image'               => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
        ];
    }
}