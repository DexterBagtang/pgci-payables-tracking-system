import { useCallback, useState } from 'react';

/**
 * Custom hook for drag and drop file upload functionality
 */
export function useDragAndDrop(onFilesDropped) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        // Only set dragging to false if we're leaving the drop zone entirely
        // Check if the related target is outside the drop zone
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0 && onFilesDropped) {
            onFilesDropped(files);
        }
    }, [onFilesDropped]);

    return {
        isDragging,
        dragHandlers: {
            onDragEnter: handleDragEnter,
            onDragLeave: handleDragLeave,
            onDragOver: handleDragOver,
            onDrop: handleDrop,
        },
    };
}
