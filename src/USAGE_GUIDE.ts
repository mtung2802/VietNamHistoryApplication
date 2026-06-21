/**
 * HƯỚNG DẪN SỬ DỤNG FRAMEWORK
 * ===========================
 * File này cung cấp các ví dụ cách sử dụng các services, hooks, models trong project
 */

// ============================================================
// 1. IMPORTS - Cách import các modules
// ============================================================

// Từ constants
import { COLORS, FONT_SIZES, SPACING, THEME } from '@/constants/theme';

// Từ models
import type {
  Era,
  Period,
  Stage,
  Event,
  Person,
  QuizItem,
  QuestionItem,
  UserModel,
  ForumPost,
  Reply,
} from '@/models';

// Từ services - Option 1: Import từ index
import {
  auth,
  db,
  loginWithUsername,
  getPeriods,
  getQuizzes,
  getUserById,
} from '@/services';

// Từ services - Option 2: Import trực tiếp từ file
import { getPeriods as fetchPeriods } from '@/services/periodService';

// Từ hooks
import { useAuth, useUserSession } from '@/hooks';

// Từ utils
import { formatDate, extractYearFromTimestamp } from '@/utils';

// ============================================================
// 2. AUTHENTICATION - Ví dụ xác thực người dùng
// ============================================================

// Ví dụ 1: Đăng nhập bằng email/password
async function handleLogin(email: string, password: string) {
  try {
    const user = await loginWithUsername(email, password);
    console.log('✅ Đăng nhập thành công:', user.uid);
    // Lưu session người dùng
    // await saveUserSession(user);
  } catch (error) {
    console.error('❌ Đăng nhập thất bại:', error);
  }
}

// Ví dụ 2: Sử dụng useAuth hook
function MyComponent() {
  const { user, loading, isAuthenticated, signOut } = useAuth();

  if (loading) return <Text>Đang tải...</Text>;

  return (
    <View>
      {isAuthenticated ? (
        <>
          <Text>Xin chào, {user?.email}</Text>
          <Button title="Đăng xuất" onPress={() => signOut()} />
        </>
      ) : (
        <Text>Vui lòng đăng nhập</Text>
      )}
    </View>
  );
}

// ============================================================
// 3. FETCHING DATA - Ví dụ lấy dữ liệu từ Firestore
// ============================================================

// Ví dụ 1: Lấy danh sách thời kỳ
async function loadPeriods() {
  try {
    const periods: Period[] = await getPeriods();
    console.log('✅ Tải thành công', periods.length, 'thời kỳ');
    // Dùng periods data ở đây
  } catch (error) {
    console.error('❌ Lỗi tải thời kỳ:', error);
  }
}

// Ví dụ 2: Lấy bài viết diễn đàn
import { getPosts, getRepliesByPost } from '@/services';

async function loadForumData() {
  try {
    const posts: ForumPost[] = await getPosts();
    console.log('✅ Tải thành công', posts.length, 'bài viết');

    // Lấy trả lời cho bài viết đầu tiên
    if (posts.length > 0) {
      const replies: Reply[] = await getRepliesByPost(posts[0].id);
      console.log('✅ Tải thành công', replies.length, 'trả lời');
    }
  } catch (error) {
    console.error('❌ Lỗi tải forum:', error);
  }
}

// ============================================================
// 4. STYLING - Ví dụ sử dụng theme colors
// ============================================================

import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary, // Đỏ chính (#C8102E)
    padding: SPACING[4], // 16px
  },
  title: {
    fontSize: FONT_SIZES.xl, // 20px
    color: COLORS.white,
  },
  accent: {
    color: COLORS.accent, // Vàng (#FFD700)
  },
});

function StyledComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tiêu đề</Text>
      <Text style={styles.accent}>Nội dung nhấn mạnh</Text>
    </View>
  );
}

// ============================================================
// 5. DATE UTILITIES - Ví dụ xử lý ngày tháng
// ============================================================

// Ví dụ 1: Định dạng ngày
const date = new Date();
const formatted = formatDate(date, 'DD/MM/YYYY'); // "19/05/2026"

