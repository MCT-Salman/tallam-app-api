import { Router } from "express";
import { requestOtp, checkOtp } from "../controllers/otp.controller.js";
import { normalizePhoneE164 } from "../middlewares/phone.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { phoneNumber } from "../validators/auth.validators.js";

const r = Router();

r.post("/request",normalizePhoneE164,validate(phoneNumber), requestOtp); // إرسال OTP
r.post("/verify",normalizePhoneE164,validate(phoneNumber), checkOtp);    // التحقق من OTP

export default r;
 