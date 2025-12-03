<?php

namespace App\Console\Commands;

use App\Models\PurchaseOrder;
use Illuminate\Console\Command;

class ReconcilePurchaseOrderFinancials extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'po:reconcile-financials {--verify : Only verify, don\'t fix} {--show-all : Show all POs, not just discrepancies}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reconcile purchase order financial summary columns';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $verifyOnly = $this->option('verify');
        $showAll = $this->option('show-all');
        $discrepancyCount = 0;
        $checkedCount = 0;

        $this->info('Checking purchase order financials...');
        $this->newLine();

        $totalCount = PurchaseOrder::count();
        $bar = $this->output->createProgressBar($totalCount);
        $bar->start();

        $discrepancies = [];

        PurchaseOrder::chunk(100, function ($purchaseOrders) use ($verifyOnly, &$discrepancyCount, &$checkedCount, &$discrepancies, $bar) {
            foreach ($purchaseOrders as $po) {
                $checkedCount++;
                $poDiscrepancies = $po->verifyFinancials();

                if (!empty($poDiscrepancies)) {
                    $discrepancyCount++;
                    $discrepancies[] = [
                        'po' => $po,
                        'issues' => $poDiscrepancies,
                    ];

                    if (!$verifyOnly) {
                        $po->syncFinancials();
                    }
                }

                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine(2);

        // Display results
        if ($discrepancyCount === 0) {
            $this->info("✓ All {$checkedCount} purchase orders are in sync!");
        } else {
            $this->warn("Found {$discrepancyCount} purchase order(s) with discrepancies out of {$checkedCount} checked.");
            $this->newLine();

            // Show first 10 discrepancies
            $displayCount = min($discrepancyCount, 10);
            $this->info("Showing first {$displayCount} discrepancies:");
            $this->newLine();

            foreach (array_slice($discrepancies, 0, 10) as $item) {
                $po = $item['po'];
                $issues = $item['issues'];

                $this->warn("PO #{$po->po_number} ({$po->id}):");
                $this->table(
                    ['Field', 'Stored', 'Calculated', 'Difference'],
                    collect($issues)->map(fn($d, $field) => [
                        $field,
                        '₱ ' . number_format($d['stored'], 2),
                        '₱ ' . number_format($d['calculated'], 2),
                        '₱ ' . number_format($d['difference'], 2),
                    ])
                );
                $this->newLine();
            }

            if ($discrepancyCount > 10) {
                $this->info("... and " . ($discrepancyCount - 10) . " more.");
                $this->newLine();
            }

            if ($verifyOnly) {
                $this->info('Run without --verify to fix these discrepancies.');
            } else {
                $this->info('✓ All discrepancies have been fixed!');
            }
        }

        // Show summary statistics
        if ($showAll || $discrepancyCount > 0) {
            $this->newLine();
            $this->info('Summary Statistics:');
            $summary = PurchaseOrder::selectRaw('
                COUNT(*) as total_pos,
                SUM(po_amount) as total_po_amount,
                SUM(total_invoiced) as total_invoiced,
                SUM(total_paid) as total_paid,
                SUM(outstanding_amount) as total_outstanding
            ')->first();

            $this->table(
                ['Metric', 'Value'],
                [
                    ['Total POs', number_format($summary->total_pos)],
                    ['Total PO Amount', '₱ ' . number_format($summary->total_po_amount, 2)],
                    ['Total Invoiced', '₱ ' . number_format($summary->total_invoiced, 2)],
                    ['Total Paid', '₱ ' . number_format($summary->total_paid, 2)],
                    ['Total Outstanding', '₱ ' . number_format($summary->total_outstanding, 2)],
                ]
            );
        }

        return $discrepancyCount === 0 ? 0 : 1;
    }
}
