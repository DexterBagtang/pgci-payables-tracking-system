import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js';
import FileUpload from '@/components/custom/FileUpload';

/**
 * POAttachmentsCard Component (Refactored)
 * Simplified using the centralized FileUpload component
 * Used by both CreatePOForm and EditPOForm
 *
 * @param {Object} props
 * @param {Array} props.files - New files to be uploaded (File objects)
 * @param {Function} props.onFileChange - Callback when files are selected
 * @param {Object} props.errors - Form validation errors (combined client & server)
 * @param {Array} props.existingFiles - Existing files for the PO (for edit mode)
 * @param {Function} props.onDownloadFile - Callback to handle file download
 * @param {string} props.mode - 'create' or 'edit'
 */
export default function POAttachmentsCard({
    files,
    onFileChange,
    errors,
    existingFiles = [],
    onDownloadFile,
    mode = 'create',
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Attachments</CardTitle>
                <CardDescription>
                    {mode === 'create'
                        ? 'Upload supporting documents for this purchase order'
                        : 'Manage attachments for this purchase order'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <FileUpload
                    files={files}
                    onChange={onFileChange}
                    error={errors?.files}
                    existingFiles={existingFiles}
                    onDownloadFile={onDownloadFile}
                    label={mode === 'edit' ? 'Upload Additional Files' : 'Upload Files'}
                    description="PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)"
                    maxFiles={10}
                    maxSizePerFile={10}
                    accept={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png']}
                    variant="compact"
                    dragAndDrop={false}
                    multiple={true}
                    showFileSize={true}
                />
            </CardContent>
        </Card>
    );
}
