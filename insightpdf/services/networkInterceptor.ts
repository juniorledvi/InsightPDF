import { storage } from './storageService';

let isMounted = false;

/**
 * Mounts a global fetch interceptor to handle custom API Base URLs.
 * This is necessary because the Google GenAI SDK does not strictly follow
 * custom baseUrl patterns for all endpoints (especially uploads), and often
 * appends duplicate version strings (e.g., /v1beta/v1beta) when a path is provided in baseUrl.
 */
export const mountNetworkInterceptor = () => {
  if (isMounted) {
    console.warn('[InsightPDF] Network interceptor already mounted.');
    return;
  }

  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      // 1. Get current config from storage (real-time, so no refresh needed)
      const config = storage.getCustomConfig();

      // If disabled or no URL, bypass
      if (!config.enabled || !config.baseUrl) {
        return originalFetch(input, init);
      }

      // 2. Resolve the URL string
      let urlString = typeof input === 'string' 
        ? input 
        : input instanceof URL 
          ? input.toString() 
          : input.url;

      // 3. Check if this is a request to Google Gemini API
      if (urlString.includes('generativelanguage.googleapis.com')) {
        let cleanBaseUrl = config.baseUrl.trim();
        
        // Ensure no trailing slash for easier joining
        if (cleanBaseUrl.endsWith('/')) {
          cleanBaseUrl = cleanBaseUrl.slice(0, -1);
        }

        // Perform the replacement
        // This handles both https://generativelanguage.googleapis.com and https://generativelanguage.googleapis.com/upload
        let newUrl = urlString.replace('https://generativelanguage.googleapis.com', cleanBaseUrl);

        // 4. FIX PATH ISSUES
        
        // Fix double slashes (excluding the protocol part https://)
        // e.g. https://proxy.com//v1beta -> https://proxy.com/v1beta
        newUrl = newUrl.replace(/([^:]\/)\/+/g, '$1');

        // Fix duplicated version segments which often happen when the proxy URL includes the version
        // e.g. https://myproxy.com/v1beta/v1beta/models... -> https://myproxy.com/v1beta/models...
        newUrl = newUrl.replace(/\/v1beta\/v1beta/g, '/v1beta');
        newUrl = newUrl.replace(/\/v1\/v1/g, '/v1');

        // Debug log for development (optional, keeps console clean in prod but useful for debugging proxy issues)
        // console.debug(`[Interceptor] Redirected: ${urlString} -> ${newUrl}`);

        // 5. Return fetch with new URL
        // If input was a Request object, we need to handle it carefully, but usually SDK passes string + init
        if (input instanceof Request) {
           const newRequest = new Request(newUrl, {
             ...init,
             method: input.method,
             headers: input.headers,
             body: input.body,
             referrer: input.referrer,
             referrerPolicy: input.referrerPolicy,
             mode: input.mode,
             credentials: input.credentials,
             cache: input.cache,
             redirect: input.redirect,
             integrity: input.integrity,
             keepalive: input.keepalive,
             signal: input.signal,
             // @ts-ignore - duplex is needed for streaming uploads in some envs
             duplex: (input as any).duplex 
           });
           return originalFetch(newRequest);
        }

        return originalFetch(newUrl, init);
      }

      return originalFetch(input, init);

    } catch (e) {
      console.error('[InsightPDF] Interceptor Error:', e);
      return originalFetch(input, init);
    }
  };

  isMounted = true;
  console.log('[InsightPDF] Network Interceptor Mounted');
};