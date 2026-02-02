<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use Illuminate\Console\Command;

class MarkOverdueInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:mark-overdue {--dry-run : Run without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark invoices as overdue based on their due date';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');

        if ($isDryRun) {
            $this->info('Running in DRY RUN mode - no changes will be made');
        }

        // Get all invoices that should be marked as overdue
        $invoices = Invoice::needsOverdueCheck()->get();

        if ($invoices->isEmpty()) {
            $this->info('No invoices need to be marked as overdue.');
            return self::SUCCESS;
        }

        $this->info("Found {$invoices->count()} invoice(s) to mark as overdue.");

        $marked = 0;
        $failed = 0;

        foreach ($invoices as $invoice) {
            $daysOverdue = now()->startOfDay()->diffInDays($invoice->due_date);

            if ($isDryRun) {
                $this->line("Would mark invoice {$invoice->si_number} as overdue ({$daysOverdue} days overdue)");
                $marked++;
            } else {
                try {
                    if ($invoice->markOverdueIfNeeded()) {
                        $this->line("✓ Marked invoice {$invoice->si_number} as overdue ({$daysOverdue} days)");
                        $marked++;

                        // Log the status change
                        $invoice->logStatusChange(
                            $invoice->getOriginal('invoice_status'),
                            'overdue',
                            "Automatically marked as overdue ({$daysOverdue} days past due date)"
                        );
                    }
                } catch (\Exception $e) {
                    $this->error("✗ Failed to mark invoice {$invoice->si_number}: {$e->getMessage()}");
                    $failed++;
                }
            }
        }

        // Summary
        $this->newLine();
        if ($isDryRun) {
            $this->info("DRY RUN SUMMARY:");
            $this->info("Would mark {$marked} invoice(s) as overdue");
        } else {
            $this->info("SUMMARY:");
            $this->info("Successfully marked {$marked} invoice(s) as overdue");
            if ($failed > 0) {
                $this->warn("Failed to mark {$failed} invoice(s)");
            }
        }

        return self::SUCCESS;
    }
}
