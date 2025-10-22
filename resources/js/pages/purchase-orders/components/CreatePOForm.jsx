import { usePOForm } from '@/pages/purchase-orders/components/shared/usePOForm.js';
import PODetailsCard from '@/pages/purchase-orders/components/shared/PODetailsCard.jsx';
import POAttachmentsCard from '@/pages/purchase-orders/components/shared/POAttachmentsCard.jsx';
import POFormActions from '@/pages/purchase-orders/components/shared/POFormActions.jsx';

/**
 * CreatePOForm Component
 * Form for creating new Purchase Orders
 * Refactored to use shared components and hooks with EditPOForm
 *
 * @param {Object} props
 * @param {Array} props.vendors - List of vendor options
 * @param {Array} props.projects - List of project options
 * @param {string} props.project_id - Optional initial project ID
 * @param {Function} props.onSuccess - Optional callback after successful creation
 */
export default function CreatePOForm({ vendors, projects, project_id, onSuccess = null }) {
    const {
        data,
        setData,
        isDraft,
        files,
        processing,
        errors,
        handleFileChange,
        handleDraft,
        handleCreateSubmit,
    } = usePOForm(null, 'create', onSuccess);

    return (
        <form onSubmit={handleCreateSubmit} className="space-y-6">
            <PODetailsCard
                data={data}
                setData={setData}
                errors={errors}
                vendors={vendors}
                projects={projects}
                mode="create"
                isDraft={isDraft}
                onDraftChange={handleDraft}
                projectId={project_id}
            />

            <POAttachmentsCard
                files={files}
                onFileChange={handleFileChange}
                errors={errors}
                mode="create"
            />

            <POFormActions
                onSubmit={handleCreateSubmit}
                processing={processing}
                mode="create"
                isDraft={isDraft}
                isDialog={false}
            />
        </form>
    );
}
