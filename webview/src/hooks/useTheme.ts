import { useState, useEffect } from 'react';

/**
 * Hook to detect if VS Code has a dark theme active.
 * @returns boolean true if dark theme is active
 */
export const useIsDarkTheme = () => {
    const [isDark, setIsDark] = useState(() =>
        document.body.classList.contains('vscode-dark') ||
        document.body.classList.contains('vscode-high-contrast')
    );

    useEffect(() => {
        const updateTheme = () => {
            const dark = document.body.classList.contains('vscode-dark') ||
                document.body.classList.contains('vscode-high-contrast');
            setIsDark(dark);
        };

        // Observe changes to body class to detect theme switching
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    updateTheme();
                }
            }
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    return isDark;
};
