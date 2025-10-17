import { Button } from '@/components/ui/button.js';
import { Spinner } from '@/components/ui/spinner.js';
import { Save } from 'lucide-react';
import BackButton from '@/components/custom/BackButton.jsx';

/**
 * POFormActions Component
 * Shared UI component for form action buttons
 * Used by both CreatePOForm and EditPOForm
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Submit handler function
 * @param {boolean} props.processing - Whether form is being processed
 * @param {string} props.mode - 'create' or 'edit'
 * @param {boolean} props.isDraft - Whether form will be saved as draft
 * @param {boolean} props.isDialog - Whether component is used in a dialog (hides BackButton)
 */
export default function POFormActions({
    onSubmit,
    processing,
    mode = 'create',
    isDraft = false,
    isDialog = false,
}) {
    const getButtonText = () => {
        if (mode === 'create') {
            return isDraft ? 'Save as Draft' : 'Create';
        } else {
            return processing ? 'Updating...' : 'Update Purchase Order';
        }
    };

    return (
        <div className={`flex items-center ${isDialog ? 'justify-end' : 'justify-between'} pt-6`}>
            {!isDialog && <BackButton />}

            <Button
                type="button"
                disabled={processing}
                onClick={onSubmit}
            >
                {processing ? (
                    <Spinner className="mr-2 h-4 w-4" />
                ) : (
                    <Save className="mr-2 h-4 w-4" />
                )}
                {getButtonText()}
            </Button>
        </div>
    );
}
