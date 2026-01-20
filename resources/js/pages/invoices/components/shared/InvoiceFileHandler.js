import { MAX_FILE_SIZE } from './constants';

/**
 * Validate and filter files based on size limit
 * @param {File[]} files - Array of files to validate
 * @returns {File[]} - Array of valid files
 */
export const validateFiles = (files) => {
    const validFiles = files.filter((file) => file.size <= MAX_FILE_SIZE);

    if (validFiles.length !== files.length) {
        alert('Some files were too large (max 20MB per file) and were not selected.');
    }

    return validFiles;
};

/**
 * Handle file change event for file inputs
 * @param {Event} e - File input change event
 * @param {Function} setSelectedFiles - State setter for selected files
 * @param {Function} updateData - Function to update invoice data with files
 */
export const handleFileChange = (e, setSelectedFiles, updateData) => {
    const files = Array.from(e.target.files);
    const validFiles = validateFiles(files);

    setSelectedFiles(validFiles);
    e.target.value = '';

    if (updateData) {
        updateData(validFiles);
    }
};

/**
 * Remove a file from the selected files list
 * @param {number} index - Index of file to remove
 * @param {File[]} selectedFiles - Current selected files
 * @param {Function} setSelectedFiles - State setter for selected files
 * @param {Function} updateData - Function to update invoice data
 */
export const removeFile = (index, selectedFiles, setSelectedFiles, updateData) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);

    if (updateData) {
        updateData(updatedFiles);
    }
};

/**
 * Handle file change for bulk invoice individual items
 * @param {number} invoiceIndex - Index of the invoice
 * @param {Event} e - File input change event
 * @param {Array} bulkInvoices - Current bulk invoices
 * @param {Function} updateBulkInvoice - Function to update bulk invoice
 */
export const handleBulkInvoiceFileChange = (invoiceIndex, e, bulkInvoices, updateBulkInvoice) => {
    const files = Array.from(e.target.files);
    const validFiles = validateFiles(files);

    // Append new files to existing files instead of replacing them
    const existingFiles = bulkInvoices[invoiceIndex]?.files || [];
    const combinedFiles = [...existingFiles, ...validFiles];
    updateBulkInvoice(invoiceIndex, 'files', combinedFiles);
    e.target.value = '';
};

/**
 * Remove a file from a bulk invoice item
 * @param {number} invoiceIndex - Index of the invoice
 * @param {number} fileIndex - Index of the file to remove
 * @param {Array} bulkInvoices - Current bulk invoices
 * @param {Function} updateBulkInvoice - Function to update bulk invoice
 */
export const removeBulkInvoiceFile = (invoiceIndex, fileIndex, bulkInvoices, updateBulkInvoice) => {
    const invoice = bulkInvoices[invoiceIndex];
    const updatedFiles = invoice.files.filter((_, i) => i !== fileIndex);
    updateBulkInvoice(invoiceIndex, 'files', updatedFiles);
};
