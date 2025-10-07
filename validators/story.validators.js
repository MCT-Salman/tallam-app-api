import { body, param, query } from "express-validator";

export const idParam = param("id").isInt({ gt: 0 }).withMessage("id غير صالح");

export const storyCreateRules = [
  body("title").optional().isString().withMessage("title يجب أن يكون نصاً"),
  body("imageUrl").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("الصورة مطلوبة");
    }
    return true;
  }),
  body("startedAt").optional().isISO8601().withMessage("startedAt يجب أن يكون تاريخ صحيح"),
  body("endedAt").optional().isISO8601().withMessage("endedAt يجب أن يكون تاريخ صحيح"),
  body("orderIndex").optional().isInt({ min: 0 }).withMessage("orderIndex يجب أن يكون رقماً صحيحاً"),
  body("isActive").optional().isBoolean().withMessage("isActive يجب أن يكون true أو false")
];

export const storyUpdateRules = storyCreateRules.map(rule => rule.optional());

export const listQueryRules = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 })
];
