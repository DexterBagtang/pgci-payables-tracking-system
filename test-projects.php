<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== PROJECTS DEBUG ===\n\n";

$projects = App\Models\Project::with('purchaseOrders')->get();

echo "Total Projects: " . $projects->count() . "\n\n";

foreach ($projects as $project) {
    echo "Project: {$project->project_title} (ID: {$project->id})\n";
    echo "  Status: '{$project->project_status}'\n";
    echo "  Type: {$project->project_type}\n";
    echo "  Budget: {$project->total_contract_cost}\n";
    echo "  POs: {$project->purchaseOrders->count()}\n";

    foreach ($project->purchaseOrders as $po) {
        echo "    - PO#{$po->po_number} | Status: {$po->po_status} | Amount: {$po->po_amount}\n";
    }
    echo "\n";
}

echo "\n=== TEST QUERY ===\n";
$activeProjects = App\Models\Project::where(function($q) {
    $q->where('project_status', 'active')
      ->orWhereNull('project_status')
      ->orWhere('project_status', '');
})->count();

echo "Active projects count: {$activeProjects}\n";

// Test WITH the whereNotIn (current buggy code)
$topProjects = App\Models\Project::where(function($q) {
    $q->where('project_status', 'active')
      ->orWhereNull('project_status')
      ->orWhere('project_status', '');
})
->whereNotIn('project_status', ['completed', 'cancelled'])
->with(['purchaseOrders' => function($query) {
    $query->whereIn('po_status', ['open', 'closed']);
}])
->get();

echo "Top projects WITH whereNotIn: {$topProjects->count()}\n";
foreach ($topProjects as $project) {
    echo "  - {$project->project_title}: {$project->purchaseOrders->count()} POs\n";
}

// Test WITHOUT the whereNotIn (should work)
$topProjectsFixed = App\Models\Project::where(function($q) {
    $q->where('project_status', 'active')
      ->orWhereNull('project_status')
      ->orWhere('project_status', '');
})
->with(['purchaseOrders' => function($query) {
    $query->whereIn('po_status', ['open', 'closed']);
}])
->get();

echo "\nTop projects WITHOUT whereNotIn: {$topProjectsFixed->count()}\n";
foreach ($topProjectsFixed as $project) {
    echo "  - {$project->project_title}: {$project->purchaseOrders->count()} POs\n";
}

// Test the SQL query
echo "\n=== SQL DEBUG ===\n";
$query = App\Models\Project::where(function($q) {
    $q->where('project_status', 'active')
      ->orWhereNull('project_status')
      ->orWhere('project_status', '');
})
->whereNotIn('project_status', ['completed', 'cancelled']);
echo "Query SQL: " . $query->toSql() . "\n";
echo "Query Bindings: " . json_encode($query->getBindings()) . "\n";

// Test the FIXED service method
echo "\n=== FIXED SERVICE TEST ===\n";
$service = new App\Services\Dashboard\PurchasingMetricsService();
$metrics = $service->getProjectMetrics(null, null);

echo "Active projects: {$metrics['active_projects']}\n";
echo "SM projects: {$metrics['sm_projects']}\n";
echo "Philcom projects: {$metrics['philcom_projects']}\n";
echo "Top projects count: " . count($metrics['top_projects']) . "\n\n";

if (!empty($metrics['top_projects'])) {
    echo "Top Projects Details:\n";
    foreach ($metrics['top_projects'] as $proj) {
        echo "  - {$proj['project_title']}\n";
        echo "    CER: {$proj['cer_number']}\n";
        echo "    Type: {$proj['project_type']}\n";
        echo "    Budget: ₱{$proj['total_contract_cost']}\n";
        echo "    Spent: ₱{$proj['total_spent']}\n";
        echo "    POs: {$proj['po_count']}\n";
        echo "    Utilization: {$proj['utilization_percentage']}%\n\n";
    }
} else {
    echo "❌ No top projects data!\n";
}
