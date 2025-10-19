import prisma from "../prisma/client.js";
import { CLEANUP_LIMIT, LOCKOUT_TIME_LOGIN, MAX_TRY_FAILURE_LOGIN, TIME_TRY_AFTER_FAILURE_LOGIN } from "../validators/messagesResponse.js";

/**
 * فئة لإدارة rate limiting لمنع هجمات القوة الغاشمة
 */
class RateLimiter {
  constructor() {
    this.attempts = new Map(); // تخزين مؤقت في الذاكرة
    this.maxAttempts = MAX_TRY_FAILURE_LOGIN; // الحد الأقصى للمحاولات
    this.windowTime = TIME_TRY_AFTER_FAILURE_LOGIN; 
    this.lockoutTime = LOCKOUT_TIME_LOGIN
  }

  /**
   * التحقق من إمكانية المحاولة
   */
  async canAttempt(identifier) {
    const now = Date.now();
    const key = `login_${identifier}`;
    
    if (!this.attempts.has(key)) {
      return true;
    }

    const attemptData = this.attempts.get(key);
    
    // إذا انتهت فترة القفل، امسح البيانات
    if (now - attemptData.firstAttempt > this.lockoutTime) {
      this.attempts.delete(key);
      return true;
    }

    // إذا تم تجاوز الحد الأقصى للمحاولات
    if (attemptData.count >= this.maxAttempts) {
      return false;
    }

    return true;
  }

  /**
   * تسجيل محاولة فاشلة
   */
  async recordFailedAttempt(identifier, ip, userAgent, userId = null, failureReason = null) {
    const now = Date.now();
    const key = `login_${identifier}`;
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      });
    } else {
      const attemptData = this.attempts.get(key);
      attemptData.count++;
      attemptData.lastAttempt = now;
    }

    // تسجيل المحاولة في قاعدة البيانات للمراقبة
    try {
      await prisma.loginAttempt.create({
        data: {
          identifier,
          userId: userId || undefined,
          ip,
          userAgent,
          success: false,
          failureReason: failureReason || undefined,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging failed attempt:', error);
    }
  }

  /**
   * تسجيل محاولة ناجحة
   */
  async recordSuccessfulAttempt(identifier, ip, userAgent, userId = null) {
    const key = `login_${identifier}`;
    
    // مسح محاولات فاشلة سابقة
    if (this.attempts.has(key)) {
      this.attempts.delete(key);
    }

    // تسجيل المحاولة الناجحة
    try {
      await prisma.loginAttempt.create({
        data: {
          identifier,
          userId: userId || undefined,
          ip,
          userAgent,
          success: true,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging successful attempt:', error);
    }
  }

  /**
   * الحصول على معلومات المحاولات
   */
  getAttemptInfo(identifier) {
    const key = `login_${identifier}`;
    const attemptData = this.attempts.get(key);
    
    if (!attemptData) {
      return { count: 0, remainingAttempts: this.maxAttempts };
    }

    const remainingAttempts = Math.max(0, this.maxAttempts - attemptData.count);
    const timeUntilReset = Math.max(0, this.lockoutTime - (Date.now() - attemptData.firstAttempt));
    
    return {
      count: attemptData.count,
      remainingAttempts,
      timeUntilReset,
      isLocked: attemptData.count >= this.maxAttempts
    };
  }

  /**
   * تنظيف البيانات القديمة (يجب استدعاؤها دورياً)
   */
  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.attempts.entries()) {
      if (now - data.firstAttempt > this.lockoutTime) {
        this.attempts.delete(key);
      }
    }
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
export const rateLimiter = new RateLimiter();

// تنظيف دوري كل 10 دقائق
setInterval(() => {
  rateLimiter.cleanup();
}, CLEANUP_LIMIT);

