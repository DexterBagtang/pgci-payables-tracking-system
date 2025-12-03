import { router } from '@inertiajs/react';
import { useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { usePage } from '@inertiajs/react';
import type { FlashMessages } from '@/types';

const STORAGE_KEY = 'flash_toast_shown';
const MAX_STORED_MESSAGES = 20;

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

    // Memoize flash values to avoid effect runs on object reference changes
    const flashValues = useMemo(
        () => ({
            success: flash.success,
            error: flash.error,
            warning: flash.warning,
            info: flash.info,
            message: flash.message,
        }),
        [flash.success, flash.error, flash.warning, flash.info, flash.message]
    );

    // Check if any flash messages exist
    const hasMessages = useMemo(
        () => Object.values(flashValues).some((msg) => msg !== undefined && msg !== null),
        [flashValues]
    );

    useEffect(() => {
        // Get shown messages from sessionStorage
        const getShownMessages = (): Set<string> => {
            try {
                const stored = sessionStorage.getItem(STORAGE_KEY);
                return stored ? new Set(JSON.parse(stored)) : new Set();
            } catch {
                return new Set();
            }
        };

        // Save shown messages to sessionStorage (batched at end of effect)
        const saveShownMessages = (messages: Set<string>) => {
            try {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(messages)));
            } catch {
                // Ignore storage errors
            }
        };

        const shownMessages = getShownMessages();

        // Clean up sessionStorage when messages disappear from flash
        // This allows the same message to be shown again in future form submissions
        (Object.keys(previousFlashRef.current) as Array<keyof FlashMessages>).forEach((key) => {
            const previousMessage = previousFlashRef.current[key];
            const currentMessage = flashValues[key];

            // If a message existed before but doesn't now, remove it from storage
            if (previousMessage && !currentMessage) {
                const messageHash = `${key}:${previousMessage}`;
                shownMessages.delete(messageHash);
            }
        });

        // Early exit if no messages - do this AFTER cleanup
        if (!hasMessages) {
            // Save cleaned up messages before exiting
            saveShownMessages(shownMessages);
            previousFlashRef.current = flashValues;
            return;
        }

        // Check if flash message has changed and hasn't been shown yet
        const shouldShow = (key: keyof FlashMessages): boolean => {
            const message = flashValues[key];
            if (!message) return false;

            // Check if message changed from previous
            const hasChanged = message !== previousFlashRef.current[key];
            if (!hasChanged) return false;

            // Create a hash to track unique instances
            const messageHash = `${key}:${message}`;

            // Check if we've already shown this exact message in the current page view
            if (shownMessages.has(messageHash)) {
                return false;
            }

            // Mark this message as shown
            shownMessages.add(messageHash);

            return true;
        };

        // Display success toast
        if (shouldShow('success')) {
            toast.success(flashValues.success!, {
                duration: 4000,
            });
        }

        // Display error toast
        if (shouldShow('error')) {
            toast.error(flashValues.error!, {
                duration: 5000,
            });
        }

        // Display warning toast
        if (shouldShow('warning')) {
            toast.warning(flashValues.warning!, {
                duration: 4500,
            });
        }

        // Display info toast
        if (shouldShow('info')) {
            toast.info(flashValues.info!, {
                duration: 4000,
            });
        }

        // Display general message toast (fallback)
        if (shouldShow('message')) {
            toast(flashValues.message!, {
                duration: 4000,
            });
        }

        // Save updated shown messages to sessionStorage
        // Clean up old messages (keep only last MAX_STORED_MESSAGES)
        if (shownMessages.size > MAX_STORED_MESSAGES) {
            const values = Array.from(shownMessages);
            const trimmed = new Set(values.slice(-MAX_STORED_MESSAGES));
            saveShownMessages(trimmed);
        } else {
            saveShownMessages(shownMessages);
        }

        // Store current flash messages for next comparison
        previousFlashRef.current = flashValues;
    }, [flashValues, hasMessages]);
}
