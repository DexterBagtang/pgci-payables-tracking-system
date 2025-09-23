import { Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
    const myBackUrl = document.referrer;
    console.log(myBackUrl);
    return (
        <Link href={myBackUrl} prefetch className="inline-flex items-center px-3 py-1 border rounded-md text-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
        </Link>
    );
}
