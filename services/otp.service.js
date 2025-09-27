import { OtpCodeModel, UserModel } from "../models/index.js";
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
  const user = await UserModel.findByPhone(phone);



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
  if (process.env.NODE_ENV === 'development') {
    if (!user || user && !user.isVerified) {
      console.log(`📩 OTP to ${phone}: ${code}`);
      // في التطوير يمكن اعادة الكود كـ convenience:
      return {
        success: SUCCESS_REQUEST,
        message: `${OTP_SUCCESS_REQUEST}: ${code}`,
        data: {
          isAlreadyVerified: SUCCESS_REQUEST
        }
      };
    }else{
      return {
        success: SUCCESS_REQUEST,
        message: `${OTP_SUCCESS_REQUEST}: ${code}`,
        data: {
          isAlreadyVerified: FAILURE_REQUEST
        }
      };
    }

  }

  // في الإنتاج — لا تُرجع الكود ولا تطبعه
  return {
    success: SUCCESS_REQUEST,
    message: OTP_SUCCESS_REQUEST,
    data: {
      isAlreadyVerified: FAILURE_REQUEST
    }
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

export const verifyOtp = async (phone, code) => {
  const otp = await OtpCodeModel.findForVerify(phone, code);
  const isVerifiedNumber = await OtpCodeModel.findForVerifeidNumber(phone);

  if (isVerifiedNumber) throw new Error(OTP_ALREADY_VERIFIED);
  if (!otp) throw new Error(FAILURE_OTP_CODE);
  if (otp.expiresAt < new Date()) throw new Error(OTP_CODE_EXPIRED);

  await OtpCodeModel.markOtpUsed(otp.id);

  return {
    success: SUCCESS_REQUEST,
    message: OTP_SUCCESS_VERIFY,
  };
};
