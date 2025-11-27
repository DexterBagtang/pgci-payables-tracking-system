import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { usePage } from '@inertiajs/react';
import type { FlashMessages } from '@/types';

/**
 * Hook to automatically display toast notifications from Laravel flash messages
 * after Inertia page navigations.
 *
 * This hook listens to Inertia's 'finish' event and displays toasts for any
 * flash messages that were set by Laravel controllers.
 *
 * Usage: Call this hook once in your root layout component (e.g., AppLayout)
 */
export function useFlashToast() {
    const { flash } = usePage<{ flash: FlashMessages }>().props;
    const previousFlashRef = useRef<FlashMessages>({});

    useEffect(() => {
        // Check if flash messages have changed to prevent duplicate toasts
        const hasChanged = (key: keyof FlashMessages) => {
            return flash[key] && flash[key] !== previousFlashRef.current[key];
        };

        // Display success toast
        if (hasChanged('success')) {
            toast.success(flash.success, {
                duration: 4000,
            });
        }

        // Display error toast
        if (hasChanged('error')) {
            toast.error(flash.error, {
                duration: 5000,
            });
        }

        // Display warning toast
        if (hasChanged('warning')) {
            toast.warning(flash.warning, {
                duration: 4500,
            });
        }

        // Display info toast
        if (hasChanged('info')) {
            toast.info(flash.info, {
                duration: 4000,
            });
        }

        // Display general message toast (fallback)
        if (hasChanged('message')) {
            toast(flash.message, {
                duration: 4000,
            });
        }

        // Store current flash messages for next comparison
        previousFlashRef.current = { ...flash };
    }, [flash]);
}
