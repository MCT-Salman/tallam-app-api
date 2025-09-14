/**
 * استخراج عنوان IP الحقيقي من الطلب
 * يأخذ في الاعتبار headers مثل X-Forwarded-For و X-Real-IP
 */
export const getRealIP = (req) => {
  // Cloudflare header
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Akamai / Some CDNs
  const trueClientIp = req.headers['true-client-ip'];
  if (trueClientIp) {
    return trueClientIp.trim();
  }

  // التحقق من X-Forwarded-For (قد يحتوي على عدة IPs مفصولة بفواصل)
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    // أخذ أول IP في القائمة (IP الأصلي للعميل)
    return xForwardedFor.split(',')[0].trim();
  }

  // التحقق من X-Real-IP
  const xRealIP = req.headers['x-real-ip'];
  if (xRealIP) {
    return xRealIP.trim();
  }

  // التحقق من X-Client-IP
  const xClientIP = req.headers['x-client-ip'];
  if (xClientIP) {
    return xClientIP.trim();
  }

  // التحقق من X-Forwarded
  const xForwarded = req.headers['x-forwarded'];
  if (xForwarded) {
    return xForwarded.trim();
  }

  // التحقق من Forwarded header (RFC 7239)
  const forwarded = req.headers['forwarded'];
  if (forwarded) {
    // قد تكون القيمة بشكل: for="203.0.113.195:1234";proto=http;by=...
    const parts = forwarded.split(',');
    for (const part of parts) {
      const m = part.match(/for=([^;]+)/i);
      if (m) {
        return m[1].replace(/"/g, '').replace(/:\d+$/, '').trim();
      }
    }
  }

  // استخدام req.ip كخيار أخير (Express default)
  const fallback = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
  // تطبيع عناوين loopback
  if (fallback === '::1') return '127.0.0.1';
  return fallback;
};

/**
 * التحقق من صحة عنوان IP
 */
export const isValidIP = (ip) => {
  if (!ip || ip === 'unknown') return false;
  
  // IPv4 regex
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 regex (مبسط)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

