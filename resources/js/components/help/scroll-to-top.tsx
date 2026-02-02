import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisible = () => {
            const scrolled = document.documentElement.scrollTop;
            if (scrolled > 300) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisible);
        return () => window.removeEventListener('scroll', toggleVisible);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className={cn(
            'fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center text-xs',
            visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
            <Button onClick={scrollToTop} size="icon" aria-label="Scroll to top">
                <ArrowUp className="h-4 w-4" />
            </Button>
            <span className="mt-1">Scroll to top</span>
        </div>
    );



}
