<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vendor;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        $vendors = [
            'SHELL ACA',
            'ZANON',
            'MIGHTYLYNX',
            'AWS',
            'BPIN',
            'ISTUDIO',
            'INTERLITE',
            'DATALEC',
            'GLEETECH',
            'BEYOND NETWORK',
            'ZIALCITA',
            'ANSON',
            'GAERLAN',
            'OS1 SOLUTIONS',
            'CIRCUIT SOLUTION',
            'AXN',
            'SOLUTIONSXPERT',
            'HANNAH',
            'RICKLEE',
            'CELL KONEK',
            'NETPAC',
            'SYNETCOM',
            'LASERTEL',
            'MAKATI MOTORIST',
            'FIBER-REX',
            'PALAWAN MOVERS',
            'VST ECS',
            '4C Environmental',
            'FCOMSERV',
            'UNITEDPLEXUS',
            'GMA NEW MEDIA',
            'TYRETOWN',
            'ECOPY',
            'KITAL',
            'LAKAI',
            'MARSTECH',
            'SATURN',
            'HANS PAPER',
            'TECHCORE',
            'CELTECH',
            'TRINITY',
            'UNIMICROSIS',
            'MICROPHASE',
            'FIXED AND SEALED',
            'HPS ICT',
            'LSI',
            'TESTRONIX',
            'TANTOHGUAN',
            'KULAY MEDIA',
            'DATA COMPUTER',
            'MONARK',
            'LAC',
            'TOYOTA PASONG TAMO',
            'NSPH, INC.',
            'RDSP',
            'NEAT',
            'E-PLUS',
            'EQUICOM',
            'ARRONNA PHILS.',
            'LANTRO',
            'TELEEYE',
            'OFFICE LINE',
            'MOZARK',
            'TOYOTA',
            'ECOSON',
            'STELSEN',
            'EC&M',
            'CHUGFINITY',
            'CIRCUIT',
            'AS1',
            'INTERGRATED POWER',
        ];

        foreach ($vendors as $vendorName) {
            Vendor::factory()->create([
                'name' => $vendorName,
            ]);
        }
    }
}
