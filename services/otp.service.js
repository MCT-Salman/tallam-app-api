import axios from 'axios';
import { OtpCodeModel, SessionModel, UserModel } from "../models/index.js";
import { getRealIP } from "../utils/ip.js";
import { generateTokenPair, revokeUserRefreshTokensExceptSession } from "../utils/jwt.js";
import { rateLimiter } from "../utils/rateLimiter.js";
import { FAILURE_OTP_CODE, FAILURE_REQUEST, NUMBER_ALREADY_EXIST, OTP_ALREADY_VERIFIED, OTP_CODE_EXPIRED, OTP_SUCCESS_REQUEST, OTP_SUCCESS_VERIFY, OTP_TIME_OUT_OTP, SUCCESS_REQUEST } from "../validators/messagesResponse.js";

function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendOtp = async (phone) => {

  // const notUsedOtp = await OtpCodeModel.findForNotUsedOtpNumber(phone);
  // if (notUsedOtp.length > 0) {
  //  await editExpDate(phone);
  // }
  // Check if user with this phone already exists and is verified
  // const isVerifiedNumber = await OtpCodeModel.findForVerifeidNumber(phone);




  // if (user && !user.isVerified) {
  //   return {
  //     success: FAILURE_REQUEST,
  //     message: "هذا الحساب غير موجود مسبقاً",
  //     data: {
  //       isAlreadyVerified: FAILURE_REQUEST
  //     }
  //   }
  // }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TIME_OUT_OTP);

  await OtpCodeModel.createOtp(phone, code, expiresAt);

  // بعد إنشاء code و قبل الإرجاع
  /* if (process.env.NODE_ENV === 'development') {
     console.log(`📩 OTP to ${phone}: ${code}`);
     return {
       success: SUCCESS_REQUEST,
       message: `${OTP_SUCCESS_REQUEST}: ${code}`,
       data: {}
     };
   }*/

  const response = await axios.post('https://hypermsg.net/api/whatsapp/messages/send', {
    phone_number: phone,
    message: `رمز التحقق الخاص بك هو ${code}`,
    whatsapp_number_id: 18
  }, {
    headers: {
      'x-api-key': 'eOd1XQfCJIQyoV20SV8aFc0OL94k7JkdEvoh3tZaW2RZsHKQU2sxaWGmcAQiSts1',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // في الإنتاج — لا تُرجع الكود ولا تطبعه
  return {
    success: SUCCESS_REQUEST,
    message: OTP_SUCCESS_REQUEST,
    data: response.data
  };


  // console.log(`📩 OTP to ${phone}: ${code}`);
  // return {
  //   success: SUCCESS_REQUEST,
  //   message: `${OTP_SUCCESS_REQUEST}: ${code}`,
  //   data:{
  //     isAlreadyVerified: FAILURE_REQUEST
  //   }
  // };
};

export const verifyOtp = async (phone, code, deviceInfo, req) => {
  const otp = await OtpCodeModel.findForVerify(phone, code);
  const user = await UserModel.findByPhone(phone);
  // const isVerifiedNumber = await OtpCodeModel.findForVerifeidNumber(phone);

  // if (isVerifiedNumber) throw new Error(OTP_ALREADY_VERIFIED);
  if (!otp) throw new Error(FAILURE_OTP_CODE);
  if (otp.expiresAt < new Date()) throw new Error(OTP_CODE_EXPIRED);

  await OtpCodeModel.markOtpUsed(otp.id);



  if (!user || user && !user.isVerified) {
    return {
      success: SUCCESS_REQUEST,
      message: OTP_SUCCESS_VERIFY,
      data: {
        isAlreadyVerified: FAILURE_REQUEST
      }
    };
  } else {
    const realIp = getRealIP(req);
    const userAgent = req.headers["user-agent"];

    // إنشاء جلسة جديدة
    const session = await SessionModel.createSession({
      userId: user.id,
      userAgent,
      ip: req.ip,
      realIp,
      deviceInfo
    });

    // تحديث معرف الجلسة الحالية
    await UserModel.updateById(user.id, { currentSessionId: session.id });

    // إنشاء التوكنات
    const tokens = await generateTokenPair(user.id, session.id, user.role);

    // تسجيل محاولة ناجحة
    await rateLimiter.recordSuccessfulAttempt(phone, realIp, userAgent, user.id);

    // إلغاء جميع Refresh Tokens الأخرى للمستخدم للحفاظ على جلسة واحدة فعّالة فقط
    //await revokeUserRefreshTokensExceptSession(user.id, session.id);

    const { isVerified: __, ...safeUser } = user;
    return {
      success: SUCCESS_REQUEST,
      message: OTP_SUCCESS_VERIFY,
      data: {
        user: safeUser,
        isVerified: user.isVerified,
        isAlreadyVerified: SUCCESS_REQUEST,
        ...tokens
      }
    };
  }
};
