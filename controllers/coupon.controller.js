import * as CouponService from '../services/coupon.service.js';
import { serializeResponse } from '../utils/serialize.js';
import { BAD_REQUEST_STATUS_CODE, NOT_FOUND_STATUS_CODE, SUCCESS_CREATE_STATUS_CODE, SUCCESS_STATUS_CODE } from '../validators/statusCode.js';
import { SUCCESS_REQUEST } from '../validators/messagesResponse.js';

// -------- Admin Controllers --------
export const adminCreateCoupon = async (req, res, next) => {
  try {
    const createdBy = req.user?.id;
    const coupon = await CouponService.createCoupon({ ...req.body, createdBy });
    res.status(SUCCESS_CREATE_STATUS_CODE).json({
      success: true,
      message: 'تم إنشاء الكوبون بنجاح.',
      data: serializeResponse(coupon),
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const adminListCoupons = async (req, res, next) => {
  try {
    const { skip, take } = req.query;
    const coupons = await CouponService.listCoupons({ skip, take });
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم جلب الكوبونات بنجاح.',
      data: serializeResponse(coupons),
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const adminGetCoupon = async (req, res, next) => {
  try {
    const coupon = await CouponService.getCouponById(req.params.id);
    if (!coupon) {
      return res.status(NOT_FOUND_STATUS_CODE).json({ success: false, message: 'الكوبون غير موجود', data: {} });
    }
    res.status(SUCCESS_STATUS_CODE).json({ success: SUCCESS_REQUEST, message: 'تم جلب الكوبون بنجاح.', data: serializeResponse(coupon) });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const adminUpdateCoupon = async (req, res, next) => {
  try {
    const updated = await CouponService.updateCoupon(req.params.id, req.body);
    res.status(SUCCESS_STATUS_CODE).json({ success: SUCCESS_REQUEST, message: 'تم تحديث الكوبون بنجاح.', data: serializeResponse(updated) });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const adminDeleteCoupon = async (req, res, next) => {
  try {
    await CouponService.deleteCoupon(req.params.id);
    res.status(SUCCESS_STATUS_CODE).json({ success: SUCCESS_REQUEST, message: 'تم حذف الكوبون بنجاح.', data: {} });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const adminListCouponsbyuserorlevel = async (req, res, next) => {
  try {
    const { skip, take } = req.query;
    const { userId, courseLevelId } = req.body;
    const coupons = await CouponService.listCouponsByUserOrLevel({ skip, take , userId, courseLevelId });
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم جلب الكوبونات بنجاح.',
      data: serializeResponse(coupons),
    });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const adminListByLevel = async (req, res, next) => {
  try {
    const coupons = await CouponService.listCouponsByCourseLevel(req.params.courseLevelId);
    res.status(SUCCESS_STATUS_CODE).json({ success: SUCCESS_REQUEST, message: 'تم جلب كوبونات المستوى بنجاح.', data: serializeResponse(coupons) });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const adminGetfinalPrice = async (req, res, next) => {
  try {
    const couponId = req.params.id;
    const courseLevelId = req.body.courseLevelId;
    const coupon = await CouponService.getFinalPriceWithCoupon({ couponId, courseLevelId });
    res.status(SUCCESS_STATUS_CODE).json({ success: SUCCESS_REQUEST, message: 'تم حساب السعر النهائي بنجاح.', data: coupon });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

// -------- Student Controllers --------
export const studentValidateCoupon = async (req, res, next) => {
  try {
    const { code, courseLevelId } = req.body;
    const coupon = await CouponService.validateCoupon({ code, courseLevelId });
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'الكوبون صالح.',
      data: serializeResponse({
        id: coupon.id,
        code: coupon.code,
        discount: coupon.discount,
        isPercent: coupon.isPercent,
        expiry: coupon.expiry,
        maxUsage: coupon.maxUsage,
        usedCount: coupon.usedCount,
        isActive: coupon.isActive,
      })
    });
  } catch (error) {
    error.statusCode = BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const studentApplyCoupon = async (req, res, next) => {
  try {
    const { code, courseLevelId } = req.body;
    const coupon = await CouponService.applyCoupon({ code, courseLevelId });
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم تطبيق الكوبون بنجاح.',
      data: serializeResponse({ id: coupon.id, usedCount: coupon.usedCount, code: coupon.code, finalPrice: coupon.finalPrice })
    });
  } catch (error) {
    error.statusCode = BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const adminListactiveByLevel = async (req, res, next) => {
  try {
    const coupons = await CouponService.listactiveCouponsByCourseLevel(req.params.courseLevelId);
    res.status(SUCCESS_STATUS_CODE).json({ success: SUCCESS_REQUEST, message: 'تم جلب كوبونات المستوى بنجاح.', data: serializeResponse(coupons) });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const adminListUsers = async (req, res, next) => {
  try {
    const users = await CouponService.listUsers();
    res.status(SUCCESS_STATUS_CODE).json({ success: SUCCESS_REQUEST, message: 'تم جلب المستخدمين بنجاح.', data: serializeResponse(users) });
  } catch (error) {
    error.statusCode = error.statusCode || BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};
