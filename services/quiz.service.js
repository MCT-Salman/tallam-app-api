export const deleteOption = async (optionId) => {
  return OptionModel.deleteById(optionId);
};

// ---------- Student Functions ----------

/**
 * Check if a user has access to a course.
 * @param {number} userId
 * @param {number} courseId
 * @returns {Promise<boolean>}
 */
const checkCourseAccess = async (userId, courseId) => {
  const access = await prisma.accessCode.findFirst({
    where: {
      courseId,
      usedBy: userId,
      // isActive is false after use, but we check expiresAt
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
  return !!access;
};

/** Student: Get a quiz to take (without correct answers) */
export const getQuizForStudent = async (quizId, userId) => {
  const quiz = await QuizModel.findById(quizId, {
    select: {
      id: true,
      title: true,
      courseId: true,
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
  const hasAccess = await checkCourseAccess(userId, quiz.courseId);
  if (!hasAccess) {
    throw new Error(QUIZ_NO_ACCESS);
  }

  return quiz;
};

/** Student: Submit quiz answers and get result */
export const submitQuiz = async (quizId, userId, answers) => {
  // 1. Fetch the quiz with correct answers
  const quiz = await QuizModel.findById(quizId, {
    include: {
      course: true,
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!quiz) throw new Error(QUIZ_NOT_FOUND);

  // 2. Check if student has access to the course
  const hasAccess = await checkCourseAccess(userId, quiz.courseId);
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
};

