/**
 * Export tất cả các services từ một nơi
 */

// Firebase config
export { app, auth, db, firebaseConfig } from './firebase';

// Authentication services
export {
  loginWithUsername,
  loginWithGoogle,
  register,
  logout,
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
  getPersonsByPeriod,
  getPersonById,
  getPersonBySlug,
} from './personService';

export {
  getQuizzes,
  getQuizById,
  getQuestionsByQuiz,
} from './quizService';

export {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getRepliesByPost,
  addReply,
} from './forumService';

export {
  getUserById,
  updateUser,
  addUserPoints,
  addFinishedQuiz,
  addUserBadge,
  updateLastLogin,
} from './userService';
