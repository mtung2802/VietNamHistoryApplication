/**
 * Model định nghĩa cấu trúc của một Người dùng
 */

export interface UserModel {
  uid: string; // Firebase UID
  email: string; // Email
  username?: string; // Tên đăng nhập
  displayName?: string; // Tên hiển thị
  avatar?: string; // URL ảnh đại diện
  bio?: string; // Tiểu sử
  phone?: string; // Số điện thoại
  dateOfBirth?: Date; // Ngày sinh
  gender?: 'male' | 'female' | 'other'; // Giới tính
  isVerified: boolean; // Đã xác minh email
  totalScore: number; // Tổng điểm đạt được
  level: number; // Cấp độ người dùng (1-10)
  badges?: string[]; // Danh sách badge đạt được
  finishedQuizzes?: string[]; // Danh sách quiz đã hoàn thành
  preferences?: {
    language?: string; // Ngôn ngữ ưa thích
    notifications?: boolean; // Bật/tắt thông báo
    theme?: 'light' | 'dark'; // Chế độ sáng/tối
  };
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}
