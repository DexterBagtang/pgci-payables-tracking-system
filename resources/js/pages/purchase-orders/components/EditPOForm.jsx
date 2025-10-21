import { Head } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';
import { usePOForm } from '@/pages/purchase-orders/components/shared/usePOForm.js';
import PODetailsCard from '@/pages/purchase-orders/components/shared/PODetailsCard.jsx';
import POAttachmentsCard from '@/pages/purchase-orders/components/shared/POAttachmentsCard.jsx';
import POFormActions from '@/pages/purchase-orders/components/shared/POFormActions.jsx';

/**
 * EditPOForm Component
 * Form for editing existing Purchase Orders
 * Refactored to use shared components and hooks with CreatePOForm
 * 
 * @param {Object} props
 * @param {Object} props.purchaseOrder - The PO to edit
 * @param {Array} props.vendors - List of vendor options
 * @param {Array} props.projects - List of project options
 * @param {Function} props.onSuccess - Optional callback after successful update
 * @param {boolean} props.isDialog - Whether component is used in a dialog
 */
export default function EditPOForm({
    purchaseOrder,
    vendors,
    projects,
    onSuccess = null,
    isDialog = false,
}) {
    const {
        data,
        setData,
        isDraft,
        files,
        processing,
        errors,
        handleFileChange,
        handleDraft,
        handleEditSubmit,
    } = usePOForm(purchaseOrder, 'edit', onSuccess);

    /**
     * Download file from storage
     */
    const downloadFile = useCallback((file) => {
        const downloadUrl = `/storage/${file.file_path}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    /**
     * Create submit handler with PO ID
     */
    const handleSubmit = useCallback((e) => {
        handleEditSubmit(e, purchaseOrder.id);
    }, [handleEditSubmit, purchaseOrder.id]);

    // Memoize existing files to prevent re-renders
    const existingFiles = useMemo(() => purchaseOrder.files || [], [purchaseOrder.files]);

    // Render form content directly without wrapper component
    const formContent = (
        <form className="space-y-6">
            <PODetailsCard
                data={data}
                setData={setData}
                errors={errors}
                vendors={vendors}
                projects={projects}
                mode="edit"
                isDraft={isDraft}
                onDraftChange={handleDraft}
            />

            <POAttachmentsCard
                files={files}
                onFileChange={handleFileChange}
                errors={errors}
                existingFiles={existingFiles}
                onDownloadFile={downloadFile}
                mode="edit"
            />

            <POFormActions
                onSubmit={handleSubmit}
                processing={processing}
                mode="edit"
                isDraft={isDraft}
                isDialog={isDialog}
            />
        </form>
    );

    // If used in dialog, only return form content
    if (isDialog) {
        return formContent;
    }

    // If used in full page, return with Head and wrapper
    return (
        <>
            <Head title={`Edit Purchase Order - ${purchaseOrder.po_number}`} />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Edit Purchase Order - {purchaseOrder.po_number}
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Update the purchase order details below
                            </p>
                        </div>
                    </div>

                    {formContent}
                </div>
            </div>
        </>
    );
}
