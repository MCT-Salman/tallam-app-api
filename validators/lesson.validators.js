import { body, param } from "express-validator";

export const courseIdParam = param("courseId").isInt({ gt: 0 }).withMessage("courseId غير صالح");
export const levelIdParam = param("levelId").isInt({ gt: 0 }).withMessage("levelId غير صالح");
export const idParam = param("id").isInt({ gt: 0 }).withMessage("id غير صالح");

export const levelCreateRules = [
  body("title").exists({ checkFalsy: true }).withMessage("العنوان مطلوب").isString().isLength({ min: 2 }).withMessage("العنوان قصير"),
  body("orderIndex").optional().isInt({ min: 0 })
];

export const lessonCreateRules = [
  body("title").exists({ checkFalsy: true }).withMessage("العنوان مطلوب").isString().isLength({ min: 2 }).withMessage("العنوان قصير"),
  body("youtubeUrl").exists({ checkFalsy: true }).withMessage("رابط يوتيوب مطلوب").isString(),
  body("youtubeId").optional().isString(),
  body("durationSec").optional().isInt({ min: 0 }),
  body("orderIndex").optional().isInt({ min: 0 }),
  body("isFreePreview").optional().isBoolean()
];

export const toggleActiveRules = [
  body("isActive").isBoolean().withMessage("isActive غير صالح")
];
