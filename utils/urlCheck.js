// URL checking utility using Axios
// Determines if a URL is reachable and returns details.

import axios from 'axios';

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

  const runAxios = async (method) => {
    return axios({
      method,
      url,
      timeout: timeoutMs,
      maxRedirects: allowRedirects ? 5 : 0,
      headers,
      validateStatus: function (status) {
        return status < 500; // Resolve only if status is less than 500
      }
    });
  };

  try {
    // Try HEAD first
    let method = 'HEAD';
    let response = await runAxios(method);

    // Some servers reject HEAD; retry with GET on common codes
    if ([403, 405, 501].includes(response.status)) {
      method = 'GET';
      response = await runAxios(method);
    }

    const status = response.status;
    const ok = response.status >= 200 && response.status < 300;
    const redirected = response.status >= 300 && response.status < 400;

    // Final URL resolution
    let finalUrl = response.config.url || url;

    // Consider valid if status in 200-299 or (3xx and redirects allowed)
    const valid = (status >= 200 && status < 300) || (allowRedirects && status >= 300 && status < 400);

    return { valid, status, ok, method, redirected, finalUrl };
  } catch (err) {
    let errorMessage = 'unknown';
    if (err.code === 'ECONNABORTED') {
      errorMessage = 'timeout';
    } else if (err.response) {
      // Server responded with error status
      return {
        valid: false,
        status: err.response.status,
        ok: false,
        method: 'HEAD',
        redirected: false,
        finalUrl: null,
        error: `HTTP ${err.response.status}`
      };
    } else {
      errorMessage = String(err?.message || err);
    }
    return { valid: false, status: null, ok: false, method: 'HEAD', redirected: false, finalUrl: null, error: errorMessage };
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
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;

  try {
    const response = await axios.get(endpoint, {
      timeout: timeoutMs,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36' },
      validateStatus: function (status) {
        return status < 500;
      }
    });

    const status = response.status;
    const ok = response.status >= 200 && response.status < 300;
    // Available if oEmbed returns 200
    const available = status === 200;
    return { available, status, ok };
  } catch (err) {
    let errorMessage = 'unknown';
    if (err.code === 'ECONNABORTED') {
      errorMessage = 'timeout';
    } else if (err.response) {
      // Server responded with error status
      return {
        available: false,
        status: err.response.status,
        ok: false,
        error: `HTTP ${err.response.status}`
      };
    } else {
      errorMessage = String(err?.message || err);
    }
    return { available: false, status: null, ok: false, error: errorMessage };
  }
}
