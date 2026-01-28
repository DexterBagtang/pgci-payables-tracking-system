<?php

namespace App\Http\Controllers;

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
        $manuals = $this->getManuals();

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

        $availableManuals = $this->getManuals();

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
     * Get all available manuals.
     */
    private function getManuals(): array
    {
        return [
            [
                'slug' => 'bulk-invoice-creation',
                'title' => 'Bulk Invoice Creation Guide',
                'description' => 'Create multiple invoices at once',
            ],
            [
                'slug' => 'invoice-approval-workflow',
                'title' => 'Invoice Approval Workflow Guide',
                'description' => 'Review and approve invoices in bulk',
            ],
            [
                'slug' => 'check-requisition-creation',
                'title' => 'Check Requisition Creation Guide',
                'description' => 'Create check requisitions easily',
            ],
        ];
    }
}
