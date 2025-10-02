import { serializeResponse } from "../utils/serialize.js";
import { createSuggestion, listSuggestions, getSuggestionById } from "../services/suggestion.service.js";

// Student: create suggestion
export const studentCreateSuggestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { message, courseLevelId } = req.body;
    const suggestion = await createSuggestion(userId, { message, courseLevelId: courseLevelId ? Number(courseLevelId) : null });
    res.status(201).json({
      success: true,
      message: "تم إرسال الاقتراح بنجاح",
      data: serializeResponse(suggestion),
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};

// Admin: list suggestions with optional filters
export const adminListSuggestions = async (req, res, next) => {
  try {
    const { userId, courseLevelId, skip, take } = req.query;
    const result = await listSuggestions({ userId, courseLevelId, skip, take });
    res.json({
      success: true,
      message: "تم جلب الاقتراحات بنجاح",
      data: serializeResponse(result.items),
      pagination: { total: result.total, skip: result.skip, take: result.take },
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};

// Admin: get single suggestion by id
export const adminGetSuggestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await getSuggestionById(Number(id));
    if (!item) {
      return res.status(404).json({ success: false, message: "الاقتراح غير موجود" });
    }
    res.json({ success: true, data: serializeResponse(item) });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};
