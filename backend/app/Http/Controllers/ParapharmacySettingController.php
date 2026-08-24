<?php

namespace App\Http\Controllers;

use App\Models\ParapharmacySetting;
use Illuminate\Http\Request;

class ParapharmacySettingController extends Controller
{
    // جلب معلومات الـ Para
    public function show()
    {
        $settings = ParapharmacySetting::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Ma Parapharmacie',
                'phone' => '0600000000',
                'address' => 'Adresse de la parapharmacie',
                'email' => 'contact@parapharmacie.com'
            ]
        );

        return response()->json($settings);
    }

    // تحديث المعلومات
    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'address' => 'required|string|max:500',
            'email' => 'nullable|email',
            'ice' => 'nullable|string'
        ]);

        $settings = ParapharmacySetting::firstOrCreate(['id' => 1]);
        $settings->update($request->all());

        return response()->json([
            'message' => 'Informations mises à jour avec succès',
            'data' => $settings
        ]);
    }
}
