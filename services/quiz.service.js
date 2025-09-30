import prisma from '../prisma/client.js';

// Assume QuizModel is defined elsewhere or use prisma directly
const QuizModel = prisma.quiz;

// ---------- Admin Functions ----------

/**
 * Create a new quiz for a course level.
 * @param {number} courseLevelId
 * @param {object} data
 * @returns {Promise<import('@prisma/client').Quiz>}
 */
export const createQuiz = async (courseLevelId, data) => {
  return prisma.quiz.create({
    data: {
      courseLevelId,
      title: data.title,
    },
    select: {
        id: true,
        title: true,
        courseLevelId: true,
      
      courseLevel: {
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
      },
    },
  });
};

/**
 * Get a quiz by ID.
 * @param {number} quizId
 * @returns {Promise<import('@prisma/client').Quiz>}
 */
export const getQuizById = async (quizId) => {
  return prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      title: true,
      courseLevelId: true,
      courseLevel: {
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
      },
      questions: {
        include: {
          options: true,
        },
      },
    },
  });
};

/**
 * Get a quiz by course level ID.
 * @param {number} courseLevelId
 * @returns {Promise<import('@prisma/client').Quiz>}
 *//*
export const getQuizByCourseLevelId = async (courseLevelId) => {
  return prisma.quiz.findMany({
    where: { courseLevelId },
    select: {
      id: true,
      title: true,
      courseLevelId: true,
      courseLevel: {
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
      },
      questions: {
        include: {
          options: true,
        },
      },
    },
  });
};
*/
/**
 * Update a quiz.
 * @param {number} quizId
 * @param {object} data
 * @returns {Promise<import('@prisma/client').Quiz>}
 */
export const updateQuiz = async (quizId, data) => {
  return prisma.quiz.update({
    where: { id: quizId },
    data,
    include: {
      courseLevel: {
        include: {
          course: true,
        },
      },
    },
  });
};

/**
 * Delete a quiz.
 * @param {number} quizId
 * @returns {Promise<import('@prisma/client').Quiz>}
 */
export const deleteQuiz = async (quizId) => {
  return prisma.quiz.delete({
    where: { id: quizId },
  });
};

/**
 * Add a question to a quiz.
 * @param {number} quizId
 * @param {object} data
 * @returns {Promise<import('@prisma/client').Question>}
 */
export const addQuestionToQuiz = async (quizId, data) => {
  return prisma.question.create({
    data: {
      quizId,
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
            // حذف جميع الخيارات القديمة وإضافة الجديدة
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
  // حذف كل الخيارات المرتبطة أولاً
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
  const quiz = await QuizModel.findMany({
    where: { courseLevelId },
    select: {
      id: true,
      title: true,
      courseLevelId: true,
      questions: {
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
      },
    },
  });

  if (!quiz) {
    throw new Error(QUIZ_NOT_FOUND);
  }

  // Check if student has access to the course level
  const hasAccess = await checkCourseLevelAccess(userId, quiz.courseLevelId);
  if (!hasAccess) {
    throw new Error(QUIZ_NO_ACCESS);
  }

  return quiz;
};

/** Student: Get a quiz to take (without correct answers) */
export const getQuizForStudent = async (quizId, userId) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      title: true,
      courseLevelId: true,
      questions: {
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
      },
    },
  });

  if (!quiz) {
    throw new Error(QUIZ_NOT_FOUND);
  }

  // Check if student has access to the course
  const hasAccess = await checkCourseLevelAccess(userId, quiz.courseLevelId);
  if (!hasAccess) {
    throw new Error(QUIZ_NO_ACCESS);
  }

  return quiz;
};

/** Student: Submit quiz answers and get result */
/*
export const submitQuiz = async (quizId, userId, answers) => {
  // 1. Fetch the quiz with correct answers
  const quiz = await QuizModel.findUnique({
    where: { id: quizId },
    include: {
      courseLevel: true,
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!quiz) throw new Error(QUIZ_NOT_FOUND);

  // 2. Check if student has access to the course level
  const hasAccess = await checkCourseLevelAccess(userId, quiz.courseLevelId);
  if (!hasAccess) throw new Error(QUIZ_NO_ACCESS);

  // 3. Check if student has already taken this quiz
  const existingResult = await prisma.quizResult.findFirst({ where: { quizId, userId } });
  if (existingResult) throw new Error(QUIZ_ALREADY_TAKEN);

  // 4. Calculate score
  let correctAnswers = 0;
  const totalQuestions = quiz.questions.length;
  const questionMap = new Map(quiz.questions.map((q) => [q.id, q]));

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (question) {
      const correctOption = question.options.find((o) => o.isCorrect);
      if (correctOption && correctOption.id === answer.optionId) {
        correctAnswers++;
      }
    }
  }

  const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  // 5. Save the result
  const result = await prisma.quizResult.create({
    data: { userId, quizId, score, answers },
  });

  return { resultId: result.id, score, totalQuestions, correctAnswers };
};*/
export const submitQuiz = async (quizId, userId, answers) => {
  // 1. Fetch the quiz with correct answers
  const quiz = await QuizModel.findUnique({
    where: { id: quizId },
    include: {
      courseLevel: true,
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!quiz) throw new Error(QUIZ_NOT_FOUND);

  // 2. Check if student has access to the course level
  const hasAccess = await checkCourseLevelAccess(userId, quiz.courseLevelId);
  if (!hasAccess) throw new Error(QUIZ_NO_ACCESS);

  const questionMap = new Map(quiz.questions.map((q) => [q.id, q]));

  // 3. Prepare detailed answers with correctness
  const detailedAnswers = answers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    const correctOption = question?.options.find((o) => o.isCorrect);
    const isCorrect = correctOption?.id === answer.optionId;
    return { ...answer, isCorrect };
  });

  const correctAnswers = detailedAnswers.filter((a) => a.isCorrect).length;
  const incorrectAnswers = detailedAnswers.filter((a) => !a.isCorrect).length;
  const totalQuestions = quiz.questions.length;
  const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  // 4. Check if student has already taken this quiz
  const existingResult = await prisma.quizResult.findFirst({ where: { quizId, userId } });

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
      data: { userId, quizId, score, answers: detailedAnswers },
    });
  }

  return {
    resultId: result.id,
    score,
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    answers: detailedAnswers,
    alreadyTaken: !!existingResult,
  };
};