// Ví dụ 2: Trích xuất năm từ timestamp
const timestamp = 1630000000; // seconds
const year = extractYearFromTimestamp(timestamp); // 2021

// ============================================================
// 6. USER SESSION - Ví dụ quản lý session người dùng
// ============================================================

function MyProfileComponent() {
  const { user: sessionUser, saveUserSession, clearUserSession } = useUserSession();

  const handleUpdateProfile = async (newName: string) => {
    try {
      const updatedUser: UserModel = {
        ...sessionUser!,
        displayName: newName,
      };
      await saveUserSession(updatedUser);
      console.log('✅ Cập nhật profile thành công');
    } catch (error) {
      console.error('❌ Lỗi cập nhật profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await clearUserSession();
      console.log('✅ Xóa session thành công');
    } catch (error) {
      console.error('❌ Lỗi xóa session:', error);
    }
  };

  return (
    <View>
      <Text>{sessionUser?.displayName || 'Guest'}</Text>
      <Button title="Cập nhật" onPress={() => handleUpdateProfile('New Name')} />
      <Button title="Đăng xuất" onPress={handleLogout} />
    </View>
  );
}

// ============================================================
// 7. CREATING FORUM POST - Ví dụ tạo bài viết
// ============================================================

import { createPost } from '@/services';

async function createNewForumPost(
  authorId: string,
  title: string,
  content: string,
) {
  try {
    const postId = await createPost({
      authorId,
      title,
      content,
      category: 'Thảo luận',
      tags: ['lịch sử', 'thảo luận'],
      viewCount: 0,
      replyCount: 0,
      likeCount: 0,
      isPinned: false,
      isLocked: false,
    });

    console.log('✅ Tạo bài viết thành công, ID:', postId);
    return postId;
  } catch (error) {
    console.error('❌ Lỗi tạo bài viết:', error);
  }
}

// ============================================================
// 8. QUIZ - Ví dụ lấy quiz và câu hỏi
// ============================================================

import { getQuizById, getQuestionsByQuiz } from '@/services';

async function loadQuizData(quizId: string) {
  try {
    const quiz: QuizItem | null = await getQuizById(quizId);
    if (!quiz) {
      console.warn('Không tìm thấy quiz');
      return;
    }

    const questions: QuestionItem[] = await getQuestionsByQuiz(quizId);
    console.log(`✅ Tải quiz "${quiz.title}" với ${questions.length} câu hỏi`);

    return { quiz, questions };
  } catch (error) {
    console.error('❌ Lỗi tải quiz:', error);
  }
}

// ============================================================
// 9. USER BADGES - Vi du cap nhat badge
// ============================================================

import { addUserBadge } from '@/services';

async function awardUserAchievement(uid: string, badge: string) {
  try {
    await addUserBadge(uid, badge);
    console.log(`Added badge "${badge}"`);
  } catch (error) {
    console.error('Loi cap nhat achievement:', error);
  }
}

// ============================================================
// GỢI Ý CÁCH TỔNG CHỈNH DỰ ÁN
// ============================================================

/*
Cấu trúc folder:
src/
├── app/                    # Expo Router screens
├── components/             # Reusable components
├── constants/              # Constants (theme, config)
├── hooks/                  # Custom hooks
├── models/                 # TypeScript interfaces
├── services/               # Firestore & API services
├── utils/                  # Utility functions
├── global.css             # Global styles
└── index.tsx              # Entry point

Workflow thông thường:
1. Import colors/spacing từ @/constants/theme
2. Sử dụng hooks (useAuth, useUserSession) để quản lý state
3. Gọi services để fetch/update data
4. Format ngày tháng bằng utils/dateUtils
5. Áp dụng models để type-checking data

Best practices:
- Luôn wrap API calls trong try-catch
- Kiểm tra null/undefined trước khi dùng data
- Dùng TypeScript strict mode
- Không hardcode màu sắc, dùng COLORS constant
- Dùng models để type-checking dữ liệu từ Firestore
*/
