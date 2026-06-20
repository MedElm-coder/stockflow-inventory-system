<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'reference'      => $this->reference,
            'total_amount'   => $this->total_amount,
            'amount_paid'    => $this->amount_paid,
            'change_due'     => $this->change_due,
            'payment_method' => $this->payment_method,
            'cashier'        => [
                'id'   => $this->cashier?->id,
                'name' => $this->cashier?->name,
            ],
            'items'          => SaleItemResource::collection($this->whenLoaded('items')),
            'created_at'     => $this->created_at,
        ];
    }
}