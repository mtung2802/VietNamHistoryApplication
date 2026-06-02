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
  getPersonPeriods,
  getPersonsByPeriod,
  getPersonDetail,
  getPersonEvents,
  getPersonEventDetail,
} from './personService';

export {
  getQuizzes,
  getQuizById,
} from './quizService';

export {
  subscribeToForum,
  getPosts,
  getPostById,
  createPost,
  deletePost,
  getReplies,
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
