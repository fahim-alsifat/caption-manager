import { useEffect, useRef, useCallback } from 'react';

export function useDebounce<T extends (...args: Parameters<T>) => void>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<number | null>(null);

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = window.setTimeout(() => {
                callback(...args);
            }, delay);
        },
        [callback, delay]
    ) as T;

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
}

export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = `${e.ctrlKey || e.metaKey ? 'mod+' : ''}${e.key.toLowerCase()}`;

            if (shortcuts[key]) {
                e.preventDefault();
                shortcuts[key]();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}

export function useClickOutside(
    ref: React.RefObject<HTMLElement>,
    callback: () => void
) {
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [ref, callback]);
}
