import { useCallback, useState } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook to handle invoice file matching and bulk file upload logic
 */
export function useInvoiceFileMatching(bulkInvoices, updateBulkInvoice) {
    const [bulkFiles, setBulkFiles] = useState([]);
    const [fileMatching, setFileMatching] = useState([]);
    const [showUnifiedDialog, setShowUnifiedDialog] = useState(false);
    const [unifiedDialogData, setUnifiedDialogData] = useState({
        scenario: null, // 'single-file' | 'partial-upload'
        files: [],
        filesCount: 0,
        matches: [],
        unmatchedInvoiceCount: 0
    });

    // Filename matching logic - fuzzy match invoice numbers
    const matchFileToInvoice = useCallback((fileName, invoices) => {
        // Remove file extension
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');

        // Try to find matching invoice by SI number
        for (let i = 0; i < invoices.length; i++) {
            const invoice = invoices[i];
            if (!invoice.si_number) continue;

            // Normalize both for comparison (remove spaces, hyphens, underscores, lowercase)
            const normalizedSI = invoice.si_number.toLowerCase().replace(/[\s\-_]/g, '');
            const normalizedFileName = nameWithoutExt.toLowerCase().replace(/[\s\-_]/g, '');

            // Check if filename contains the SI number
            if (normalizedFileName.includes(normalizedSI) || normalizedSI.includes(normalizedFileName)) {
                return { matched: true, invoiceIndex: i, invoiceNumber: invoice.si_number };
            }
        }

        return { matched: false, invoiceIndex: null, invoiceNumber: null };
    }, []);

    // Handle bulk file upload
    const handleBulkFilesUpload = useCallback((e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => {
            const maxSize = 10 * 1024 * 1024; // 10MB
            return file.size <= maxSize;
        });

        if (validFiles.length !== files.length) {
            toast.error('Some files were too large (max 10MB per file) and were not selected.');
        }

        // Check if single file uploaded with multiple invoices
        if (validFiles.length === 1 && bulkInvoices.length > 1) {
            setUnifiedDialogData({
                scenario: 'single-file',
                files: validFiles,
                filesCount: 1,
                matches: [],
                unmatchedInvoiceCount: 0
            });
            setShowUnifiedDialog(true);
            e.target.value = '';
            return;
        }

        // Match files to invoices
        const matches = validFiles.map((file) => {
            const match = matchFileToInvoice(file.name, bulkInvoices);
            return {
                file,
                ...match,
            };
        });

        // Check if files < invoices (partial upload scenario)
        if (validFiles.length < bulkInvoices.length && validFiles.length > 1) {
            // Count how many invoices will remain unmatched
            const matchedInvoiceIndices = new Set(
                matches.filter(m => m.matched && m.invoiceIndex !== null).map(m => m.invoiceIndex)
            );
            const unmatchedInvoiceCount = bulkInvoices.length - matchedInvoiceIndices.size;

            // Show unified dialog if there are unmatched invoices after auto-matching
            if (unmatchedInvoiceCount > 0) {
                setUnifiedDialogData({
                    scenario: 'partial-upload',
                    files: validFiles,
                    filesCount: validFiles.length,
                    matches: matches,
                    unmatchedInvoiceCount: unmatchedInvoiceCount
                });
                setShowUnifiedDialog(true);
                e.target.value = '';
                return;
            }
        }

        setFileMatching(matches);

        // Auto-assign matched files to invoices
        matches.forEach((match) => {
            if (match.matched && match.invoiceIndex !== null) {
                const invoice = bulkInvoices[match.invoiceIndex];
                const existingFiles = invoice.files || [];
                updateBulkInvoice(match.invoiceIndex, 'files', [...existingFiles, match.file]);
            }
        });

        e.target.value = '';
    }, [bulkInvoices, matchFileToInvoice, updateBulkInvoice]);

    // Handle remove matched file
    const handleRemoveMatchedFile = useCallback((matchIndex) => {
        const match = fileMatching[matchIndex];

        // Remove from invoice files if it was matched
        if (match.matched && match.invoiceIndex !== null) {
            const invoice = bulkInvoices[match.invoiceIndex];
            const updatedFiles = (invoice.files || []).filter(f => f.name !== match.file.name);
            updateBulkInvoice(match.invoiceIndex, 'files', updatedFiles);
        }

        // Remove from file matching list
        setFileMatching(prev => prev.filter((_, i) => i !== matchIndex));
    }, [fileMatching, bulkInvoices, updateBulkInvoice]);

    // Handle file reassignment
    const handleReassignFile = useCallback((matchIndex, newInvoiceIndex) => {
        const match = fileMatching[matchIndex];

        // Remove from old invoice if previously assigned
        if (match.invoiceIndex !== null) {
            const oldInvoice = bulkInvoices[match.invoiceIndex];
            const updatedOldFiles = (oldInvoice.files || []).filter(f => f.name !== match.file.name);
            updateBulkInvoice(match.invoiceIndex, 'files', updatedOldFiles);
        }

        // Add to new invoice
        const newInvoice = bulkInvoices[newInvoiceIndex];
        const existingFiles = newInvoice.files || [];
        updateBulkInvoice(newInvoiceIndex, 'files', [...existingFiles, match.file]);

        // Update matching state
        setFileMatching(prev => prev.map((m, i) =>
            i === matchIndex
                ? { ...m, matched: true, invoiceIndex: newInvoiceIndex, invoiceNumber: newInvoice.si_number || `Invoice ${newInvoiceIndex + 1}` }
                : m
        ));
    }, [fileMatching, bulkInvoices, updateBulkInvoice]);

    // Unified dialog handlers
    const handleUnifiedShareWithAll = useCallback(() => {
        const { files } = unifiedDialogData;
        if (!files || files.length === 0) return;

        // Assign all files to all invoices
        bulkInvoices.forEach((invoice, index) => {
            const existingFiles = invoice.files || [];
            const allFiles = [...existingFiles, ...files];
            // Remove duplicates based on file name
            const uniqueFiles = allFiles.filter((file, idx, self) =>
                idx === self.findIndex((f) => f.name === file.name)
            );
            updateBulkInvoice(index, 'files', uniqueFiles);
        });

        toast.success(`${files.length} file(s) have been assigned to all ${bulkInvoices.length} invoices.`);
        setShowUnifiedDialog(false);
        setUnifiedDialogData({ scenario: null, files: [], filesCount: 0, matches: [], unmatchedInvoiceCount: 0 });
    }, [unifiedDialogData, bulkInvoices, updateBulkInvoice]);

    const handleUnifiedAssignToOne = useCallback(() => {
        const { files } = unifiedDialogData;
        if (!files || files.length === 0) return;

        const pendingFile = files[0];

        // Add the file as a match for manual assignment
        const match = matchFileToInvoice(pendingFile.name, bulkInvoices);
        const newMatch = {
            file: pendingFile,
            ...match,
        };

        setFileMatching(prev => [...prev, newMatch]);

        // If matched, auto-assign it
        if (match.matched && match.invoiceIndex !== null) {
            const invoice = bulkInvoices[match.invoiceIndex];
            const existingFiles = invoice.files || [];
            updateBulkInvoice(match.invoiceIndex, 'files', [...existingFiles, pendingFile]);
            toast.success(`File "${pendingFile.name}" auto-matched to invoice "${match.invoiceNumber}"`);
        }

        setShowUnifiedDialog(false);
        setUnifiedDialogData({ scenario: null, files: [], filesCount: 0, matches: [], unmatchedInvoiceCount: 0 });
    }, [unifiedDialogData, bulkInvoices, matchFileToInvoice, updateBulkInvoice]);

    const handleUnifiedManualAssignment = useCallback(() => {
        const { matches } = unifiedDialogData;
        if (!matches || matches.length === 0) return;

        setFileMatching(matches);

        // Auto-assign matched files to invoices
        matches.forEach((match) => {
            if (match.matched && match.invoiceIndex !== null) {
                const invoice = bulkInvoices[match.invoiceIndex];
                const existingFiles = invoice.files || [];
                updateBulkInvoice(match.invoiceIndex, 'files', [...existingFiles, match.file]);
            }
        });

        const matchedCount = matches.filter(m => m.matched).length;
        const unmatchedCount = matches.length - matchedCount;

        if (matchedCount > 0) {
            toast.success(`${matchedCount} file(s) auto-matched. ${unmatchedCount > 0 ? `${unmatchedCount} file(s) need manual assignment.` : ''}`);
        } else {
            toast.info(`${unmatchedCount} file(s) need manual assignment.`);
        }

        setShowUnifiedDialog(false);
        setUnifiedDialogData({ scenario: null, files: [], filesCount: 0, matches: [], unmatchedInvoiceCount: 0 });
    }, [unifiedDialogData, bulkInvoices, updateBulkInvoice]);

    const handleUnifiedLeaveUnmatched = useCallback(() => {
        // Same as manual assignment - just proceed with auto-matching
        handleUnifiedManualAssignment();
    }, [handleUnifiedManualAssignment]);

    return {
        // State
        bulkFiles,
        setBulkFiles,
        fileMatching,
        setFileMatching,
        showUnifiedDialog,
        setShowUnifiedDialog,
        unifiedDialogData,

        // Handlers
        handleBulkFilesUpload,
        handleRemoveMatchedFile,
        handleReassignFile,
        handleUnifiedShareWithAll,
        handleUnifiedAssignToOne,
        handleUnifiedManualAssignment,
        handleUnifiedLeaveUnmatched,
    };
}
