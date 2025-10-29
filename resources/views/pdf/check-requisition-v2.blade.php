<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 11px;
        }

        @page {
            size: auto;
            margin: 10mm;
        }

        * {
            box-sizing: border-box;
        }

        .input-line {
            border-bottom: 1.5px solid #d1d5db;
            display: inline-block;
            min-height: 24px;
            line-height: 24px;
        }

        .label-text {
            color: #111827;
            font-weight: 600;
            letter-spacing: 0.3px;
            font-size: 0.7rem;
            display: inline-block;
            line-height: 24px;
        }

        .value-text {
            color: #374151;
        }

        .info-badge {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
        }

        .field-row {
            display: flex;
            align-items: baseline;
            margin-bottom: 12px;
        }
    </style>
</head>
<body class="bg-white">
<div class="border-2 border-gray-800 rounded m-4">
    <!-- Header -->
    <div class="flex items-center justify-center py-3 border-b-2 border-gray-800">
        <div class="bg-white rounded-lg">
            <img src="{{public_path('logo-full.png')}}" alt="philcom logo" class="h-16 object-contain">
        </div>
    </div>

    <!-- Main Content Area -->
    <div class="px-8 py-3 bg-white">
        <!-- PHP and Date Row -->
        <div class="flex items-baseline justify-between mb-5">
            <div class="flex items-baseline gap-3">
                <span class="label-text">PHP</span>
                <span class="input-line px-6 value-text font-extrabold">{{number_format($checkReq['php_amount'],2)}}</span>
            </div>
            <div class="flex items-baseline gap-3">
                <span class="label-text">Date</span>
                <span class="input-line px-6 value-text font-extrabold">{{\Carbon\Carbon::parse($checkReq['request_date'])->format('F d, Y')}}</span>
            </div>
        </div>

        <!-- Payee Row -->
        <div class="field-row">
            <span class="label-text" style="width: 80px;">Payee</span>
            <span class="input-line flex-1 ml-3 px-2 value-text">{{$checkReq['payee_name']}}</span>
        </div>

        <!-- Purpose Row -->
        <div class="field-row mb-16">
            <span class="label-text" style="width: 80px; align-self: flex-start;">Purpose</span>
            <span class="flex-1 ml-3 px-2 value-text leading-relaxed" style="white-space: pre-line;">{{$checkReq['purpose']}}</span>
        </div>

        <!-- PO/CER/SI Row with Badges -->
        <div class="flex justify-center items-center gap-6 mb-8 mt-8">
            <div class="info-badge rounded px-4 py-2 text-xs font-medium">
                PO # {{$checkReq['po_number']}}
            </div>
            <div class="info-badge rounded px-4 py-2 text-xs font-medium">
                CER # {{$checkReq['cer_number']}}
            </div>
            <div class="info-badge rounded px-4 py-2 text-xs font-medium">
                SI # {{$checkReq['si_number']}}
            </div>
        </div>

        <!-- Account Charge Row -->
        <div class="field-row">
            <span class="label-text" style="width: 120px;">Account Charge</span>
            <span class="input-line flex-1 ml-3 px-2 value-text text-xs">{{$checkReq['account_charge']}}</span>
        </div>

        <!-- Service Line Dist Row -->
        <div class="field-row">
            <span class="label-text" style="width: 120px;">Service Line Dist.</span>
            <span class="input-line flex-1 ml-3 px-2 value-text text-xs">{{$checkReq['service_line_dist']}}</span>
        </div>

        <!-- Amount in Words Row -->
        <div class="field-row mb-2">
            <span class="label-text" style="width: 120px; align-self: flex-start;">Amount (In words)</span>
            <div class="flex-1 ml-3">
                <div class="input-line w-full px-2 mb-3 value-text text-xs">{{$checkReq['amount_in_words']}}</div>
                <div class="input-line w-full px-2">&nbsp;</div>
            </div>
        </div>
    </div>

    <!-- Signature Section -->
    <div class="px-2 py-5 border-t-2 border-gray-800">
        <!-- Requested and Reviewed Row -->
        <div class="flex gap-3 mb-5">
            <div class="flex-1 field-row mb-0">
                <span class="label-text whitespace-nowrap" style="width: 100px;">Requested by:</span>
                <span class="input-line flex-1 ml-2 px-1 value-text text-xs">{{$checkReq['requested_by']}}</span>
            </div>
            <div class="flex-1 field-row mb-0">
                <span class="label-text whitespace-nowrap" style="width: 100px;">Reviewed by:</span>
                <span class="input-line flex-1 ml-2 px-1 value-text text-xs">{{$checkReq['reviewed_by']}}</span>
            </div>
        </div>

        <!-- Approved By Row -->
        <div class="field-row mb-0">
            <span class="label-text whitespace-nowrap" style="width: 100px;">Approved by:</span>
            <span class="input-line flex-1 ml-3 px-2 value-text text-xs">{{$checkReq['approved_by']}}</span>
        </div>
    </div>
</div>
</body>
</html>
