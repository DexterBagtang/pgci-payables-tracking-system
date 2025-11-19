import { AlertCircle } from 'lucide-react';

export default function ErrorSummary({ errorCount, errors }) {
    if (errorCount === 0) return null;

    return (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <div className="flex items-start">
                <AlertCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                    <h3 className="mb-2 text-xs font-medium text-red-800">
                        {errorCount} error{errorCount > 1 ? 's' : ''} found:
                    </h3>
                    <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-red-700">
                        {Object.entries(errors)
                            .slice(0, 5)
                            .map(([field, error]) => (
                                <li key={field} className="flex items-center">
                                    <span className="mr-2 h-1 w-1 flex-shrink-0 rounded-full bg-red-600"></span>
                                    <span>{error}</span>
                                </li>
                            ))}
                        {errorCount > 5 && (
                            <li className="font-medium text-red-600">...and {errorCount - 5} more</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
