import { body, param, query } from "express-validator";

export const idParam = param("id").isInt({ gt: 0 }).withMessage("معرّف غير صالح");
export const courseIdParam = param("courseId").isInt({ gt: 0 }).withMessage("courseId غير صالح");

export const domainCreateRules = [
  body("name").exists({ checkFalsy: true }).withMessage("الاسم مطلوب").isString().isLength({ min: 2 }).withMessage("الاسم قصير")
];

export const specializationCreateRules = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("الاسم مطلوب")
    .isString()
    .isLength({ min: 2 })
    .withMessage("الاسم قصير"),
  body("domainId")
    .isInt({ gt: 0 })
    .withMessage("domainId غير صالح")
];


export const subjectCreateRules = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("الاسم مطلوب")
    .isString()
    .isLength({ min: 2 })
    .withMessage("الاسم قصير"),
/*  body("specializationId")
    .isInt({ gt: 0 })
    .withMessage("specializationId غير صالح")*/
];


export const instructorCreateRules = [
  body("name").exists({ checkFalsy: true }).withMessage("الاسم مطلوب").isString().isLength({ min: 2 }).withMessage("الاسم قصير"),
  body("bio").optional().isString(),
  body("avatarUrl").optional().isString()
];

export const courseCreateRules = [
  body("title").exists({ checkFalsy: true }).withMessage("العنوان مطلوب").isString().isLength({ min: 2 }).withMessage("العنوان قصير"),
  body("description").optional().isString(),
  body("price").optional().isFloat({ min: 0 }).withMessage("السعر يجب أن يكون رقماً"),
  body("currency").optional().isString().withMessage("العملة يجب أن تكون نصاً"),
  body("isFree").optional().isBoolean().withMessage("isFree يجب أن يكون قيمة منطقية"),
  body("subjectId").isInt({ gt: 0 }).withMessage("subjectId غير صالح"),
  body("instructorIds").exists({ checkFalsy: true }).withMessage("يجب تحديد مدرب واحد على الأقل").isArray({ min: 1 }).withMessage("يجب تحديد مدرب واحد على الأقل"),
  body("instructorIds.*").isInt({ gt: 0 }).withMessage("معرفات المدربين غير صالحة")
];

export const courseUpdateRules = courseCreateRules.map(rule => rule.optional());

export const toggleActiveRules = [
  body("isActive").isBoolean().withMessage("isActive غير صالح")
];

export const listQueryRules = [
  query("q").optional().isString(),
  query("domainId").optional().isInt({ gt: 0 }),
  query("specializationId").optional().isInt({ gt: 0 }),
  query("subjectId").optional().isInt({ gt: 0 }),
  query("instructorId").optional().isInt({ gt: 0 }),
  query("skip").optional().isInt({ min: 0 }),
  query("take").optional().isInt({ min: 1, max: 100 })
];
