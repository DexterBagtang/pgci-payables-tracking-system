import { router } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { Button } from '@/components/ui/button.js';

export default function BackButton() {
    const handleBack = () => {
        const currentUrl = window.location.href;

        // Go back
        window.history.back();

        // Only reload if we actually navigated to a different page
        setTimeout(() => {
            // if (window.location.href !== currentUrl) {
                router.reload();
            // }
        }, 1000);
    };

    return (
        <Button
            type="button"
            onClick={handleBack}
            variant="outline"
            size="sm"
        >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
        </Button>
    );
}
