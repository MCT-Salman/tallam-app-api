import { serializeResponse } from "../utils/serialize.js";
import { createStory, listStories, getStoryById, updateStory, deleteStory, getActiveStories } from "../services/story.service.js";
import { deleteFile } from "../utils/deleteFile.js";

export const adminListStories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await listStories({ page, limit });
    res.json({ success: true, message: "تم جلب القصص بنجاح", data: serializeResponse(result.data), pagination: result.pagination });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminCreateStory = async (req, res, next) => {
  try {
    const imageUrl = req.file ? `/uploads/images/stories/${req.file.filename}` : null;
    const data = {
      title: req.body.title,
      imageUrl,
      startedAt: req.body.startedAt ? new Date(req.body.startedAt) : null,
      endedAt: req.body.endedAt ? new Date(req.body.endedAt) : null,
      orderIndex: req.body.orderIndex ? parseInt(req.body.orderIndex, 10) : 0,
      isActive: req.body.isActive ? req.body.isActive === 'true' : true,
      isStory: req.body.isStory ? req.body.isStory === 'true' : true,
    };

    const story = await createStory(data);
    res.status(201).json({ success: true, message: "تم إنشاء القصة بنجاح", data: serializeResponse(story) });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminGetStory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await getStoryById(id);
    if (!item) return res.status(404).json({ success: false, error: "القصة غير موجودة" });
    res.json({ success: true, data: serializeResponse(item) });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminUpdateStory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "معرّف غير صالح" });
    }
    const existingStory = await getStoryById(id);
    if (!existingStory) {
      return res.status(404).json({ success: false, message: "القصة غير موجودة" });
    }

    const data = {};

    if (req.body.title !== undefined)
      data.title = req.body.title;

    if (req.file) {
      // حذف الصورة القديمة إذا تم رفع جديدة
      deleteFile(existingStory.imageUrl);
      data.imageUrl = `/uploads/images/stories/${req.file.filename}`;
    }

    if (req.body.startedAt !== undefined)
      data.startedAt = req.body.startedAt ? new Date(req.body.startedAt) : null;

    if (req.body.endedAt !== undefined)
      data.endedAt = req.body.endedAt ? new Date(req.body.endedAt) : null;

    if (req.body.orderIndex !== undefined)
      data.orderIndex = req.body.orderIndex ? parseInt(req.body.orderIndex, 10) : null;

    if (req.body.isActive !== undefined)
      data.isActive = req.body.isActive === "true" || req.body.isActive === true;

    if (req.body.isStory !== undefined)
      data.isStory = req.body.isStory === "true" || req.body.isStory === true;
    
    const updated = await updateStory(id, data);

    res.json({
      success: true,
      message: "تم تحديث القصة بنجاح",
      data: serializeResponse(updated),
    });

  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};

export const adminDeleteStory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteStory(id);
    res.json({ success: true, message: "تم حذف القصة بنجاح" });
  } catch (e) {
    if (e.code === 'P2025') { e.statusCode = 404; e.message = "القصة غير موجودة"; }
    else { e.statusCode = e.statusCode || 400; }
    next(e);
  }
};

// Public endpoints
export const publicListActiveStories = async (req, res, next) => {
  try {
    const stories = await getActiveStories();
    res.json({ success: true, message: "تم جلب القصص النشطة بنجاح", data: serializeResponse(stories) });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const publicGetStory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await getStoryById(id);
    if (!item) return res.status(404).json({ success: false, error: "القصة غير موجودة" });
    if (!item.isActive) return res.status(404).json({ success: false, error: "القصة غير نشطة" });
    res.json({ success: true, data: serializeResponse(item) });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
