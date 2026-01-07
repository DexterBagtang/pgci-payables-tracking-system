import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export function usePermissions() {
    const { auth } = usePage<SharedData>().props;

    return {
        canRead: (module: string) => auth.permissions.read.includes(module),
        canWrite: (module: string) => auth.permissions.write.includes(module),
        readableModules: auth.permissions.read,
        writableModules: auth.permissions.write,
    };
}
