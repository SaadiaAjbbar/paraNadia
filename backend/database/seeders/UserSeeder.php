<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {

        User::updateOrCreate(
            ['email' => 'admin@parapharmacie.com'],
            [
                'name' => 'Admin Nadia',
                'password' => Hash::make('admin123456'),
                'role' => 'admin',
            ]
        );

        
        User::updateOrCreate(
            ['email' => 'vendeuse@parapharmacie.com'],
            [
                'name' => 'Vendeuse',
                'password' => Hash::make('vendeuse123456'),
                'role' => 'vendeuse',
            ]
        );
    }
}
