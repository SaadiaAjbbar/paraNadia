<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // عرض جميع الطلبيات للأدمن
    public function index()
    {
        $orders = Order::with('items.product')->latest()->get();

        return response()->json($orders);
    }

    // إنشاء طلبية جديدة
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $totalAmount = 0;
            $itemsData = [];

            // التحقق من التوفر فـ الـ Stock وحساب التكلفة الإجمالية
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    return response()->json([
                        'message' => "Le stock est insuffisant pour le produit: {$product->name}"
                    ], 422);
                }

                $itemPrice = $product->price * $item['quantity'];
                $totalAmount += $itemPrice;

                $itemsData[] = [
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                ];
            }

            // إنشاء الطلب
            $order = Order::create([
                'user_id' => $request->user()?->id,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'shipping_address' => $validated['shipping_address'],
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'notes' => $validated['notes'] ?? null,
            ]);

            // إضافة المنتجات للطلب وتنقيص الـ Stock
            foreach ($itemsData as $data) {
                $order->items()->create([
                    'product_id' => $data['product']->id,
                    'quantity' => $data['quantity'],
                    'price' => $data['price'],
                ]);

                // تحديث الـ Stock
                $data['product']->decrement('stock', $data['quantity']);
            }

            return response()->json([
                'message' => 'Commande créée avec succès',
                'order' => $order->load('items.product'),
            ], 201);
        });
    }

    // تفاصيل طلبية معينة
    public function show(Order $order)
    {
        return response()->json($order->load('items.product'));
    }

    // تحديث حالة الطلبية (pending, processing, completed, cancelled)
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Statut de la commande mis à jour',
            'order' => $order,
        ]);
    }
}
