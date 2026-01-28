import { useState, useEffect, useRef } from 'react';

interface ImageLoaderProps {
    src: string;
    alt: string;
    className?: string;
    placeholderClassName?: string;
    onLoad?: () => void;
    onError?: () => void;
}

/**
 * Optimized image component with lazy loading and intersection observer
 * Reduces initial page load by only loading images when they're visible
 */
const ImageLoader = ({
    src,
    alt,
    className = '',
    placeholderClassName = '',
    onLoad,
    onError,
}: ImageLoaderProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!imgRef.current) return;

        // Use Intersection Observer for lazy loading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px', // Start loading 50px before image enters viewport
                threshold: 0.01,
            }
        );

        observer.observe(imgRef.current);

        return () => {
            observer.disconnect();
        };
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
        onError?.();
    };

    return (
        <div ref={imgRef} className={`relative ${className}`}>
            {/* Placeholder while loading */}
            {!isLoaded && !hasError && (
                <div
                    className={`absolute inset-0 bg-muted animate-pulse ${placeholderClassName}`}
                />
            )}

            {/* Actual image - only load when in view */}
            {isInView && !hasError && (
                <img
                    src={src}
                    alt={alt}
                    className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="lazy"
                    decoding="async"
                />
            )}

            {/* Error fallback */}
            {hasError && (
                <div className={`absolute inset-0 bg-muted flex items-center justify-center ${placeholderClassName}`}>
                    <span className="text-muted-foreground text-sm">Failed to load</span>
                </div>
            )}
        </div>
    );
};

export default ImageLoader;
