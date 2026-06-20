/**
 * Tab Hồ sơ – Chỉ hiển thị trang profile (đã đăng nhập sẵn).
 * Khi đăng xuất sẽ quay về màn hình auth.
 */

import React from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileOverviewContent } from '@/app/profile-overview';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLoggedOut = async () => {
    await logout();
    router.replace('/auth');
  };

  return (
    <ProfileOverviewContent
      embeddedInTab
      onLoggedOut={handleLoggedOut}
    />
  );
}
