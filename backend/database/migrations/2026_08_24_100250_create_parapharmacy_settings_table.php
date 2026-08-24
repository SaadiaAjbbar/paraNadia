<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parapharmacy_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Ma Parapharmacie');
            $table->string('phone')->default('0500000000');
            $table->string('address')->default('123 Rue Principale, Casablanca');
            $table->string('email')->nullable();
            $table->string('ice')->nullable(); // Optionnel : ICE pour facture
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parapharmacy_settings');
    }
};
