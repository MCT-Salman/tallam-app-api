import prisma from '../prisma/client.js';
import { getBooleanSetting } from './appSettings.service.js';

// ---------- Admin Functions ----------

/**
 * Create a quiz for a course level (now just returns course level info).
 * @param {number} courseLevelId
 * @param {object} data
 * @returns {Promise<object>}
 */
export const createQuiz = async (courseLevelId, data) => {
  // Since we're eliminating the Quiz table, this function now just returns course level info
  const courseLevel = await prisma.courseLevel.findUnique({
    where: { id: courseLevelId },
    select: {
      id: true,
      name: true,
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!courseLevel) {
    throw new Error('Course level not found');
  }

  return {
    id: courseLevel.id,
    title: data.title || courseLevel.name,
    courseLevelId: courseLevel.id,
    courseLevel,
  };
};

/**
 * Get questions for a course level.
 * @param {number} courseLevelId
 * @returns {Promise<import('@prisma/client').Question[]>}
 */
export const getQuestionsByCourseLevel = async (courseLevelId) => {
  return prisma.question.findMany({
    where: { courseLevelId },
    orderBy: { order: 'asc' },
    include: {
      options: {
        orderBy: { id: 'asc' },
      },
    },
  });
};



/**
 * Delete a quiz (now deletes all questions for a course level).
 * @param {number} courseLevelId
 * @returns {Promise<object>}
 */
export const deleteQuiz = async (courseLevelId) => {
  // Delete all questions and their options for this course level
  await prisma.option.deleteMany({
    where: {
      question: {
        courseLevelId,
      },
    },
  });

  await prisma.question.deleteMany({
    where: { courseLevelId },
  });

  // Also delete any quiz results for this course level
  await prisma.quizResult.deleteMany({
    where: { courseLevelId },
  });

  return { deleted: true, courseLevelId };
};

/**
 * Add a question to a course level.
 * @param {number} courseLevelId
 * @param {object} data
 * @returns {Promise<import('@prisma/client').Question>}
 */
export const addQuestionToCourseLevel = async (courseLevelId, data) => {
  return prisma.question.create({
    data: {
      courseLevelId,
      text: data.text,
      order: data.order,
      options: {
        create: data.options.map(option => ({
          text: option.text,
          isCorrect: option.isCorrect,
        })),
      },
    },
    include: {
      options: true,
    },
  });
};

/**
 * Update a question.
 * @param {number} questionId
 * @param {object} data
 * @returns {Promise<import('@prisma/client').Question>}
 */
export const updateQuestion = async (questionId, data) => {
  const { text, order, options } = data;

  return prisma.question.update({
    where: { id: questionId },
    data: {
      text,
      order,
      options: options
        ? {
            // Delete all old options and add new ones
            deleteMany: {},
            create: options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect ?? false,
            })),
          }
        : undefined,
    },
    include: {
      options: true,
    },
  });
};

/**
 * Delete a question.
 * @param {number} questionId
 * @returns {Promise<import('@prisma/client').Question>}
 */
export const deleteQuestion = async (questionId) => {
  // Delete all options first
  await prisma.option.deleteMany({
    where: { questionId: questionId },
  });

  return prisma.question.delete({
    where: { id: questionId },
  });
};

/**
 * Update an option.
 * @param {number} optionId
 * @param {object} data
 * @returns {Promise<import('@prisma/client').Option>}
 */
export const updateOption = async (optionId, data) => {
  return prisma.option.update({
    where: { id: optionId },
    data,
  });
};

/**
 * Delete an option.
 * @param {number} optionId
 * @returns {Promise<import('@prisma/client').Option>}
 */
export const deleteOption = async (optionId) => {
  return prisma.option.delete({
    where: { id: optionId },
  });
};

// ---------- Student Functions ----------

/**
 * Check if a user has access to a course level.
 * @param {number} userId
 * @param {number} courseLevelId
 * @returns {Promise<boolean>}
 */
