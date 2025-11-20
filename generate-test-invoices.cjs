/**
 * Generate Test Invoice PDF Files
 *
 * This script generates test PDF files for bulk invoice upload testing
 * Format: VENDOR_PO#52008_SI#XXXX.pdf
 * Range: SI #2201 to SI #2250
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = 'C:\\Users\\Dexter.Bagtang\\Documents\\invoices test files';
const VENDOR_NAME = 'ACME_CORP'; // Change this to your vendor name
const PO_NUMBER = '52008';
const SI_START = 2201;
const SI_END = 2250;

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✓ Created directory: ${OUTPUT_DIR}`);
}

// Simple PDF generator (creates minimal valid PDF files)
function generatePDF(siNumber, poNumber, vendorName) {
    const content = `Invoice SI#${siNumber}`;

    // Minimal valid PDF structure
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 120
>>
stream
BT
/F1 24 Tf
50 700 Td
(Test Invoice) Tj
0 -30 Td
(PO#: ${poNumber}) Tj
0 -30 Td
(SI#: ${siNumber}) Tj
0 -30 Td
(Vendor: ${vendorName}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000317 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
488
%%EOF`;

    return pdfContent;
}

// Generate files
console.log('\n📄 Generating Test Invoice PDFs...\n');
console.log(`Vendor: ${VENDOR_NAME}`);
console.log(`PO#: ${PO_NUMBER}`);
console.log(`SI Range: ${SI_START} - ${SI_END}`);
console.log(`Output: ${OUTPUT_DIR}\n`);

let successCount = 0;
let errorCount = 0;

for (let siNumber = SI_START; siNumber <= SI_END; siNumber++) {
    try {
        // Format: VENDOR_PO#52008_SI#2201.pdf
        const fileName = `${VENDOR_NAME}_PO#${PO_NUMBER}_SI#${siNumber}.pdf`;
        const filePath = path.join(OUTPUT_DIR, fileName);

        // Generate PDF content
        const pdfContent = generatePDF(siNumber, PO_NUMBER, VENDOR_NAME);

        // Write file
        fs.writeFileSync(filePath, pdfContent);

        successCount++;

        // Progress indicator
        if (successCount % 10 === 0) {
            console.log(`✓ Generated ${successCount} files...`);
        }
    } catch (error) {
        console.error(`✗ Error generating SI#${siNumber}:`, error.message);
        errorCount++;
    }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Generation Complete!\n');
console.log(`✓ Successfully created: ${successCount} files`);
if (errorCount > 0) {
    console.log(`✗ Errors: ${errorCount} files`);
}
console.log(`\n📁 Location: ${OUTPUT_DIR}`);
console.log('='.repeat(50) + '\n');

// List first few files as sample
console.log('📋 Sample files created:');
const files = fs.readdirSync(OUTPUT_DIR).slice(0, 5);
files.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
});
if (successCount > 5) {
    console.log(`   ... and ${successCount - 5} more files`);
}
console.log('\n✅ Done! Files are ready for testing.\n');
