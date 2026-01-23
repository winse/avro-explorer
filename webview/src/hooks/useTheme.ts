import { useState, useEffect } from 'react';

type Theme = 'vscode-light' | 'vscode-dark' | 'vscode-high-contrast';

export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>('vscode-dark');

  useEffect(() => {
    const updateTheme = () => {
      const computedStyle = getComputedStyle(document.body);
      const bgColor = computedStyle.backgroundColor;

      if (bgColor === 'rgb(255, 255, 255)') {
        setTheme('vscode-light');
      } else if (bgColor === 'rgb(0, 0, 0)') {
        setTheme('vscode-high-contrast');
      } else {
        setTheme('vscode-dark');
      }
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
