/**
 * Tab Hồ sơ – Hiển thị profile gamification.
 * Khi đăng xuất sẽ quay về màn hình auth.
 */

import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import { ProfileOverviewContent } from '@/app/profile-overview';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { fetchProfile } = useGamification();

  // Auto-fetch gamification profile khi tab focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchProfile(user.id);
      }
    }, [user?.id, fetchProfile]),
  );

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
