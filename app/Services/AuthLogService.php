<?php

namespace App\Services;

use App\Models\AuthLog;
use App\Models\User;
use Illuminate\Http\Request;

class AuthLogService
{
    /**
     * Log a successful login event
     */
    public function logLogin(User $user, Request $request, bool $remember = false): AuthLog
    {
        return AuthLog::create([
            'user_id' => $user->id,
            'event_type' => 'login',
            'session_id' => $request->session()->getId(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_method' => $remember ? 'remember_me' : 'web',
            'metadata' => [
                'username' => $user->username,
                'name' => $user->name,
            ],
            'created_at' => now(),
        ]);
    }

    /**
     * Log a logout event
     */
    public function logLogout(User $user, Request $request): AuthLog
    {
        return AuthLog::create([
            'user_id' => $user->id,
            'event_type' => 'logout',
            'session_id' => $request->session()->getId(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_method' => 'web',
            'metadata' => [
                'username' => $user->username,
                'name' => $user->name,
            ],
            'created_at' => now(),
        ]);
    }

    /**
     * Log a failed login attempt
     */
    public function logFailedLogin(string $username, Request $request): AuthLog
    {
        return AuthLog::create([
            'user_id' => null,
            'event_type' => 'failed_login',
            'username_attempted' => $username,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_method' => 'web',
            'metadata' => [
                'reason' => 'invalid_credentials',
            ],
            'created_at' => now(),
        ]);
    }

    /**
     * Log a password reset event
     */
    public function logPasswordReset(User $user, Request $request): AuthLog
    {
        return AuthLog::create([
            'user_id' => $user->id,
            'event_type' => 'password_reset',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'username' => $user->username,
            ],
            'created_at' => now(),
        ]);
    }

    /**
     * Get recent failed login attempts for a username
     */
    public function getRecentFailedAttempts(string $username, int $minutes = 15): int
    {
        return AuthLog::where('username_attempted', $username)
            ->where('event_type', 'failed_login')
            ->where('created_at', '>=', now()->subMinutes($minutes))
            ->count();
    }

    /**
     * Get recent failed login attempts from an IP
     */
    public function getRecentFailedAttemptsFromIp(string $ip, int $minutes = 15): int
    {
        return AuthLog::where('ip_address', $ip)
            ->where('event_type', 'failed_login')
            ->where('created_at', '>=', now()->subMinutes($minutes))
            ->count();
    }

    /**
     * Get user's login history
     */
    public function getUserLoginHistory(int $userId, int $limit = 10)
    {
        return AuthLog::where('user_id', $userId)
            ->whereIn('event_type', ['login', 'logout'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Check if user has suspicious login activity
     */
    public function hasSuspiciousActivity(User $user, Request $request): bool
    {
        // Get the last successful login
        $lastLogin = AuthLog::where('user_id', $user->id)
            ->where('event_type', 'login')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$lastLogin) {
            return false; // First login, not suspicious
        }

        // Check if IP address changed
        $ipChanged = $lastLogin->ip_address !== $request->ip();

        // Check if user agent changed significantly
        $userAgentChanged = $lastLogin->user_agent !== $request->userAgent();

        // You can add more sophisticated checks here
        return $ipChanged && $userAgentChanged;
    }
}
