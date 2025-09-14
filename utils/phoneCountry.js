import parsePhoneNumber from 'libphonenumber-js';
import { ERROR_PHONE_NUMBER, ERROR_PHONE_NUMBER_FORMAT, FAILURE_REQUEST, SUCCESS_REQUEST } from '../validators/messagesResponse.js';

/**
 * استخراج معلومات الدولة من رقم الهاتف
 * @param {string} phoneNumber - رقم الهاتف مع رمز الدولة
 * @returns {Object} معلومات الدولة والرقم
 */
export const getCountryFromPhone = (phoneNumber) => {
  try {
    // إزالة المسافات والرموز الإضافية
    const cleanPhone = phoneNumber.replace(/\s+/g, '').trim();
    
    // التأكد من وجود رمز الدولة
    if (!cleanPhone.startsWith('+')) {
      return {
        success: FAILURE_REQUEST,
        message: ERROR_PHONE_NUMBER_FORMAT,
        phone: cleanPhone
      };
    }

    // تحليل رقم الهاتف
    const parsed = parsePhoneNumber(cleanPhone);
    
    if (!parsed) {
      return {
        success: FAILURE_REQUEST,
        message: ERROR_PHONE_NUMBER,
        phone: cleanPhone
      };
    }

    // التحقق من صحة الرقم
    if (!parsed.isValid()) {
      return {
        success: FAILURE_REQUEST,
        message: ERROR_PHONE_NUMBER,
        phone: cleanPhone,
        country: parsed.country,
        countryCode: parsed.countryCallingCode
      };
    }

    return {
      success: SUCCESS_REQUEST,
      phone: parsed.number, // الرقم الكامل مع رمز الدولة
      nationalNumber: parsed.nationalNumber, // الرقم المحلي
      country: parsed.country, // رمز الدولة (مثل SA, EG, AE)
      countryCode: `+${parsed.countryCallingCode}`, // رمز الاتصال (+966, +20, +971)
      countryName: getCountryName(parsed.country), // اسم الدولة
      isValid: true,
      isPossible: parsed.isPossible(),
      type: getPhoneType(parsed) // نوع الرقم (mobile, fixed-line, etc)
    };

  } catch (error) {
    return {
      success: false,
      message: `خطأ في تحليل رقم الهاتف: ${error.message}`,
      phone: phoneNumber
    };
  }
};

/**
 * الحصول على اسم الدولة من رمز الدولة
 * @param {string} countryCode - رمز الدولة (مثل SA, EG, AE)
 * @returns {string} اسم الدولة
 */
export const getCountryName = (countryCode) => {
  const countryNames = {
    'SA': 'المملكة العربية السعودية',
    'EG': 'مصر',
    'AE': 'الإمارات العربية المتحدة',
    'KW': 'الكويت',
    'QA': 'قطر',
    'BH': 'البحرين',
    'OM': 'عمان',
    'JO': 'الأردن',
    'LB': 'لبنان',
    'SY': 'سوريا',
    'IQ': 'العراق',
    'YE': 'اليمن',
    'PS': 'فلسطين',
    'MA': 'المغرب',
    'TN': 'تونس',
    'DZ': 'الجزائر',
    'LY': 'ليبيا',
    'SD': 'السودان',
    'US': 'الولايات المتحدة الأمريكية',
    'GB': 'المملكة المتحدة',
    'FR': 'فرنسا',
    'DE': 'ألمانيا',
    'IT': 'إيطاليا',
    'ES': 'إسبانيا',
    'TR': 'تركيا',
    'IN': 'الهند',
    'PK': 'باكستان',
    'BD': 'بنغلاديش',
    'CN': 'الصين',
    'JP': 'اليابان',
    'KR': 'كوريا الجنوبية',
    'AU': 'أستراليا',
    'CA': 'كندا',
    'BR': 'البرازيل',
    'MX': 'المكسيك',
    'RU': 'روسيا'
  };

  return countryNames[countryCode] || countryCode;
};

/**
 * الحصول على نوع رقم الهاتف
 * @param {PhoneNumber} parsed - رقم الهاتف المحلل
 * @returns {string} نوع الرقم
 */
export const getPhoneType = (parsed) => {
  try {
    const type = parsed.getType();
    const typeNames = {
      'MOBILE': 'جوال',
      'FIXED_LINE': 'خط ثابت',
      'FIXED_LINE_OR_MOBILE': 'خط ثابت أو جوال',
      'TOLL_FREE': 'رقم مجاني',
      'PREMIUM_RATE': 'رقم مدفوع',
      'SHARED_COST': 'تكلفة مشتركة',
      'VOIP': 'صوت عبر الإنترنت',
      'PERSONAL_NUMBER': 'رقم شخصي',
      'PAGER': 'جهاز استدعاء',
      'UAN': 'رقم موحد',
      'VOICEMAIL': 'بريد صوتي'
    };

    return typeNames[type] || type || 'غير محدد';
  } catch (error) {
    return 'غير محدد';
  }
};

/**
 * التحقق من صحة رقم الهاتف
 * @param {string} phoneNumber - رقم الهاتف
 * @param {string} defaultCountry - الدولة الافتراضية (اختياري)
 * @returns {Object} نتيجة التحقق
 */
export const validatePhoneNumber = (phoneNumber, defaultCountry = null) => {
  try {
    const parsed = parsePhoneNumber(phoneNumber, defaultCountry);
    
    if (!parsed) {
      return {
        isValid: false,
        isPossible: false,
        message: ERROR_PHONE_NUMBER
      };
    }

    return {
      isValid: parsed.isValid(),
      isPossible: parsed.isPossible(),
      country: parsed.country,
      countryCode: `+${parsed.countryCallingCode}`,
      nationalNumber: parsed.nationalNumber,
      internationalNumber: parsed.number,
      type: getPhoneType(parsed)
    };

  } catch (error) {
    return {
      isValid: false,
      isPossible: false,
      message: error.message
    };
  }
};

/**
 * تنسيق رقم الهاتف
 * @param {string} phoneNumber - رقم الهاتف
 * @param {string} format - نوع التنسيق ('international', 'national', 'e164')
 * @returns {string} الرقم المنسق
 */
export const formatPhoneNumber = (phoneNumber, format = 'international') => {
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    
    if (!parsed || !parsed.isValid()) {
      return phoneNumber; // إرجاع الرقم كما هو إذا لم يكن صالحاً
    }

    switch (format.toLowerCase()) {
      case 'national':
        return parsed.formatNational();
      case 'international':
        return parsed.formatInternational();
      case 'e164':
        return parsed.number;
      case 'uri':
        return parsed.getURI();
      default:
        return parsed.formatInternational();
    }

  } catch (error) {
    return phoneNumber;
  }
};

