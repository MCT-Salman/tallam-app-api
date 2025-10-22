import { UserModel } from "../models/index.js";
import { sendOtp, verifyOtp } from "../services/otp.service.js";
import { FAILURE_REQUEST, OTP_ALREADY_VERIFIED, SUCCESS_REQUEST } from "../validators/messagesResponse.js";
import { BAD_REQUEST_STATUS_CODE, SUCCESS_STATUS_CODE } from "../validators/statusCode.js";

export const requestOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const user = await UserModel.findByPhone(phone);
    if (user && user.isActive === false) throw new Error("هذا الحساب غير نشط");
    const result = await sendOtp(phone);

    // Use appropriate HTTP status based on success/failure
    const statusCode = result.success ? SUCCESS_STATUS_CODE : BAD_REQUEST_STATUS_CODE;

    // if (result.success) {
      
      res.status(statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data
      });
    // }
    //  else {
     
    //   res.status(statusCode).json({
    //     success: result.success,
    //     message: result.message,
    //    data: result.data
    //   });
    // }
  } catch (e) {
    e.statusCode = e.statusCode || BAD_REQUEST_STATUS_CODE;
    return next(e);
  }
};

export const checkOtp = async (req, res, next) => {
  try {
    const { phone, code } = req.body;

    // Verify the OTP
    const result = await verifyOtp(phone, code,req);

    res.json({
      success: result.success,
      message: result.message,
      data: result.data
    })

    // const { isVerified, userExists } = result.data;

    // if (isVerified) {
    //   // User is already verified - can proceed with account creation
    //   res.json({ 
    //     success: true,
    //     message: "تم التحقق من رمز OTP بنجاح - الحساب مؤكد مسبقاً",
    //     data: {
    //       isAlreadyVerified: true,
    //       canProceedWithAccountCreation: true
    //     }
    //   });
    // } else if (userExists) {
    //   // User exists but not verified - inform user
    //   res.json({ 
    //     success: true,
    //     message: "تم التحقق من رمز OTP بنجاح - الحساب موجود لكن غير مؤكد",
    //     data: {
    //       isAlreadyVerified: false,
    //       canProceedWithAccountCreation: false
    //     }
    //   });
    // } else {
    //   // User doesn't exist - can create new account
    //   res.json({ 
    //     success: true,
    //     message: "تم التحقق من رمز OTP بنجاح - يمكن إنشاء حساب جديد",
    //     data: {
    //       isAlreadyVerified: false,
    //       canProceedWithAccountCreation: true
    //     }
    //   });
    // }
  } catch (e) {
    e.statusCode = e.statusCode || BAD_REQUEST_STATUS_CODE;
    return next(e);
  }
};
