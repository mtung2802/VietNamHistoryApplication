import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import {
  clearUserSession,
  getUserSession,
  saveUserSession,
  SessionUser,
} from '@/services/userSession';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { AppHeader, Screen } from '@/components/ui';

interface MenuItemProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  danger?: boolean;
  onPress: () => void;
}

interface ProfileOverviewProps {
  embeddedInTab?: boolean;
  onLoggedOut?: () => void;
}

export function ProfileOverviewContent({
  embeddedInTab = false,
  onLoggedOut,
}: ProfileOverviewProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadUser = async () => {
        try {
          setLoading(true);
          const session = await getUserSession();
          if (!session) {
            if (embeddedInTab) {
              onLoggedOut?.();
            } else {
              router.replace('/auth');
            }
            return;
          }

          if (active) setUser(session);
          const snapshot = await getDoc(doc(db, 'users', session.id));
          const remoteData = snapshot.exists() ? snapshot.data() : {};
          const resolvedAvatar =
            typeof remoteData.avatar === 'string' && remoteData.avatar
              ? remoteData.avatar
              : typeof remoteData.photo === 'string' && remoteData.photo
                ? remoteData.photo
                : session.avatar || session.photo;
          const mergedUser: SessionUser = {
            ...session,
            ...remoteData,
            id: session.id,
            name:
              typeof remoteData.name === 'string'
                ? remoteData.name
                : typeof remoteData.displayName === 'string'
                  ? remoteData.displayName
                  : session.name,
            avatar: resolvedAvatar,
            photo: resolvedAvatar ? undefined : session.photo,
          };

          await saveUserSession(mergedUser);
          if (active) setUser(mergedUser);
        } catch (error) {
          console.error('Unable to load profile:', error);
          if (active) Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ.');
        } finally {
          if (active) setLoading(false);
        }
      };

      loadUser();
      return () => {
        active = false;
      };
    }, [router]),
  );

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await clearUserSession();
          if (embeddedInTab) {
            onLoggedOut?.();
          } else {
            router.replace('/auth');
          }
        },
      },
    ]);
  };

  const MenuItem = ({ icon, label, danger, onPress }: MenuItemProps) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.menuIcon,
          { backgroundColor: danger ? `${colors.error}18` : colors.primaryDim },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={danger ? colors.error : colors.primary}
        />
      </View>
      <Text style={[styles.menuLabel, { color: danger ? colors.error : colors.text }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  const avatarUri = user?.avatar || user?.photo;
  const displayName = user?.name || user?.displayName || user?.username || 'Người dùng';

  return (
    <Screen>
      <AppHeader title="Hồ sơ" showBack={false} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View
              style={[
                styles.avatarFrame,
                { borderColor: colors.primary, backgroundColor: colors.surface },
              ]}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={52} color={colors.textMuted} />
              )}
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
            {!!user?.username && (
              <Text style={[styles.username, { color: colors.textSecondary }]}>
                @{user.username}
              </Text>
            )}
            {!!user?.email && (
              <Text style={[styles.email, { color: colors.textMuted }]}>{user.email}</Text>
            )}
            {!!user?.bio && (
              <Text style={[styles.bio, { color: colors.textSecondary }]}>{user.bio}</Text>
            )}
          </View>

          <View style={styles.menuSection}>
            <MenuItem
              icon="create-outline"
              label="Chỉnh sửa hồ sơ"
              onPress={() => router.push('/edit-profile')}
            />
            <MenuItem
              icon="log-out-outline"
              label="Đăng xuất"
              danger
              onPress={handleLogout}
            />
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

export default function ProfileOverviewScreen() {
  return <ProfileOverviewContent />;
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: SPACING[5], paddingBottom: SPACING[10] },
  profileSection: { alignItems: 'center' },
  avatarFrame: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  avatar: { width: '100%', height: '100%' },
  userName: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: SPACING[4],
    textAlign: 'center',
  },
  username: { fontSize: FONT_SIZES.sm, marginTop: 3 },
  email: { fontSize: FONT_SIZES.sm, marginTop: 3 },
  bio: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: SPACING[3],
    maxWidth: 320,
  },
  menuSection: { gap: SPACING[3], marginTop: SPACING[6] },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING[3],
    ...SHADOWS.sm,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    marginLeft: SPACING[3],
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
