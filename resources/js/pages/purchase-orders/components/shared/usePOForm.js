import { useState, useCallback, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { validateFormData, validateFiles } from './poValidationRules.js';

/**
 * Custom hook for managing Purchase Order form state and operations
 * Used by both CreatePOForm and EditPOForm to maintain consistent behavior
 * Includes client-side validation before submission
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
    const [clientErrors, setClientErrors] = useState({});
    const fileInputRef = useRef(null);

    // Initialize form data
    const defaultFormData = {
        po_number: '',
        project_id: '',
        vendor_id: '',
        po_amount: '',
        currency: 'PHP',
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
            currency: initialData.currency || 'PHP',
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
     * Validate form before submission
     * @returns {boolean} - True if validation passes
     */
    const validateBeforeSubmit = useCallback(() => {
        const newErrors = validateFormData(data);
        
        // Validate files if any are selected
        if (files && files.length > 0) {
            const fileError = validateFiles(files);
            if (fileError) {
                newErrors.files = fileError;
            }
        }

        setClientErrors(newErrors);

        // Show toast if there are errors
        if (Object.keys(newErrors).length > 0) {
            const errorCount = Object.keys(newErrors).length;
            toast.error(`Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''}`);
            return false;
        }

        return true;
    }, [data, files]);

    /**
     * Handle field change with real-time validation
     */
    const handleFieldChange = useCallback((fieldName, value) => {
        setData(fieldName, value);

        // Clear error for this field when user starts typing
        setClientErrors(prev => {
            if (prev[fieldName]) {
                const updated = { ...prev };
                delete updated[fieldName];
                return updated;
            }
            return prev;
        });
    }, [setData]);

    /**
     * Handle file selection and update form state
     */
    const handleFileChange = useCallback((e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        setData('files', selectedFiles);

        // Clear file error when files are selected
        setClientErrors(prev => {
            if (prev.files) {
                const updated = { ...prev };
                delete updated.files;
                return updated;
            }
            return prev;
        });
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

        // Validate before submitting
        if (!validateBeforeSubmit()) {
            return;
        }

        post('/purchase-orders', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('PO added successfully.');
                reset();
                setFiles([]);
                setClientErrors({});
                onSuccess?.();
            },
            onError: () => {
                // Server errors take precedence over client errors
                setClientErrors({});
                toast.error('Failed to create Purchase Order.');
            }
        });
    }, [post, reset, onSuccess, validateBeforeSubmit]);

    /**
     * Handle form submission for edit mode
     */
    const handleEditSubmit = useCallback((e, poId) => {
        e.preventDefault();

        // Validate before submitting
        if (!validateBeforeSubmit()) {
            return;
        }

        post(`/purchase-orders/${poId}`, {
            _method: 'patch',
            forceFormData: true,
            onSuccess: () => {
                setTimeout(() => {
                    toast.success('Purchase Order updated successfully.');
                }, 500);
                setFiles([]);
                setClientErrors({});
                onSuccess?.();
            },
            onError: () => {
                // Server errors take precedence over client errors
                setClientErrors({});
                toast.error('Failed to update Purchase Order.');
            }
        });
    }, [post, onSuccess, validateBeforeSubmit]);

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

    /**
     * Combine client-side and server-side errors
     */
    const combinedErrors = {
        ...clientErrors,
        ...errors,
    };

    return {
        // State
        data,
        isDraft,
        files,
        processing,
        errors: combinedErrors,
        clientErrors,

        // Methods
        setData: handleFieldChange,
        handleFileChange,
        handleDraft,
        getSubmitHandler,
        handleCreateSubmit,
        handleEditSubmit,
        validateBeforeSubmit,
        reset,
        fileInputRef,
    };
};
