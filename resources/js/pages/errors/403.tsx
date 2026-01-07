import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ShieldAlert, Home } from 'lucide-react';

export default function Error403() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full px-6 py-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-destructive/10 p-6">
                        <ShieldAlert className="h-16 w-16 text-destructive" />
                    </div>
                </div>

                <h1 className="text-6xl font-bold text-foreground mb-4">403</h1>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Access Denied
                </h2>

                <p className="text-muted-foreground mb-2">
                    You don't have permission to access this resource.
                </p>

                <p className="text-muted-foreground mb-8">
                    Please contact your manager if you believe this is an error.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild variant="default">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Return to Dashboard
                        </Link>
                    </Button>

                    <Button asChild variant="outline">
                        <a href="javascript:history.back()">
                            Go Back
                        </a>
                    </Button>
                </div>

                <div className="mt-8 pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        If you need access to this area, please request permissions from your administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}
