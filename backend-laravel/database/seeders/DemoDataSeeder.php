<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\TowingRequest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        //   demo customer
        $customer = User::create([
            'name' => 'Ashwin Customer',
            'email' => 'ashwin@test.com',
            'password' => Hash::make('password123'),
            'user_type' => 'customer',
        ]);

        //   demo driver
        $driver = User::create([
            'name' => 'Ashy Driver',
            'email' => 'driver@test.com',
            'password' => Hash::make('password123'),
            'user_type' => 'driver',
        ]);

        //  demo towing requests
        TowingRequest::create([
            'customer_name' => 'Ashwin Customer',
            'location' => 'Downtown Dubai, Near Burj Khalifa',
            'latitude' => 25.197197,
            'longitude' => 55.274376,
            'note' => 'Car breakdown, need immediate assistance',
            'status' => 'pending',
            'customer_id' => $customer->id,
        ]);

        TowingRequest::create([
            'customer_name' => 'Sarah Ahmed',
            'location' => 'Dubai Marina, Marina Mall',
            'latitude' => 25.080389,
            'longitude' => 55.139305,
            'note' => 'Flat tire, car cannot move',
            'status' => 'assigned',
            'customer_id' => $customer->id,
            'driver_id' => $driver->id,
        ]);

        TowingRequest::create([
            'customer_name' => 'Ali Hassan',
            'location' => 'Jumeirah Beach Residence',
            'latitude' => 25.069722,
            'longitude' => 55.134167,
            'note' => 'Engine overheated',
            'status' => 'pending',
        ]);
    }
}
