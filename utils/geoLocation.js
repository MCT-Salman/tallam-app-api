/**
 * خدمة تحديد الموقع الجغرافي ومزود الخدمة من عنوان IP
 * يمكن دمجها مع خدمات خارجية مثل MaxMind أو IPinfo
 */

/**
 * الحصول على معلومات الموقع الجغرافي من IP
 * @param {string} ip - عنوان IP
 * @returns {Object} معلومات الموقع
 */
export const getLocationFromIP = async (ip) => {
  try {
    // التحقق من صحة IP
    if (!ip || ip === 'unknown' || isPrivateIP(ip)) {
      return {
        success: false,
        error: 'عنوان IP غير صالح أو محلي',
        ip
      };
    }

    // يمكن استخدام خدمة مجانية مثل ip-api.com
    // أو خدمة مدفوعة مثل MaxMind أو IPinfo
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'fail') {
      return {
        success: false,
        error: data.message || 'فشل في تحديد الموقع',
        ip
      };
    }

    return {
      success: true,
      ip: data.query,
      country: data.country,
      countryCode: data.countryCode,
      region: data.region,
      regionName: data.regionName,
      city: data.city,
      zipCode: data.zip,
      latitude: data.lat,
      longitude: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      organization: data.org,
      asn: data.as,
      location: `${data.city}, ${data.regionName}, ${data.country}`
    };

  } catch (error) {
    console.error('Error getting location from IP:', error);
    return {
      success: false,
      error: `خطأ في تحديد الموقع: ${error.message}`,
      ip
    };
  }
};

/**
 * التحقق من كون IP محلي أو خاص
 * @param {string} ip - عنوان IP
 * @returns {boolean} true إذا كان IP محلي
 */
export const isPrivateIP = (ip) => {
  if (!ip) return true;

  // IPv4 private ranges
  const privateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // 127.0.0.0/8 (localhost)
    /^169\.254\./,              // 169.254.0.0/16 (link-local)
    /^::1$/,                    // IPv6 localhost
    /^fe80:/,                   // IPv6 link-local
    /^fc00:/,                   // IPv6 unique local
    /^fd00:/                    // IPv6 unique local
  ];

  return privateRanges.some(range => range.test(ip));
};

/**
 * الحصول على معلومات مزود الخدمة من IP
 * @param {string} ip - عنوان IP
 * @returns {Object} معلومات مزود الخدمة
 */
export const getISPFromIP = async (ip) => {
  try {
    if (!ip || ip === 'unknown' || isPrivateIP(ip)) {
      return {
        success: false,
        error: 'عنوان IP غير صالح أو محلي',
        ip
      };
    }

    // استخدام خدمة مجانية للحصول على معلومات ISP
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,isp,org,as,mobile,proxy,hosting,query`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'fail') {
      return {
        success: false,
        error: data.message || 'فشل في تحديد مزود الخدمة',
        ip
      };
    }

    return {
      success: true,
      ip: data.query,
      isp: data.isp,
      organization: data.org,
      asn: data.as,
      isMobile: data.mobile || false,
      isProxy: data.proxy || false,
      isHosting: data.hosting || false,
      connectionType: determineConnectionType(data)
    };

  } catch (error) {
    console.error('Error getting ISP from IP:', error);
    return {
      success: false,
      error: `خطأ في تحديد مزود الخدمة: ${error.message}`,
      ip
    };
  }
};

/**
 * تحديد نوع الاتصال بناءً على معلومات IP
 * @param {Object} data - بيانات IP
 * @returns {string} نوع الاتصال
 */
const determineConnectionType = (data) => {
  if (data.mobile) return 'mobile';
  if (data.proxy) return 'proxy';
  if (data.hosting) return 'hosting';
  
  const isp = (data.isp || '').toLowerCase();
  const org = (data.org || '').toLowerCase();
  
  if (isp.includes('mobile') || isp.includes('cellular') || org.includes('mobile')) {
    return 'mobile';
  }
  
  if (isp.includes('fiber') || org.includes('fiber')) {
    return 'fiber';
  }
  
  if (isp.includes('cable') || org.includes('cable')) {
    return 'cable';
  }
  
  if (isp.includes('dsl') || org.includes('dsl')) {
    return 'dsl';
  }
  
  if (isp.includes('satellite') || org.includes('satellite')) {
    return 'satellite';
  }
  
  return 'broadband';
};

/**
 * الحصول على معلومات شاملة عن IP
 * @param {string} ip - عنوان IP
 * @returns {Object} معلومات شاملة
 */
export const getFullIPInfo = async (ip) => {
  try {
    const [locationInfo, ispInfo] = await Promise.all([
      getLocationFromIP(ip),
      getISPFromIP(ip)
    ]);

    return {
      success: locationInfo.success && ispInfo.success,
      ip,
      location: locationInfo.success ? {
        country: locationInfo.country,
        countryCode: locationInfo.countryCode,
        region: locationInfo.regionName,
        city: locationInfo.city,
        coordinates: {
          latitude: locationInfo.latitude,
          longitude: locationInfo.longitude
        },
        timezone: locationInfo.timezone,
        fullLocation: locationInfo.location
      } : null,
      network: ispInfo.success ? {
        isp: ispInfo.isp,
        organization: ispInfo.organization,
        asn: ispInfo.asn,
        connectionType: ispInfo.connectionType,
        isMobile: ispInfo.isMobile,
        isProxy: ispInfo.isProxy,
        isHosting: ispInfo.isHosting
      } : null,
      errors: [
        ...(locationInfo.success ? [] : [locationInfo.error]),
        ...(ispInfo.success ? [] : [ispInfo.error])
      ]
    };

  } catch (error) {
    return {
      success: false,
      ip,
      error: `خطأ في الحصول على معلومات IP: ${error.message}`,
      location: null,
      network: null
    };
  }
};

import prisma from "../prisma/client.js";

/**
 * تحديث معلومات الجلسة بمعلومات IP
 * @param {string} sessionId - معرف الجلسة
 * @param {string} ip - عنوان IP
 * @param {string} [userAgent] - وكيل المستخدم لإضافته إلى deviceInfo
 */
export const updateSessionWithIPInfo = async (sessionId, ip, userAgent = null) => {
  try {
    const ipInfo = await getFullIPInfo(ip);
    
    if (ipInfo.success) {
      const updateData = {};
      
      if (ipInfo.location) {
        updateData.location = ipInfo.location.fullLocation;
      }
      
      if (ipInfo.network || userAgent) {
        const payload = {
          ...(ipInfo.network ? {
            isp: ipInfo.network.isp,
            organization: ipInfo.network.organization,
            connectionType: ipInfo.network.connectionType,
            isMobile: ipInfo.network.isMobile,
            isProxy: ipInfo.network.isProxy,
            isHosting: ipInfo.network.isHosting
          } : {}),
          ...(userAgent ? { userAgent } : {})
        };
        updateData.deviceInfo = JSON.stringify(payload);
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.session.update({
          where: { id: sessionId },
          data: updateData
        });
      }
    }

    return ipInfo;
  } catch (error) {
    console.error('Error updating session with IP info:', error);
    return { success: false, error: error.message };
  }
};

