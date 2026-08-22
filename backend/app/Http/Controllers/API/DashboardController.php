<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        // 1. الإحصائيات العامة (KPIs)
        $totalRevenue = Order::where('status', 'completed')->sum('total_amount');
        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $totalReservations = Reservation::count();
        $pendingReservations = Reservation::where('status', 'pending')->count();
        $totalProducts = Product::count();

        // 2. منتجات قرب يسالى ليها الـ Stock (أقل من 5 قطع)
        $lowStockProducts = Product::where('stock', '<=', 5)
            ->select('id', 'name', 'stock', 'price')
            ->get();

        // 3. أحدث 5 طلبيات
        $recentOrders = Order::with('items.product')
            ->latest()
            ->take(5)
            ->get();

        // 4. أحدث 5 حجوزات
        $recentReservations = Reservation::with('service')
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'kpis' => [
                'total_revenue' => (float) $totalRevenue,
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'total_reservations' => $totalReservations,
                'pending_reservations' => $pendingReservations,
                'total_products' => $totalProducts,
            ],
            'low_stock_alert' => $lowStockProducts,
            'recent_orders' => $recentOrders,
            'recent_reservations' => $recentReservations,
        ]);
    }
    public function report(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|in:today,this_week,this_month,custom',
            'from_date' => 'required_if:period,custom|date',
            'to_date' => 'required_if:period,custom|date|after_or_equal:from_date',
        ]);

        $query = Order::where('status', 'completed');


        match ($request->period) {
            'today' => $query->whereDate('created_at', now()->today()),
            'this_week' => $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]),
            'this_month' => $query->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year),
            'custom' => $query->whereBetween('created_at', [$request->from_date, $request->to_date]),
            default => $query->whereMonth('created_at', now()->month),
        };

        $orders = $query->with('items.product')->get();
        $totalRevenue = $orders->sum('total_amount');
        $totalOrdersCount = $orders->count();

        return response()->json([
            'period' => $request->period ?? 'this_month',
            'total_revenue' => (float) $totalRevenue,
            'total_orders' => $totalOrdersCount,
            'orders' => $orders,
        ]);
    }
}
