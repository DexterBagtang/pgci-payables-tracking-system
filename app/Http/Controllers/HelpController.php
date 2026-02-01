<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Gate;
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
            'categories' => $this->getCategories(),
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

        // Find current manual metadata
        $currentManual = collect($availableManuals)->firstWhere('slug', $slug);

        if (! $currentManual) {
            throw new NotFoundHttpException('Manual not found');
        }

        // Authorize access to the manual based on its category
        Gate::authorize('view-manual', $currentManual['category']);

        $content = File::get($filePath);

        // Extract title from first H1 or use slug
        preg_match('/^#\s+(.+)$/m', $content, $matches);
        $title = $matches[1] ?? ucwords(str_replace('-', ' ', $slug));

        return Inertia::render('help/show', [
            'manual' => array_merge([
                'slug' => $slug,
                'title' => $title,
                'content' => $content,
            ], $currentManual ?? []),
            'manuals' => $availableManuals,
            'categories' => $this->getCategories(),
        ]);
    }

    /**
     * Get all available manuals with metadata.
     */
    private function getManuals(): array
    {
        $manuals = [
            [
                'slug' => 'bulk-invoice-creation',
                'title' => 'Bulk Invoice Creation Guide',
                'description' => 'Create multiple invoices at once',
                'category' => 'core-workflows',
                'readTime' => 5,
                'icon' => 'FileStack',
            ],
            [
                'slug' => 'invoice-approval-workflow',
                'title' => 'Invoice Approval Workflow Guide',
                'description' => 'Review and approve invoices in bulk',
                'category' => 'core-workflows',
                'readTime' => 4,
                'icon' => 'CheckCircle2',
            ],
            [
                'slug' => 'check-requisition-creation',
                'title' => 'Check Requisition Creation Guide',
                'description' => 'Create check requisitions easily',
                'category' => 'core-workflows',
                'readTime' => 3,
                'icon' => 'FileText',
            ],
            [
                'slug' => 'vendor-management',
                'title' => 'Vendor Management Guide',
                'description' => 'Manage vendors and their information',
                'category' => 'management',
                'readTime' => 3,
                'icon' => 'Building2',
            ],
            [
                'slug' => 'project-management',
                'title' => 'Project Management Guide',
                'description' => 'Manage projects and budgets',
                'category' => 'management',
                'readTime' => 4,
                'icon' => 'FolderKanban',
            ],
        ];

        // Add metadata for each manual
        return array_map(function ($manual) {
            $filePath = base_path("docs/user-manuals/{$manual['slug']}.md");

            // Get last modified time
            $lastUpdated = File::exists($filePath)
                ? File::lastModified($filePath)
                : time();

            // Count sections (H2 headings)
            $content = File::exists($filePath) ? File::get($filePath) : '';
            preg_match_all('/^##\s+/m', $content, $matches);
            $pageCount = count($matches[0]);

            return array_merge($manual, [
                'lastUpdated' => date('Y-m-d', $lastUpdated),
                'pageCount' => $pageCount,
                'relatedGuides' => $this->getRelatedGuides($manual['slug']),
            ]);
        }, $manuals);
    }

    /**
     * Get related guides for a manual.
     */
    private function getRelatedGuides(string $slug): array
    {
        $relations = [
            'bulk-invoice-creation' => ['invoice-approval-workflow', 'check-requisition-creation'],
            'invoice-approval-workflow' => ['bulk-invoice-creation', 'check-requisition-creation'],
            'check-requisition-creation' => ['invoice-approval-workflow'],
            'vendor-management' => ['project-management'],
            'project-management' => ['vendor-management'],
        ];

        return $relations[$slug] ?? [];
    }

    /**
     * Get all manual categories.
     */
    private function getCategories(): array
    {
        return [
            [
                'key' => 'core-workflows',
                'title' => 'Core Workflows',
                'description' => 'Essential daily operations',
                'icon' => 'Workflow',
            ],
            [
                'key' => 'management',
                'title' => 'Management',
                'description' => 'Manage vendors and projects',
                'icon' => 'Settings',
            ],
        ];
    }
}
