<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index()
    {
        $reservations = Reservation::with(['user', 'service'])->latest()->get();

        return response()->json($reservations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'reservation_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'service_id' => $validated['service_id'],
            'reservation_date' => $validated['reservation_date'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Réservation créée avec succès',
            'reservation' => $reservation->load('service'),
        ], 201);
    }

    public function updateStatus(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        $reservation->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Statut de la réservation mis à jour',
            'reservation' => $reservation,
        ]);
    }
}
