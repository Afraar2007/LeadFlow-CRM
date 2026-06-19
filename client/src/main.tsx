import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import App from './App';
import '@/styles/globals.css';

declare module 'react' {
  interface CSSProperties {
    '--sidebar-width'?: string;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Service worker management
// IMPORTANT: Immediately unregister existing service workers to prevent
// them from intercepting cross-origin API requests and returning manifest.json instead of API responses.
// We use a direct .then() chain instead of async/await to ensure this runs before React renders.
(function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then(function(registrations) {
        if (registrations) {
          for (var i = 0; i < registrations.length; i++) {
            registrations[i].unregister();
          }
          if (registrations.length > 0) {
            console.log('[SW] Unregistered ' + registrations.length + ' old service worker(s)');
          }
        }
      })
      .catch(function(err) {
        console.warn('[SW] Unregistration error:', err);
      });
  }
})();

// Initialize theme from localStorage
const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '8px',
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);