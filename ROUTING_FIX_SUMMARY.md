# Authentication Flow Debug Summary

## Root Causes Identified:

### 1. Service Worker (sw.js) Intercepting API Requests
The service worker's `fetch` event handler intercepts ALL fetch requests from the page, including cross-origin requests to `render.com`. While it tries to pass through API calls, the timing of `event.respondWith()` and SW lifecycle management can cause:
- Race conditions where API responses get swapped with cached responses (manifest.json)
- The SW interfering with the auth flow on initial page load
- GET /auth/me failing because the SW hasn't fully activated/claimed the client

### 2. LoginPage Redirect Logic Bug
The `shouldRedirect` pattern + `isAuthenticated` state update can race:
- `login()` calls `setAuth()` → updates state with `isAuthenticated: true`
- Then `setShouldRedirect(true)` is called
- React may batch these, but the useEffect depends on both values changing
- If `shouldRedirect` is set before `isAuthenticated` propagates, redirect may not fire
- `setIsSubmitting(false)` is never called on success path

### 3. AuthContext initAuth May Not Retry getMe
The `initInProgressRef` prevents multiple init attempts. Combined with StrictMode mounting twice, this can cause initAuth to silently fail without retrying.