<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
        }
    </style>
</head>
<body class="p-5 bg-white">
<div class="border-2 border-black w-[700px]">
    <!-- Header with Logo -->
    <div class="border-b-2 border-black text-center py-3 flex items-center justify-center gap-2">
        <img src="{{ public_path('logo.png') }}" alt="philcom logo" class="w-16 h-10 object-contain">
        <span class="text-2xl font-bold tracking-wider">Philcom</span>
    </div>

    <!-- Main Content Area -->
    <div class="px-4 py-2">
        <!-- PHP and Date Row -->
        <div class="flex items-center justify-between py-1">
            <div class="flex items-center gap-2">
                <span class="font-bold text-xs">PHP</span>
                <span class="border-b border-black px-16 text-xs">5,000.00</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="font-bold text-xs">Date</span>
                <span class="border-b border-black px-12 text-xs">October 02, 2025</span>
            </div>
        </div>

        <!-- Payee Row -->
        <div class="flex items-center py-1">
            <span class="font-bold w-16 text-xs">Payee</span>
            <span class="border-b border-black flex-1 ml-2 text-xs">Cardo Dalisay</span>
        </div>

        <!-- Purpose Row -->
        <div class="flex items-start py-1">
            <span class="font-bold w-16 text-xs">Purpose</span>
            <span class="flex-1 ml-2 text-xs">Payment for Invoice 1265 - 1269</span>
        </div>

        <!-- Empty Space -->
        <div class="py-6"></div>

        <!-- PO/CER/SI Row -->
        <div class="flex justify-center items-center py-1 text-xs space-x-8">
            <span>PO # 69855</span>
            <span>CER # 69855</span>
            <span>SI # 1265-1269</span>
        </div>

        <!-- Account Charge Row -->
        <div class="flex items-end justify-between py-1">
            <span class="font-bold text-xs pb-0.5">Account Charge</span>
            <span class="border-b border-black flex-1 mx-2 text-xs"></span>
            <span class="text-xs pb-0.5">Budget Code</span>
        </div>

        <!-- Service Line Dist Row -->
        <div class="flex items-end py-1">
            <span class="font-bold w-32 text-xs pb-0.5">Service Line Dist.</span>
            <span class="border-b border-black flex-1 ml-2 text-xs"></span>
        </div>

        <!-- Amount in Words Row -->
        <div class="flex items-start py-1">
            <span class="font-bold w-32 text-xs">Amount (In words)</span>
            <div class="flex-1 ml-2">
                <div class="border-b border-black text-xs mb-1">&nbsp;</div>
                <div class="border-b border-black text-xs">&nbsp;</div>
            </div>
        </div>

        <!-- Empty Space -->
        <div class="py-4"></div>
    </div>

    <!-- Signature Section -->
    <div class="border-t-2 border-black px-4 py-2">
        <!-- Requested and Reviewed Row -->
        <div class="flex gap-4 py-1">
            <div class="flex-1 flex items-center">
                <span class="font-bold text-xs">Requested by:</span>
                <span class="border-b border-black flex-1 ml-2 text-xs">KA. USONA/ JL. MADERAZO</span>
            </div>
            <div class="flex-1 flex items-center">
                <span class="font-bold text-xs">Reviewed by:</span>
                <span class="border-b border-black flex-1 ml-2 text-xs">JS ORDONEZ / MR. ULIT/ JB LABAY</span>
            </div>
        </div>

        <!-- Approved By Row -->
        <div class="flex items-center py-1">
            <span class="font-bold text-xs">Approved by:</span>
            <span class="border-b border-black flex-1 ml-2 text-xs">CHRISTOPHER S. BAUTISTA / WILLY N. OCIER</span>
        </div>
    </div>
</div>
</body>
</html>
