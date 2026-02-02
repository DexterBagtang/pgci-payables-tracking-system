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
     * Get all available manuals with metadata (filtered by user permissions).
     */
    private function getManuals(): array
    {
        $allManuals = [
            [
                'slug' => 'bulk-invoice-addition',
                'title' => 'Bulk Invoice Addition Guide',
                'description' => 'Add multiple invoices at once',
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
            [
                'slug' => 'purchase-order-management',
                'title' => 'Purchase Order Management Guide',
                'description' => 'Create and manage purchase orders',
                'category' => 'management',
                'readTime' => 5,
                'icon' => 'Receipt',
                'meta' => [
                    'roles' => ['Admin', 'Purchasing'],
                    'statusFlow' => ['Draft', 'Open', 'Closed'],
                    'description' => 'Create and manage purchase orders from creation through closure.',
                ],
            ],
        ];

        // Add metadata for each manual
        $manualsWithMetadata = array_map(function ($manual) {
            $filePath = base_path("docs/user-manuals/{$manual['slug']}.md");

            // Get last modified time
            $lastUpdated = File::exists($filePath)
                ? File::lastModified($filePath)
                : time();

            // Get content for search
            $content = File::exists($filePath) ? File::get($filePath) : '';

            // Count sections (H2 headings)
            preg_match_all('/^##\s+/m', $content, $matches);
            $pageCount = count($matches[0]);

            return array_merge($manual, [
                'lastUpdated' => date('Y-m-d', $lastUpdated),
                'pageCount' => $pageCount,
                'content' => $content, // Include content for search
                'relatedGuides' => $this->getRelatedGuides($manual['slug']),
            ]);
        }, $allManuals);

        // Filter manuals based on user permissions
        return array_values(array_filter($manualsWithMetadata, function ($manual) {
            return Gate::allows('view-manual', $manual['category']);
        }));
    }

    /**
     * Get related guides for a manual.
     */
    private function getRelatedGuides(string $slug): array
    {
        $relations = [
            'bulk-invoice-addition' => ['invoice-approval-workflow', 'check-requisition-creation'],
            'invoice-approval-workflow' => ['bulk-invoice-addition', 'check-requisition-creation'],
            'check-requisition-creation' => ['invoice-approval-workflow'],
            'vendor-management' => ['project-management', 'purchase-order-management'],
            'project-management' => ['vendor-management', 'purchase-order-management'],
            'purchase-order-management' => ['vendor-management', 'project-management'],
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
