import { useState, useCallback } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

/**
 * Custom hook for managing Purchase Order form state and operations
 * Used by both CreatePOForm and EditPOForm to maintain consistent behavior
 * 
 * @param {Object} initialData - Initial form data (for edit mode, pass existing PO data)
 * @param {string} mode - 'create' or 'edit'
 * @param {Function} onSuccess - Callback function after successful submission
 * @returns {Object} Form state and methods
 */
export const usePOForm = (initialData = null, mode = 'create', onSuccess = null) => {
    const [isDraft, setIsDraft] = useState(
        initialData?.po_status === 'draft' || false
    );
    const [files, setFiles] = useState([]);

    // Initialize form data
    const defaultFormData = {
        po_number: '',
        project_id: '',
        vendor_id: '',
        po_amount: '',
        payment_term: '',
        po_date: '',
        expected_delivery_date: '',
        description: '',
        po_status: 'open',
        line_items: [],
        files: [],
    };

    const initialFormData = initialData
        ? {
            po_number: initialData.po_number || '',
            project_id: initialData.project_id?.toString() || '',
            vendor_id: initialData.vendor_id?.toString() || '',
            po_amount: initialData.po_amount || '',
            payment_term: initialData.payment_term || '',
            po_date: initialData.po_date || '',
            expected_delivery_date: initialData.expected_delivery_date || '',
            description: initialData.description || '',
            po_status: initialData.po_status || 'open',
            line_items: [],
            files: [],
        }
        : defaultFormData;

    const { data, setData, post, processing, errors, reset } = useForm(
        initialFormData
    );

    /**
     * Handle file selection and update form state
     */
    const handleFileChange = useCallback((e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        setData('files', selectedFiles);
    }, [setData]);

    /**
     * Handle draft status toggle
     */
    const handleDraft = useCallback((checked) => {
        const newStatus = checked ? 'draft' : 'open';
        setData('po_status', newStatus);
        setIsDraft(checked);
    }, [setData]);

    /**
     * Handle form submission for create mode
     */
    const handleCreateSubmit = useCallback((e) => {
        e.preventDefault();

        post('/purchase-orders', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('PO added successfully.');
                reset();
                setFiles([]);
                onSuccess?.();
            },
            onError: (errors) => {
                console.error('Create errors:', errors);
                toast.error('Failed to create Purchase Order.');
            }
        });
    }, [post, reset, onSuccess]);

    /**
     * Handle form submission for edit mode
     */
    const handleEditSubmit = useCallback((e, poId) => {
        e.preventDefault();

        post(`/purchase-orders/${poId}`, {
            _method: 'patch',
            forceFormData: true,
            onSuccess: () => {
                setTimeout(() => {
                    toast.success('Purchase Order updated successfully.');
                }, 500);
                setFiles([]);
                onSuccess?.();
            },
            onError: (errors) => {
                console.error('Update errors:', errors);
                toast.error('Failed to update Purchase Order.');
            }
        });
    }, [post, onSuccess]);

    /**
     * Get appropriate submit handler based on mode
     */
    const getSubmitHandler = useCallback((poId = null) => {
        return (e) => {
            if (mode === 'create') {
                handleCreateSubmit(e);
            } else if (mode === 'edit' && poId) {
                handleEditSubmit(e, poId);
            }
        };
    }, [mode, handleCreateSubmit, handleEditSubmit]);

    return {
        // State
        data,
        isDraft,
        files,
        processing,
        errors,

        // Methods
        setData,
        handleFileChange,
        handleDraft,
        getSubmitHandler,
        handleCreateSubmit,
        handleEditSubmit,
        reset,
    };
};
