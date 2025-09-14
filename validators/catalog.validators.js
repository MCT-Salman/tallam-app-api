import { body, param, query } from "express-validator";

export const idParam = param("id").isInt({ gt: 0 }).withMessage("معرّف غير صالح");

export const domainCreateRules = [
  body("name").exists({ checkFalsy: true }).withMessage("الاسم مطلوب").isString().isLength({ min: 2 }).withMessage("الاسم قصير")
];

export const subjectCreateRules = [
  body("name").exists({ checkFalsy: true }).withMessage("الاسم مطلوب").isString().isLength({ min: 2 }).withMessage("الاسم قصير"),
  body("domainId").isInt({ gt: 0 }).withMessage("domainId غير صالح")
];

export const instructorCreateRules = [
  body("name").exists({ checkFalsy: true }).withMessage("الاسم مطلوب").isString().isLength({ min: 2 }).withMessage("الاسم قصير"),
  body("bio").optional().isString(),
  body("avatarUrl").optional().isString()
];

export const courseCreateRules = [
  body("title").exists({ checkFalsy: true }).withMessage("العنوان مطلوب").isString().isLength({ min: 2 }).withMessage("العنوان قصير"),
  body("description").optional().isString(),
  body("priceUSD").optional().isFloat({ min: 0 }),
  body("priceSYP").optional().isFloat({ min: 0 }),
  body("promoVideoUrl").optional().isString(),
  body("levelCount").optional().isInt({ min: 0 }),
  body("subjectId").isInt({ gt: 0 }).withMessage("subjectId غير صالح"),
  body("instructorId").isInt({ gt: 0 }).withMessage("instructorId غير صالح")
];

export const toggleActiveRules = [
  body("isActive").isBoolean().withMessage("isActive غير صالح")
];

export const listQueryRules = [
  query("q").optional().isString(),
  query("domainId").optional().isInt({ gt: 0 }),
  query("subjectId").optional().isInt({ gt: 0 }),
  query("instructorId").optional().isInt({ gt: 0 }),
  query("skip").optional().isInt({ min: 0 }),
  query("take").optional().isInt({ min: 1, max: 100 })
];
