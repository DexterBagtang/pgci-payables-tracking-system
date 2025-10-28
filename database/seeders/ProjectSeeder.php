<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = [
            "SCS for IKEA - Lift 6 Backbone Provision",
            "SM Pampanga - Data and Voice for Dermcare",
            "SM Calamba - Data and Provisions for Caramia Gelato and Toms World",
            "SM Manila - SCS for Data Provision for Salazar",
            "SM City Iloilo -  Cinema and Event Center FOC Provision",
            "SM North EDSA - Voice and Data Provision for 2F North Tower - Koomi",
            "D'Heights Hotel ISP and OSP",
            "Terminal Zone and Tower of PITX",
            "Lyceum of the Phils. Laguna",
            "New Coast Hotel Inc.",
            "FOC Installation for IDA Service for Woofy - SMDC Field Residences",
            "FOC Installation for IDA Service for Woofy - Magnolia Residence",
            "Additional SCS works for additional AP for Chinabank HO - 9th Floor",
            "FOC Installation for IDA Service for NU Mendiola",
            "Installation of FOC for the Migration of Circuit for Waltermart Carmona",
            "FOC Provision for IDA Service for Vertical Solutions - Quezon City",
            "FOC Provision for China Bank Head Office (Renovation) - Additional Works",
            "FOC Provision for the transfer of ETPI Telstra - 7th Floor Y Tower",
            "FOC Provision for the DPL Service for RISE CORTEVA - 10F Mega Tower",
            "FOC Provision for the DPL Service for Innove 36th Floor Mega Tower",
            "FOC Provision for the Fiberbiz Plan for League of Municipalities of the Philippines",
        ];

        foreach ($projects as $project) {
            Project::factory()->create([
                'project_title' => $project,
            ]);

        }

    }
}
