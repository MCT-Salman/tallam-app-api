import { serializeResponse } from "../utils/serialize.js";
import {
  createLevel, listLevelsByCourse, updateLevel, toggleLevel, deleteLevel,
  createLessonForCourse, createLessonForLevel, listLessonsByCourse, listLessonsByLevel,
  updateLesson, toggleLesson, deleteLesson
} from "../services/lesson.service.js";

// Levels (Admin)
export const adminCreateLevel = async (req, res, next) => {
  try { 
    const level = await createLevel(parseInt(req.params.courseId,10), { title: req.body.title, order: req.body.order ? parseInt(req.body.order,10): 0 }); 
    res.status(201).json({ 
      success: true, 
      message: "تم إنشاء المستوى بنجاح",
      data: {
        ...serializeResponse(level)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminListLevels = async (req, res, next) => {
  try { 
    const levels = await listLevelsByCourse(parseInt(req.params.courseId,10)); 
    res.json({ 
      success: true, 
      message: "تم جلب قائمة المستويات بنجاح",
      data: {
        ...serializeResponse(levels)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminUpdateLevel = async (req, res, next) => {
  try { 
    const level = await updateLevel(parseInt(req.params.id,10), { title: req.body.title, order: req.body.order ? parseInt(req.body.order,10): undefined }); 
    res.json({ 
      success: true, 
      message: "تم تحديث المستوى بنجاح",
      data: {
        ...serializeResponse(level)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminToggleLevel = async (req, res, next) => {
  try { 
    const level = await toggleLevel(parseInt(req.params.id,10), !!req.body.isActive); 
    const message = !!req.body.isActive ? "تم تفعيل المستوى بنجاح" : "تم تعطيل المستوى بنجاح";
    res.json({ 
      success: true, 
      message,
      data: {
        ...serializeResponse(level)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminDeleteLevel = async (req, res, next) => {
  try {
    await deleteLevel(parseInt(req.params.id, 10));
    res.json({
      success: true,
      message: "تم حذف المستوى بنجاح"
    });
  } catch (e) {
    if (e.code === 'P2025') { // Prisma record not found
      e.statusCode = 404;
      e.message = "المستوى غير موجود";
    } else {
      e.statusCode = e.statusCode || 400;
    }
    next(e);
  }
};

// Lessons (Admin)
export const adminCreateLessonForCourse = async (req, res, next) => {
  try { 
    const lesson = await createLessonForCourse(parseInt(req.params.courseId,10), {
      title: req.body.title,
      youtubeUrl: req.body.youtubeUrl,
      youtubeId: req.body.youtubeId,
      durationSec: req.body.durationSec? parseInt(req.body.durationSec,10): null,
      orderIndex: req.body.orderIndex? parseInt(req.body.orderIndex,10): 0,
      isFreePreview: !!req.body.isFreePreview
    }); 
    res.status(201).json({ 
      success: true, 
      message: "تم إنشاء الدرس بنجاح",
      data: {
        ...serializeResponse(lesson)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminCreateLessonForLevel = async (req, res, next) => {
  try { 
    const lesson = await createLessonForLevel(parseInt(req.params.courseLevelId,10), {
      title: req.body.title,
      youtubeUrl: req.body.youtubeUrl,
      youtubeId: req.body.youtubeId,
      durationSec: req.body.durationSec? parseInt(req.body.durationSec,10): null,
      orderIndex: req.body.orderIndex? parseInt(req.body.orderIndex,10): 0,
      isFreePreview: !!req.body.isFreePreview
    }); 
    res.status(201).json({ 
      success: true, 
      message: "تم إنشاء الدرس بنجاح",
      data: {
        ...serializeResponse(lesson)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminUpdateLesson = async (req, res, next) => {
  try { 
    const lesson = await updateLesson(parseInt(req.params.id,10), {
      title: req.body.title,
      youtubeUrl: req.body.youtubeUrl,
      youtubeId: req.body.youtubeId,
      durationSec: req.body.durationSec? parseInt(req.body.durationSec,10): undefined,
      orderIndex: req.body.orderIndex? parseInt(req.body.orderIndex,10): undefined,
      isFreePreview: req.body.isFreePreview
    }); 
    res.json({ 
      success: true, 
      message: "تم تحديث الدرس بنجاح",
      data: {
        ...serializeResponse(lesson)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminToggleLesson = async (req, res, next) => {
  try { 
    const lesson = await toggleLesson(parseInt(req.params.id,10), !!req.body.isActive); 
    const message = !!req.body.isActive ? "تم تفعيل الدرس بنجاح" : "تم تعطيل الدرس بنجاح";
    res.json({ 
      success: true, 
      message,
      data: {
        ...serializeResponse(lesson)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminDeleteLesson = async (req, res, next) => {
  try {
    await deleteLesson(parseInt(req.params.id, 10));
    res.json({
      success: true,
      message: "تم حذف الدرس بنجاح"
    });
  } catch (e) {
    if (e.code === 'P2025') { // Prisma record not found
      e.statusCode = 404;
      e.message = "الدرس غير موجود";
    } else {
      e.statusCode = e.statusCode || 400;
    }
    next(e);
  }
};

// Public
export const publicListLevelsWithLessons = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.courseId,10);
    const levels = await listLevelsByCourse(courseId);
    // نجلب دروس كل مستوى
    const full = await Promise.all(levels.map(async (lvl) => ({
      ...lvl,
      lessons: await listLessonsByLevel(lvl.id)
    })));
    res.json({ 
      success: true, 
      data: {
        message: "تم جلب قائمة المستويات والدروس بنجاح",
        ...serializeResponse(full)
      }
    });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const publicListCourseLessonsFlat = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.courseId,10);
    const lessons = await listLessonsByCourse(courseId);
    res.json({ 
      success: true, 
      message: "تم جلب قائمة الدروس بنجاح",
      data: {
        ...serializeResponse(lessons)
      }
    });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
