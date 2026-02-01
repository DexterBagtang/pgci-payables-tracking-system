<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('registration is disabled', function () {
    $response = $this->get('/register');

    $response->assertNotFound();
});

test('registration store is disabled', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertGuest();
    $response->assertNotFound();
});
