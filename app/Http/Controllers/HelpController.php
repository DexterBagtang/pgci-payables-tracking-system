<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class HelpController extends Controller
{
    /**
     * Display the help index with available manuals.
     */
    public function index(): Response
    {
        $user = auth()->user();
        $role = $user->role;

        $manuals = $this->getManualsByRole($role);

        return Inertia::render('help/index', [
            'manuals' => $manuals,
        ]);
    }

    /**
     * Display a specific user manual.
     */
    public function show(string $slug): Response
    {
        // Security: validate slug format (alphanumeric and hyphens only)
        if (! preg_match('/^[a-z0-9-]+$/', $slug)) {
            throw new NotFoundHttpException('Invalid manual identifier');
        }

        $filePath = base_path("docs/user-manuals/{$slug}.md");

        if (! File::exists($filePath)) {
            throw new NotFoundHttpException('Manual not found');
        }

        // Verify user has access to this manual
        $user = auth()->user();
        $availableManuals = $this->getManualsByRole($user->role);
        $hasAccess = collect($availableManuals)->contains('slug', $slug);

        if (! $hasAccess) {
            throw new NotFoundHttpException('Manual not found');
        }

        $content = File::get($filePath);

        // Extract title from first H1 or use slug
        preg_match('/^#\s+(.+)$/m', $content, $matches);
        $title = $matches[1] ?? ucwords(str_replace('-', ' ', $slug));

        return Inertia::render('help/show', [
            'manual' => [
                'slug' => $slug,
                'title' => $title,
                'content' => $content,
            ],
            'manuals' => $availableManuals,
        ]);
    }

    /**
     * Get manuals filtered by user role.
     */
    private function getManualsByRole(UserRole $role): array
    {
        $allManuals = [
            [
                'slug' => 'bulk-invoice-creation',
                'title' => 'Bulk Invoice Creation Guide',
                'description' => 'Create multiple invoices at once',
                'roles' => ['admin', 'payables'],
                'complexity' => 'Intermediate',
                'timeToComplete' => '10 minutes',
            ],
            [
                'slug' => 'invoice-approval-workflow',
                'title' => 'Invoice Approval Workflow Guide',
                'description' => 'Review and approve invoices in bulk',
                'roles' => ['admin', 'payables'],
                'complexity' => 'Intermediate',
                'timeToComplete' => '8 minutes',
            ],
        ];

        // Admin sees all manuals
        if ($role === UserRole::ADMIN) {
            return $allManuals;
        }

        // Filter by role
        return collect($allManuals)
            ->filter(fn ($manual) => in_array($role->value, $manual['roles']))
            ->values()
            ->toArray();
    }
}
