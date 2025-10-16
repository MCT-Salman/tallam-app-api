import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  adminCreateCoupon,
  adminListCoupons,
  adminGetCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  adminListByLevel,
  adminGetfinalPrice,
  studentValidateCoupon,
  studentApplyCoupon,
} from '../controllers/coupon.controller.js';
import {
  couponCreateRules,
  couponUpdateRules,
  couponIdParam,
  courseLevelIdParam,
  listQueryRules,
  studentCouponRules,
} from '../validators/coupon.validators.js';

const router = Router();

// ----- Admin Routes -----
router.post('/admin', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(couponCreateRules), adminCreateCoupon);
router.get('/admin', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(listQueryRules), adminListCoupons);
router.get('/admin/:id', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(couponIdParam), adminGetCoupon);
router.put('/admin/:id', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(couponIdParam), validate(couponUpdateRules), adminUpdateCoupon);
router.delete('/admin/:id', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(couponIdParam), adminDeleteCoupon);
router.get('/admin/level/:courseLevelId', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(courseLevelIdParam), adminListByLevel);
router.get('/admin/coupon/:id', requireAuth, requireRole(['ADMIN', 'SUBADMIN']), validate(couponIdParam), adminGetfinalPrice);


// ----- Student Routes -----
router.post('/validate', requireAuth, requireRole(['STUDENT']), validate(studentCouponRules), studentValidateCoupon);
router.post('/apply', requireAuth, requireRole(['STUDENT']), validate(studentCouponRules), studentApplyCoupon);

export default router;
