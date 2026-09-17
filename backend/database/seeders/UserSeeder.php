<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@parapharmacie.com'],
            [
                'name' => 'Admin Nadia',
                'password' => 'admin123456', // بلا Hash::make() إلا كان Model داير hashed cast
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'vendeuse@parapharmacie.com'],
            [
                'name' => 'Vendeuse',
                'password' => 'vendeuse123456',
                'role' => 'vendeuse',
            ]
        );
    }
}