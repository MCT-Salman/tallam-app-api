import { body, param } from "express-validator";

export const courseLevelIdParam = param("courseLevelId").isInt({ gt: 0 }).withMessage("courseLevelId غير صالح");
export const idParam = param("id").isInt({ gt: 0 }).withMessage("id غير صالح");

export const levelCreateRules = [
  body("title").exists({ checkFalsy: true }).withMessage("العنوان مطلوب").isString().isLength({ min: 2 }).withMessage("العنوان قصير"),
  body("description").optional().isString().isLength({ max: 1000 }).withMessage("الوصف يجب أن يكون أقل من 1000 حرف"),
  body("order").exists().isInt({ min: 0 }).withMessage("المستوى مطلوب"),
  body("priceUSD").exists().isFloat({ min: 0 }).withMessage("السعر مطلوب"),
  body("priceSAR").exists().isFloat({ min: 0 }).withMessage("السعر مطلوب"),
  body("imageUrl").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("الصورة مطلوبة");
    }
    return true;
  }),
  body("previewUrl").exists({ checkFalsy: true }).withMessage("الفيديو مطلوب").isString().isLength({ min: 1 }).withMessage("الفيديو مطلوب ولا يمكن أن يكون فارغ"),
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

export const instructorIdParam = [
  param("instructorId").isInt({ min: 1 }).withMessage("معرف المدرب غير صحيح"),
];

export const addInstructorToLevelRules = [
  body("instructorId").isInt({ min: 1 }).withMessage("معرف المدرب مطلوب ويجب أن يكون رقم صحيح"),
];

export const updateLevelInstructorsRules = [
  body("instructorIds")
    .isArray({ min: 0 })
    .withMessage("قائمة المدربين يجب أن تكون مصفوفة"),
  body("instructorIds.*")
    .isInt({ min: 1 })
    .withMessage("كل معرف مدرب يجب أن يكون رقم صحيح"),
];
