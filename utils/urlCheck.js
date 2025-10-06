// URL checking utility using Axios
// Works reliably on Ubuntu and other servers

import axios from 'axios';

/**
 * Check if a URL is reachable
 * @param {string} url - URL to check
 * @param {{timeoutMs?:number, allowRedirects?:boolean, headers?:Record<string,string>}} opts
 * @returns {Promise<{valid:boolean,status:number|null,ok:boolean,finalUrl:string|null,error?:string}>}
 */
export async function checkUrl(url, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? 8000;
  const allowRedirects = opts.allowRedirects !== false;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    ...(opts.headers || {})
  };

  try {
    const res = await axios.get(url, {
      timeout: timeoutMs,
      headers,
      maxRedirects: allowRedirects ? 5 : 0,
      validateStatus: () => true // أي status يعتبر استجابة
    });

    const status = res.status;
    const ok = status >= 200 && status < 300;
    const valid = status >= 200 && status < 400; // 2xx و 3xx تعتبر صالحة
    const finalUrl = res.request?.res?.responseUrl || url;

    return { valid, status, ok, finalUrl };
  } catch (err) {
    const isTimeout = err.code === 'ECONNABORTED';
    return { valid: false, status: null, ok: false, finalUrl: null, error: isTimeout ? 'timeout' : String(err.message || err) };
  }
}

/**
 * Quick helper that returns only boolean validity
 * @param {string} url
 * @param {Object} [opts]
 * @returns {Promise<boolean>}
 */
export async function isUrlReachable(url, opts) {
  const res = await checkUrl(url, opts);
  return res.valid;
}

/**
 * Determine if a URL is a YouTube URL
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
 * Check YouTube video availability using oEmbed
 * @param {string} targetUrl
 * @param {{timeoutMs?:number}} [opts]
 * @returns {Promise<{available:boolean,status:number|null,ok:boolean,error?:string}>}
 */
export async function checkYouTubeAvailability(targetUrl, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? 8000;
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;

  try {
    const res = await axios.get(endpoint, {
      timeout: timeoutMs,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36' },
      validateStatus: () => true
    });

    const status = res.status;
    const available = status === 200;
    const ok = status >= 200 && status < 300;

    return { available, status, ok };
  } catch (err) {
    const isTimeout = err.code === 'ECONNABORTED';
    return { available: false, status: null, ok: false, error: isTimeout ? 'timeout' : String(err.message || err) };
  }
}
