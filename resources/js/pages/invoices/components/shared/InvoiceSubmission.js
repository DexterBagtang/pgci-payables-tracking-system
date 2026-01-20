import { router } from '@inertiajs/react';

/**
 * Prepare invoice data and files for submission
 * @param {boolean} isBulkMode - Whether in bulk mode
 * @param {Array} bulkInvoices - Bulk invoices data
 * @param {Object} bulkConfig - Bulk configuration
 * @param {Object} singleData - Single invoice data
 * @returns {FormData} - Prepared FormData for submission
 */
export const prepareInvoiceFormData = (isBulkMode, bulkInvoices = [], bulkConfig = {}, singleData = {}) => {
    // Prepare invoice data
    const invoicesWithSharedData = bulkInvoices.map((invoice) => {
        // Remove files from invoice object for JSON serialization
        const { files, ...invoiceWithoutFiles } = invoice;
        return {
            ...invoiceWithoutFiles,
            purchase_order_id: bulkConfig.sharedValues?.purchase_order_id,
        };
    });

    const invoicesData = isBulkMode ? invoicesWithSharedData : [{ ...singleData, files: undefined }];

    // Create FormData
    const formData = new FormData();

    // Append the invoice data as JSON (without files)
    formData.append('_invoices_json', JSON.stringify(invoicesData));

    // Frontend file deduplication - send each unique file only once
    const sourceInvoices = isBulkMode ? bulkInvoices : [singleData];
    const fileMap = new Map(); // Map to track unique files: key = file signature, value = file object
    const invoiceFileReferences = []; // Track which invoices use which files

    sourceInvoices.forEach((invoice, index) => {
        invoiceFileReferences[index] = [];

        if (invoice.files && invoice.files.length > 0) {
            invoice.files.forEach((file) => {
                // Create unique signature for file (name + size)
                const fileSignature = `${file.name}_${file.size}`;

                if (!fileMap.has(fileSignature)) {
                    // First occurrence - add to map
                    fileMap.set(fileSignature, file);
                }

                // Track that this invoice uses this file
                invoiceFileReferences[index].push(fileSignature);
            });
        }
    });

    // Append unique files only once with a global index
    let globalFileIndex = 0;
    const fileSignatureToIndex = new Map();

    fileMap.forEach((file, signature) => {
        formData.append(`unique_files[${globalFileIndex}]`, file);
        fileSignatureToIndex.set(signature, globalFileIndex);
        globalFileIndex++;
    });

    // Append file references for each invoice
    sourceInvoices.forEach((invoice, invoiceIndex) => {
        if (invoiceFileReferences[invoiceIndex]) {
            invoiceFileReferences[invoiceIndex].forEach((signature, localFileIndex) => {
                const globalIndex = fileSignatureToIndex.get(signature);
                formData.append(`invoices[${invoiceIndex}][file_refs][${localFileIndex}]`, globalIndex);
            });
        }
    });

    return formData;
};

/**
 * Submit invoice(s) using Inertia router
 * @param {Object} params - Submission parameters
 * @param {boolean} params.isBulkMode - Whether in bulk mode
 * @param {Array} params.bulkInvoices - Bulk invoices data
 * @param {Object} params.bulkConfig - Bulk configuration
 * @param {Object} params.singleData - Single invoice data
 * @param {Function} params.setProcessing - State setter for processing
 * @param {Function} params.setUploadProgress - State setter for upload progress
 * @param {Function} params.onSuccess - Success callback
 * @param {Function} params.setErrors - State setter for errors
 */
export const submitInvoices = ({
    isBulkMode,
    bulkInvoices,
    bulkConfig,
    singleData,
    setProcessing,
    setUploadProgress,
    onSuccess,
    setErrors,
}) => {
    setProcessing(true);
    setUploadProgress(0);

    const formData = prepareInvoiceFormData(isBulkMode, bulkInvoices, bulkConfig, singleData);

    // Use Inertia router for file uploads with progress tracking
    router.post('/invoices', formData, {
        // Track upload progress
        onProgress: (progress) => {
            if (progress.percentage) {
                setUploadProgress(Math.round(progress.percentage));
            }
        },

        // Handle successful response
        onSuccess: (page) => {
            if (onSuccess) {
                onSuccess(page);
            }
        },

        // Handle validation errors (422)
        onError: (errors) => {
            console.error('Validation errors:', errors);
            // Set errors for inline display
            setErrors(errors);
        },

        // Always reset loading state when finished
        onFinish: () => {
            setProcessing(false);
            setUploadProgress(0);
        },

        // Preserve scroll position
        preserveScroll: true,

        // Force FormData to be used
        forceFormData: true,
    });
};
