import { serializeResponse } from "../utils/serialize.js";
import { 
  createDomain, listDomains, updateDomain, toggleDomain, DeleteDomain,
  createSpecialization, listSpecializations, listSpecializationsBySubject, updateSpecialization, toggleSpecialization, DeleteSpecialization,
  createSubject, listSubjects, listSubjectsByDomain, updateSubject, toggleSubject, DeleteSubject,
  createInstructor, listInstructors, updateInstructor, toggleInstructor, DeleteInstructor,
  createCourse, updateCourse, toggleCourse, deleteCourse, getCourseById, getCourseByIdForUser, listCoursesPublic ,listCoursesAdmin,
  listInstructorsForCourse,
} from "../services/catalog.service.js";

// Admin: Domains
export const adminCreateDomain = async (req, res, next) => {
  try {
    const { name } = req.body;
    const d = await createDomain(name);
    res.status(201).json({ 
      success: true, 
      message: "تم إنشاء المجال بنجاح",
      data: {
        ...serializeResponse(d)
      }
    });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminListDomains = async (req, res, next) => {
  try { 
    const list = await listDomains(); 
    res.json({ 
      success: true, 
      message: "تم جلب قائمة المجالات بنجاح",
      data: {
        ...serializeResponse(list)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminUpdateDomain = async (req, res, next) => {
  try { 
    const d = await updateDomain(parseInt(req.params.id,10), { name: req.body.name }); 
    res.json({ 
      success: true, 
      message: "تم تحديث المجال بنجاح",
      data: {
        ...serializeResponse(d)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminToggleDomain = async (req, res, next) => {
  try { 
    const d = await toggleDomain(parseInt(req.params.id,10), !!req.body.isActive); 
    const message = !!req.body.isActive ? "تم تفعيل المجال بنجاح" : "تم تعطيل المجال بنجاح";
    res.json({ 
      success: true, 
      message,
      data: {
        ...serializeResponse(d)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminDeleteDomain = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await DeleteDomain(id);
    res.json({
      success: true,
      message: "تم حذف المجال بنجاح"
    });
  } catch (e) {
    if (e.code === 'P2025') { // Prisma record not found
      e.statusCode = 404;
      e.message = "الحقل غير موجود";
    } else {
      e.statusCode = e.statusCode || 400;
    }
    next(e);
  }
};

// Admin: Subjects
export const adminCreateSubject = async (req, res, next) => {
  try {
    const s = await createSubject({
      name: req.body.name,
      domainId: parseInt(req.body.domainId, 10)
    });
    res.status(201).json({
      success: true,
      message: "تم إنشاء المادة بنجاح",
      data: serializeResponse(s)
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
}; 

export const adminListSubjectsByDomain = async (req, res, next) => {
  try {
    const domainId = parseInt(req.params.id, 10);
    const items = await listSubjectsByDomain(domainId);
    res.json({
      success: true,
      message: "تم جلب المواد بنجاح",
      data: serializeResponse(items)
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};

export const adminUpdateSubject = async (req, res, next) => {
  try {
    const s = await updateSubject(parseInt(req.params.id, 10), {
      name: req.body.name,
      domainId: req.body.domainId ? parseInt(req.body.domainId, 10) : undefined
    });
    res.json({
      success: true,
      message: "تم تحديث المادة بنجاح",
      data: serializeResponse(s)
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};

export const adminListSubjects = async (req, res, next) => {
  try {
    const list = await listSubjects();
    res.json({
      success: true,
      message: "تم جلب المواد",
      data: serializeResponse(list)
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};

export const adminListSubjectsBySpecialization = async (req, res, next) => {
  try {
    const specializationId = parseInt(req.params.id, 10);
    const list = await listSubjectsBySpecialization(specializationId);
    res.json({
      success: true,
      message: "تم جلب المواد",
      data: serializeResponse(list)
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};
export const adminToggleSubject = async (req, res, next) => {
  try {
    const s = await toggleSubject(parseInt(req.params.id,10), !!req.body.isActive);
    const message = !!req.body.isActive ? "تم تفعيل الموضوع بنجاح" : "تم تعطيل الموضوع بنجاح";
    res.json({
      success: true,
      message,
      data: serializeResponse(s)
    });
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminDeleteSubject = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await DeleteSubject(id);
    res.json({
      success: true,
      message: "تم حذف الموضوع بنجاح"
    });
  } catch (e) {
    if (e.code === 'P2025') { // Prisma record not found
      e.statusCode = 404;
      e.message = "الحقل غير موجود";
    } else {
      e.statusCode = e.statusCode || 400;
    }
    next(e);
  }
};

// Admin: Specializations
export const adminCreateSpecialization = async (req, res, next) => {
  try {
    const { name } = req.body;
    const subjectId = parseInt(req.body.subjectId, 10);
    const imageUrl = req.file ? `/uploads/images/specializations/${req.file.filename}` : undefined;
    const specialization = await createSpecialization({ name, subjectId, imageUrl });
    res.status(201).json({
      success: true,
      message: "تم إنشاء التخصص بنجاح",
      data: serializeResponse(specialization)
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};

export const adminListSpecializations = async (req, res, next) => {
  try { 
    const list = await listSpecializations(); 
    res.json({ 
      success: true, 
      message: "تم جلب التخصصات بنجاح",
      data: {
        ...serializeResponse(list)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminListSpecializationsBySubject = async (req, res, next) => {
  try {
    const subjectId = parseInt(req.params.id, 10);
    const items = await listSpecializationsBySubject(subjectId);
    res.json({
      success: true,
      message: "تم جلب التخصصات بنجاح",
      data: serializeResponse(items)
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};

export const adminUpdateSpecialization = async (req, res, next) => {
  try {
    const updateData = { name: req.body.name };
    if (req.body.subjectId) updateData.subjectId = parseInt(req.body.subjectId, 10);
    if (req.file) updateData.imageUrl = `/uploads/images/specializations/${req.file.filename}`;
    const s = await updateSpecialization(parseInt(req.params.id, 10), updateData);
    res.json({
      success: true,
      message: "تم تحديث التخصص بنجاح",
      data: serializeResponse(s)
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};  

export const adminToggleSpecialization = async (req, res, next) => {
  try { 
    const s = await toggleSpecialization(parseInt(req.params.id,10), !!req.body.isActive); 
    const message = !!req.body.isActive ? "تم تفعيل التخصص بنجاح" : "تم تعطيل التخصص بنجاح";
    res.json({ 
      success: true, 
      message,
      data: {
        ...serializeResponse(s)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};  

export const adminDeleteSpecialization = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await DeleteSpecialization(id);
    res.json({
      success: true,
      message: "تم حذف التخصص بنجاح"
    });
  } catch (e) {
    if (e.code === 'P2025') { // Prisma record not found
      e.statusCode = 404;
      e.message = "الحقل غير موجود";
    } else {
      e.statusCode = e.statusCode || 400;
    }
    next(e);
  }
};


// Admin: Instructors
export const adminCreateInstructor = async (req, res, next) => {
  try {
    const { name, bio, specializationId } = req.body;
    const avatarUrl = req.file ? `/uploads/images/instructors/${req.file.filename}` : undefined;
    const i = await createInstructor({ name, bio, avatarUrl, specializationId: parseInt(specializationId, 10) });
    res.status(201).json({
      success: true,
      message: "تم إنشاء المدرب بنجاح",
      data: serializeResponse(i)
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};
export const adminListInstructors = async (req, res, next) => {
  try { 
    const list = await listInstructors(); 
    res.json({ 
      success: true, 
      data: {
        message: "تم جلب قائمة المدربين بنجاح",
        ...serializeResponse(list)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminUpdateInstructor = async (req, res, next) => {
  try {
    const updateData = { name: req.body.name, bio: req.body.bio };
    if (req.body.specializationId) updateData.specializationId = parseInt(req.body.specializationId, 10);
    if (req.file) updateData.avatarUrl = `/uploads/images/instructors/${req.file.filename}`;
    const i = await updateInstructor(parseInt(req.params.id, 10), updateData);
    res.json({
      success: true,
      message: "تم تحديث المدرب بنجاح",
      data: serializeResponse(i)
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};
export const adminToggleInstructor = async (req, res, next) => {
  try { 
    const i = await toggleInstructor(parseInt(req.params.id,10), !!req.body.isActive); 
    const message = !!req.body.isActive ? "تم تفعيل المدرب بنجاح" : "تم تعطيل المدرب بنجاح";
    res.json({ 
      success: true, 
      data: {
        message,
        ...serializeResponse(i)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminDeleteInstructor = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await DeleteInstructor(id);
    res.json({
      success: true,
      message: "تم حذف المدرب بنجاح"
    });
  } catch (e) {
    if (e.code === 'P2025') { // Prisma record not found
      e.statusCode = 404;
      e.message = "الحقل غير موجود";
    } else {
      e.statusCode = e.statusCode || 400;
    }
    next(e);
  }
};

// Admin: Courses
export const adminCreateCourse = async (req, res, next) => {
  try {
    const { title, description, specializationId } = req.body;
    const imageUrl = req.file ? `/uploads/images/course/${req.file.filename}` : undefined;
    const courseData = { title, description, specializationId: parseInt(specializationId, 10), imageUrl };
    const c = await createCourse(courseData);
    res.status(201).json({
      success: true,
      message: "تم إنشاء الكورس بنجاح",
      data: serializeResponse(c)
    });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminUpdateCourse = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updateData = { title: req.body.title, description: req.body.description };
    if (req.body.specializationId) updateData.specializationId = parseInt(req.body.specializationId, 10);
    if (req.file) updateData.imageUrl = `/uploads/images/course/${req.file.filename}`;
    const c = await updateCourse(id, updateData);
    res.json({
      success: true,
      message: "تم تحديث الكورس بنجاح",
      data: serializeResponse(c)
    });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminDeleteCourse = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const id = parseInt(req.params.id, 10);
    await deleteCourse(id);
    res.json({
      success: true,
      message: "تم حذف الكورس بنجاح"
    });
  } catch (e) {
    if (e.code === 'P2025') { // Prisma record not found
      e.statusCode = 404;
      e.message = "الكورس غير موجود";
    } else {
      e.statusCode = e.statusCode || 400;
    }
    next(e);
  }
};

export const adminToggleCourse = async (req, res, next) => {
  try { 
    const c = await toggleCourse(parseInt(req.params.id,10), !!req.body.isActive); 
    const message = !!req.body.isActive ? "تم تفعيل الكورس بنجاح" : "تم تعطيل الكورس بنجاح";
    res.json({ 
      success: true, 
      message,
      data: serializeResponse(c)
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminListCourses = async (req, res, next) => {
  try {
    const result = await listCoursesAdmin(req.query, parseInt(req.query.skip) || 0, parseInt(req.query.take) || 20);
    res.json({
      success: true,
      message: "تم جلب قائمة الكورسات بنجاح",
      data: serializeResponse(result)
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

// Public

export const publicListSpecializations = async (req, res, next) => {
  try { 
    const list = await listSpecializations(); 
    res.json({ 
      success: true, 
      message: "تم جلب قائمة التخصصات بنجاح",
      data: list
      
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const publicListCoursesBySpecialization = async (req, res, next) => {
  try { 
    const specializationId = parseInt(req.params.id, 10);
    const list = await listCoursesPublic({ specializationId }); 
    res.json({ 
      success: true, 
      message: "تم جلب قائمة الكورسات بنجاح",
      data: list
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const publicListCoursesByInstructor = async (req, res, next) => {
  try { 
    const instructorId = parseInt(req.params.id, 10);
    const list = await listCoursesPublic({ instructorId }); 
    res.json({ 
      success: true, 
      message: "تم جلب قائمة الكورسات بنجاح",
      data: list
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const publicListCourses = async (req, res, next) => {
  try {
    console.log(req.query);
    const skip = req.query.skip ? parseInt(req.query.skip,10): 0;
    const take = req.query.take ? parseInt(req.query.take,10): 20;
    const filters = {
      q: req.query.q || undefined,
      domainId: req.query.domainId ? parseInt(req.query.domainId,10): undefined,
      subjectId: req.query.subjectId ? parseInt(req.query.subjectId,10): undefined,
      instructorId: req.query.instructorId ? parseInt(req.query.instructorId,10): undefined,
    };
    const result = await listCoursesPublic(filters, skip, take);
    res.json({ 
      success: true,
      message: "تم جلب قائمة الكورسات بنجاح",
      data: result
    });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const publicListInstructorsForCourse = async (req, res, next) => {
  try { 
    const courseId = parseInt(req.params.id, 10);
    const instructors = await listInstructorsForCourse(courseId);
    res.json({ 
      success: true, 
      message: "تم جلب قائمة المدربين بنجاح",
      data: instructors
    }); 
  }
  catch (e) { 
    if (e.message === "Course not found") {
      e.statusCode = 404;
      e.message = "الكورس غير موجود";
    } else {
      e.statusCode = e.statusCode || 400;
    }
    next(e); 
  }
};

export const publicGetCourse = async (req, res, next) => {
  try { 
    const courseId = parseInt(req.params.id, 10);
    const userId = req.user?.id; // from optionalAuth

    const course = userId ? await getCourseByIdForUser(courseId, userId) : await getCourseById(courseId);

    if (!course || !course.isActive) return res.status(404).json({ 
      success: false, 
      message: "الكورس غير موجود"
    }); 
    res.json({ 
      success: true, 
      message: "تم جلب الكورس بنجاح",
      data: course
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