const checkCourseLevelAccess = async (userId, courseLevelId) => {
  const access = await prisma.accessCode.findFirst({
    where: {
      courseLevelId,
      usedBy: userId,
      // isActive is false after use, but we check expiresAt
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
  return !!access;
};

/** Student: Get a quiz to take (without correct answers) */
export const getQuizByCourseLevelId = async (courseLevelId, userId) => {
  const questions = await prisma.question.findMany({
    where: { courseLevelId },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      text: true,
      order: true,
      options: {
        select: {
          id: true,
          text: true,
        },
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!questions || questions.length === 0) {
    throw new Error(QUIZ_NOT_FOUND);
  }

  // Check if student has access to the course level
  const hasAccess = await checkCourseLevelAccess(userId, courseLevelId);
  if (!hasAccess) {
    throw new Error(QUIZ_NO_ACCESS);
  }

  return questions;
};

/** Student: Get a quiz to take (without correct answers) */
export const getQuizForStudent = async (courseLevelId, userId) => {
  const questions = await prisma.question.findMany({
    where: { courseLevelId },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      text: true,
      order: true,
      options: {
        select: {
          id: true,
          text: true,
        },
        orderBy: { id: 'asc' },
      },
    },
  });

 const isfree = await prisma.courseLevel.findUnique({
    where: { id: courseLevelId },
    select: { isFree: true },
  });

  // Check if student has access to the course level
  const hasAccess = await checkCourseLevelAccess(userId, courseLevelId);
  if (!hasAccess || !isfree.isFree) {
    throw new Error("لا يمكنك الوصول للاختبار");
  }

  return questions;
};

/** Student: Submit quiz answers and get result */
export const submitQuiz = async (courseLevelId, userId, answers) => {
  // 1. Fetch the questions with correct answers
  const questions = await prisma.question.findMany({
    where: { courseLevelId },
    include: {
      options: true,
    },
  });

  if (!questions || questions.length === 0) throw new Error(QUIZ_NOT_FOUND);

  // 2. Check if student has access to the course level
  const hasAccess = await checkCourseLevelAccess(userId, courseLevelId);
  if (!hasAccess) throw new Error(QUIZ_NO_ACCESS);

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  // 3. Prepare detailed answers with correctness
  const detailedAnswers = answers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    const correctOption = question?.options.find((o) => o.isCorrect);
    const isCorrect = correctOption ? correctOption.id === answer.optionId : false;

    return {
      questionId: answer.questionId,
      optionId: answer.optionId,
      isCorrect,
      correctOptionId: correctOption?.id || null,
      correctOptionText: correctOption?.text || null
    };
  });

  const correctAnswers = detailedAnswers.filter((a) => a.isCorrect).length;
  const incorrectAnswers = detailedAnswers.filter((a) => !a.isCorrect).length;
  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  // 4. Check if student has already taken this quiz
  const existingResult = await prisma.quizResult.findFirst({
    where: { courseLevelId, userId },
  });

  let result;
  if (existingResult) {
    // Update the existing result
    result = await prisma.quizResult.update({
      where: { id: existingResult.id },
      data: { score, answers: detailedAnswers },
    });
  } else {
    // Create a new result
    result = await prisma.quizResult.create({
      data: {
        userId,
        courseLevelId,
        score,
        answers: detailedAnswers,
      },
    });
  }

  // 5. Check if rating is allowed and get average review for this course level
  let averageReview = null;
  const allowRating = await getBooleanSetting('allowRating', true);

  if (allowRating) {
    const reviewStats = await prisma.review.aggregate({
      where: { courseLevelId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    if (reviewStats._count.rating > 0) {
      averageReview = {
        averageRating: Number(reviewStats._avg.rating),
        totalReviews: reviewStats._count.rating
      };
    }
  }

  return {
    resultId: result.id,
    score,
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    answers: detailedAnswers,
    alreadyTaken: !!existingResult,
    averageReview: averageReview // Include average review if rating is allowed
  };
};
