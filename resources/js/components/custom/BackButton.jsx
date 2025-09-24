import { router } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { Button } from '@/components/ui/button.js';

export default function BackButton() {
    const handleBack = () => {
        // Go back
        window.history.back();
        // Optional reload (after a tiny delay, to ensure cache kicks in)
        setTimeout(() => {
            router.reload();
        }, 100);
    };

    return (
        <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
        >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
        </Button>
    );
}
