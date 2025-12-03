<?php

namespace Database\Seeders;

use App\Models\PurchaseOrder;
use Illuminate\Database\Seeder;

class BackfillPurchaseOrderFinancialsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Backfills financial summary columns for all existing purchase orders
     */
    public function run(): void
    {
        $this->command->info('Backfilling purchase order financial summaries...');

        $totalCount = PurchaseOrder::count();
        $this->command->info("Found {$totalCount} purchase orders to process.");

        $bar = $this->command->getOutput()->createProgressBar($totalCount);
        $bar->start();

        $processedCount = 0;
        $errorCount = 0;

        // Process in chunks to avoid memory issues
        PurchaseOrder::chunk(100, function ($purchaseOrders) use ($bar, &$processedCount, &$errorCount) {
            foreach ($purchaseOrders as $po) {
                try {
                    $po->syncFinancials();
                    $processedCount++;
                } catch (\Exception $e) {
                    $errorCount++;
                    $this->command->error("\nError processing PO #{$po->po_number}: " . $e->getMessage());
                }
                $bar->advance();
            }
        });

        $bar->finish();
        $this->command->newLine(2);
        $this->command->info("✓ Backfill complete!");
        $this->command->info("  - Successfully processed: {$processedCount}");

        if ($errorCount > 0) {
            $this->command->warn("  - Errors encountered: {$errorCount}");
        }

        // Show sample of updated data
        $this->command->newLine();
        $this->command->info('Sample of updated purchase orders:');

        $samples = PurchaseOrder::withOutstanding()
            ->limit(5)
            ->get(['po_number', 'po_amount', 'total_invoiced', 'total_paid', 'outstanding_amount']);

        if ($samples->count() > 0) {
            $this->command->table(
                ['PO Number', 'PO Amount', 'Total Invoiced', 'Total Paid', 'Outstanding'],
                $samples->map(fn($po) => [
                    $po->po_number,
                    number_format($po->po_amount, 2),
                    number_format($po->total_invoiced, 2),
                    number_format($po->total_paid, 2),
                    number_format($po->outstanding_amount, 2),
                ])
            );
        }
    }
}
