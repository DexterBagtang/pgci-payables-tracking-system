import { useEffect, useState, useRef } from 'react';
import { useScroll } from 'react-use';

export function ReadingProgress() {
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef(typeof window !== 'undefined' ? document : null);
    const { y } = useScroll(scrollRef);

    useEffect(() => {
        const calculateProgress = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;

            const scrollableHeight = documentHeight - windowHeight;
            const scrolled = (scrollTop / scrollableHeight) * 100;

            setProgress(Math.min(100, Math.max(0, scrolled)));
        };

        calculateProgress();
    }, [y]);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border">
            <div
                className="h-full bg-primary transition-all duration-150"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
