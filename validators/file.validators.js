import { body, param, query } from "express-validator";

export const idParam = param("id").isInt({ gt: 0 }).withMessage("id غير صالح");
export const courseLevelIdParam = param("courseLevelId").isInt({ gt: 0 }).withMessage("courseLevelId غير صالح");
export const fileCreateRules = [
  body("courseLevelId").optional().isInt({ gt: 0 }).withMessage("courseLevelId غير صالح"),
  body("meta").optional().isString().withMessage("meta يجب أن يكون نص JSON")
];

export const fileUpdateRules = [
  body("name").optional().isString().withMessage("name يجب أن يكون نصاً"),
  body("courseLevelId").optional().isInt({ gt: 0 }).withMessage("courseLevelId غير صالح"),
  body("meta").optional().isString().withMessage("meta يجب أن يكون نص JSON")
];

export const listQueryRules = [
  query("courseLevelId").optional().isInt({ gt: 0 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 })
];
