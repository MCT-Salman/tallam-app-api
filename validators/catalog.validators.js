import { body, param, query } from "express-validator";

export const idParam = param("id").isInt({ gt: 0 }).withMessage("معرّف غير صالح");
export const courseIdParam = param("courseId").isInt({ gt: 0 }).withMessage("courseId غير صالح");
export const courseLevelIdParam = param("courseLevelId").isInt({ gt: 0 }).withMessage("courseLevelId غير صالح");
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
    body("imageUrl").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("الصورة مطلوبة");
      }
      return true;
    }),
];

export const subjectCreateRules = [
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

export const instructorCreateRules = [
  body("name").exists({ checkFalsy: true }).withMessage("الاسم مطلوب").isString().isLength({ min: 2 }).withMessage("الاسم قصير"),
  body("bio").exists({ checkFalsy: true }).withMessage("السيرة الذاتية مطلوبة").isString(),
  body("avatarUrl").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("الصورة مطلوبة");
    }
    return true;
  }),
  body("specializationId").isInt({ gt: 0 }).withMessage("specializationId غير صالح")
];

export const instructorUpdateRules = instructorCreateRules.map(rule => rule.optional());

export const courseCreateRules = [
  body("title").exists({ checkFalsy: true }).withMessage("العنوان مطلوب").isString().isLength({ min: 2 }).withMessage("العنوان قصير"),
  body("description").exists({ checkFalsy: true }).withMessage("الشرح مطلوب").isString().isLength({ min: 1 }).withMessage("الشرح مطلوب ولا يمكن أن يكون فارغ"),
  body("imageUrl").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("الصورة مطلوبة");
    }
    return true;
  }),
  body("specializationId").isInt({ gt: 0 }).withMessage("specializationId غير صالح")
];

export const courseUpdateRules = courseCreateRules.map(rule => rule.optional());

export const toggleActiveRules = [
  body("isActive").isBoolean().withMessage("isActive غير صالح")
];

export const listQueryRules = [
  query("q").optional().isString(),
  query("domainId").optional().isInt({ gt: 0 }),
  query("specializationId").optional().isInt({ gt: 0 }),
  query("instructorId").optional().isInt({ gt: 0 }),
  query("skip").optional().isInt({ min: 0 }),
  query("take").optional().isInt({ min: 1, max: 100 })
];
