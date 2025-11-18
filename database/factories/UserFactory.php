<?php

namespace Database\Factories;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'role' => fake()->randomElement(UserRole::cases()),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create an admin user.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::ADMIN,
        ]);
    }

    /**
     * Create a purchasing user.
     */
    public function purchasing(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::PURCHASING,
        ]);
    }

    /**
     * Create a payables user.
     */
    public function payables(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::PAYABLES,
        ]);
    }

    /**
     * Create a disbursement user.
     */
    public function disbursement(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::DISBURSEMENT,
        ]);
    }
}
