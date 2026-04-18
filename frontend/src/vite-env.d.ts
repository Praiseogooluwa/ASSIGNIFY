/// <reference types="vite/client" />

interface Window {
  turnstile?: {
    render: (container: string | HTMLElement, options: object) => string;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
    getResponse: (widgetId: string) => string | undefined;
  };
}