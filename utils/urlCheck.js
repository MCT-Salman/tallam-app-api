// URL checking utility using Node's built-in fetch (Node 18+)
// Determines if a URL is reachable and returns details.

/**
 * Check a URL by issuing a request and determining validity.
 * - Tries HEAD first, falls back to GET on 405/403/501 or if server disallows HEAD.
 * - Supports timeout and redirect handling.
 *
 * @param {string} url - The URL to check
 * @param {Object} [opts]
 * @param {number} [opts.timeoutMs=6000] - Timeout in milliseconds
 * @param {boolean} [opts.allowRedirects=true] - Follow redirects
 * @param {Record<string,string>} [opts.headers] - Extra request headers
 * @returns {Promise<{valid:boolean,status:number|null,ok:boolean,method:"HEAD"|"GET",redirected:boolean,finalUrl:string|null,error?:string}>}
 */
export async function checkUrl(url, opts = {}) {
  const timeoutMs = Number(opts.timeoutMs ?? 6000);
  const allowRedirects = opts.allowRedirects !== false;
  const headers = opts.headers ?? {};

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const runFetch = async (method) => {
    const res = await fetch(url, {
      method,
      redirect: allowRedirects ? 'follow' : 'manual',
      headers,
      signal: controller.signal,
    });
    return res;
  };

  try {
    // Try HEAD first
    let method = 'HEAD';
    let res = await runFetch(method);

    // Some servers reject HEAD; retry with GET on common codes
    if ([403, 405, 501].includes(res.status)) {
      method = 'GET';
      res = await runFetch(method);
    }

    const status = res.status;
    const ok = res.ok;
    const redirected = res.type === 'opaqueredirect' || res.redirected === true || (status >= 300 && status < 400);

    // Final URL resolution
    let finalUrl = null;
    try { finalUrl = res.url || url; } catch { finalUrl = url; }

    // Consider valid if status in 200-299 or (3xx and redirects allowed)
    const valid = (status >= 200 && status < 300) || (allowRedirects && status >= 300 && status < 400);

    return { valid, status, ok, method, redirected, finalUrl };
  } catch (err) {
    const isAbort = err?.name === 'AbortError';
    return { valid: false, status: null, ok: false, method: 'HEAD', redirected: false, finalUrl: null, error: isAbort ? 'timeout' : String(err?.message || err) };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Quick helper that returns only a boolean validity.
 * @param {string} url
 * @param {Object} [opts]
 * @returns {Promise<boolean>}
 */
export async function isUrlReachable(url, opts) {
  const res = await checkUrl(url, opts);
  return res.valid;
}

/**
 * Determine if a URL is a YouTube URL (youtube.com or youtu.be)
 * @param {string} url
 * @returns {boolean}
 */
export function isYouTubeUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./i, '').toLowerCase();
    return host.endsWith('youtube.com') || host === 'youtu.be' || host.endsWith('m.youtube.com');
  } catch {
    return false;
  }
}

/**
 * Check YouTube video/page availability using oEmbed endpoint.
 * - oEmbed returns 200 for existing/public/embeddable videos.
 * - Returns 404 for private/deleted/unavailable videos.
 * Docs: https://www.youtube.com/oembed
 *
 * @param {string} targetUrl - The YouTube video URL to check
 * @param {{timeoutMs?:number}} [opts]
 * @returns {Promise<{available:boolean,status:number|null,ok:boolean,error?:string}>}
 */
export async function checkYouTubeAvailability(targetUrl, opts = {}) {
  const timeoutMs = Number(opts.timeoutMs ?? 8000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36' },
      signal: controller.signal,
    });
    const status = res.status;
    const ok = res.ok;
    // Available if oEmbed returns 200
    const available = status === 200;
    return { available, status, ok };
  } catch (err) {
    const isAbort = err?.name === 'AbortError';
    return { available: false, status: null, ok: false, error: isAbort ? 'timeout' : String(err?.message || err) };
  } finally {
    clearTimeout(timeout);
  }
}
