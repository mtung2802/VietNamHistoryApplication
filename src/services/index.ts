/**
 * Export tất cả các services từ một nơi
 */

// Firebase config
export { app, auth, db, firebaseConfig } from './firebase';

// Authentication services
export {
  loginWithUsername,
  register,
  logout,
  resetPassword,
} from './authService';

// Data services
export {
  getPeriods,
  getPeriodBySlug,
  getPeriodById,
} from './periodService';

export {
  getStagesByPeriod,
  getStageById,
} from './stageService';

export {
  getEventsByStage,
  getEventById,
  getEventsByPeriod,
} from './eventService';

export {
  getPersonPeriods,
  getPersonsByPeriod,
  getPersonDetail,
  getPersonEvents,
  getPersonEventDetail,
} from './personService';

export {
  getQuizzes,
  getQuizById,
  getQuestionsByQuiz,
} from './quizService';



export {
  getUserById,
  updateUser,
  addFinishedQuiz,
  addUserBadge,
  updateLastLogin,
  uploadUserAvatar,
} from './userService';

export {
  getUserSession,
  saveUserSession,
  clearUserSession,
  USER_SESSION_KEY,
} from './userSession';
