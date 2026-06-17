import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loginWithUsername, register, resetPassword } from '@/services/authService';
import { getUserById } from '@/services/userService';
import { getUserSession, saveUserSession, SessionUser } from '@/services/userSession';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { Screen, AppHeader, Button } from '@/components/ui';
import { ProfileOverviewContent } from '@/app/profile-overview';

type Mode = 'login' | 'register' | 'forgot';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setSessionLoading(true);
      getUserSession()
        .then((user) => {
          if (active) setIsLoggedIn(!!user);
        })
        .finally(() => {
          if (active) setSessionLoading(false);
        });

      return () => {
        active = false;
      };
    }, [router]),
  );

  const clearForm = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = (newMode: Mode) => {
    clearForm();
    setMode(newMode);
  };

  /* ────── Đăng nhập ────── */
  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      const firebaseUser = await loginWithUsername(trimmedEmail, password);

      // Lấy thông tin user từ Firestore
      const userData = await getUserById(firebaseUser.uid);

      const session: SessionUser = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email || trimmedEmail,
        username: userData?.username || '',
        name: userData?.displayName || '',
        displayName: userData?.displayName || '',
        avatar: userData?.avatar || '',
        photo: userData?.avatar || '',
      };

      await saveUserSession(session);
      setIsLoggedIn(true);
      clearForm();
      router.replace('/(tabs)/period');
    } catch (error: unknown) {
      console.error('Login failed:', error);
      const code = (error as { code?: string })?.code;
      let message = 'Đăng nhập thất bại. Vui lòng thử lại.';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        message = 'Email hoặc mật khẩu không đúng';
      } else if (code === 'auth/invalid-email') {
        message = 'Địa chỉ email không hợp lệ';
      } else if (code === 'auth/too-many-requests') {
        message = 'Quá nhiều lần thử. Vui lòng thử lại sau.';
      }
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  /* ────── Đăng ký ────── */
  const handleRegister = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim();

    if (!trimmedEmail || !trimmedUsername || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      await register({
        email: trimmedEmail,
        password,
        username: trimmedUsername,
      });

      Alert.alert(
        'Đăng ký thành công! 🎉',
        'Tài khoản đã được tạo. Vui lòng đăng nhập để tiếp tục.',
        [{ text: 'Đăng nhập ngay', onPress: () => switchMode('login') }],
      );
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      const code = (error as { code?: string })?.code;
      let message = 'Đăng ký thất bại. Vui lòng thử lại.';
      if (code === 'auth/email-already-in-use') {
        message = 'Email này đã được sử dụng';
      } else if (code === 'auth/invalid-email') {
        message = 'Địa chỉ email không hợp lệ';
      } else if (code === 'auth/weak-password') {
        message = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.';
      }
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  /* ────── Quên mật khẩu ────── */
  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(trimmedEmail);
      Alert.alert(
        'Thành công',
        'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư rác).',
        [{ text: 'OK', onPress: () => switchMode('login') }],
      );
    } catch (error: unknown) {
      console.error('Reset password failed:', error);
      const code = (error as { code?: string })?.code;
      let message = 'Gửi email thất bại. Vui lòng thử lại.';
      if (code === 'auth/user-not-found') {
        message = 'Không tìm thấy tài khoản với email này';
      } else if (code === 'auth/invalid-email') {
        message = 'Địa chỉ email không hợp lệ';
      } else if (code === 'auth/too-many-requests') {
        message = 'Quá nhiều lần thử. Vui lòng thử lại sau.';
      }
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  /* ────── Styles ────── */
  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.text,
    },
  ];

  /* ────── Loading session ────── */
  if (sessionLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  /* ────── Đã đăng nhập ────── */
  if (isLoggedIn) {
    return (
      <ProfileOverviewContent
        embeddedInTab
        onLoggedOut={() => setIsLoggedIn(false)}
      />
    );
  }

  /* ────── Render Form ────── */
  return (
    <Screen>
      <AppHeader title="Hồ sơ" showBack={false} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <View style={styles.hero}>
            <View
              style={[
                styles.logoCircle,
                { backgroundColor: colors.primaryDim, borderColor: colors.primary },
              ]}
            >
              <Ionicons
                name={mode === 'forgot' ? 'key' : 'flag'}
                size={40}
                color={colors.secondary}
              />
            </View>
            <Text style={[styles.appName, { color: colors.primary }]}>Lịch Sử Việt Nam</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              {mode === 'login'
                ? 'Đăng nhập để tiếp tục'
                : mode === 'register'
                  ? 'Tạo tài khoản mới'
                  : 'Khôi phục mật khẩu'}
            </Text>
          </View>

          {/* Tab Login / Register (ẩn khi ở mode forgot) */}
          {mode !== 'forgot' && (
            <View
              style={[
                styles.tabRow,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {(['login', 'register'] as Mode[]).map((item) => {
                const active = mode === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.tab,
                      { backgroundColor: active ? colors.primary : 'transparent' },
                    ]}
                    onPress={() => switchMode(item)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        { color: active ? colors.onPrimary : colors.textSecondary },
                      ]}
                    >
                      {item === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* === MODE: LOGIN === */}
            {mode === 'login' && (
              <>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[inputStyle, styles.inputWithIcon]}
                    placeholder="Email"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[inputStyle, styles.inputWithIcon]}
                    placeholder="Mật khẩu"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => switchMode('forgot')}
                  style={styles.forgotLink}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.linkText, { color: colors.primary }]}>
                    Quên mật khẩu?
                  </Text>
                </TouchableOpacity>

                <Button
                  label="Đăng nhập"
                  icon="log-in-outline"
                  loading={loading}
                  onPress={handleLogin}
                  size="lg"
                  style={{ marginTop: SPACING[1] }}
                />
              </>
            )}

            {/* === MODE: REGISTER === */}
            {mode === 'register' && (
              <>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[inputStyle, styles.inputWithIcon]}
                    placeholder="Email"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[inputStyle, styles.inputWithIcon]}
                    placeholder="Tên đăng nhập"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[inputStyle, styles.inputWithIcon]}
                    placeholder="Mật khẩu"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[inputStyle, styles.inputWithIcon]}
                    placeholder="Xác nhận mật khẩu"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                <Button
                  label="Đăng ký"
                  icon="person-add-outline"
                  loading={loading}
                  onPress={handleRegister}
                  size="lg"
                  style={{ marginTop: SPACING[2] }}
                />
              </>
            )}

            {/* === MODE: FORGOT PASSWORD === */}
            {mode === 'forgot' && (
              <>
                <Text style={[styles.forgotDesc, { color: colors.textSecondary }]}>
                  Nhập email bạn đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu về hộp thư
                  của bạn.
                </Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[inputStyle, styles.inputWithIcon]}
                    placeholder="Email"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <Button
                  label="Gửi email đặt lại mật khẩu"
                  icon="send-outline"
                  loading={loading}
                  onPress={handleForgotPassword}
                  size="lg"
                  style={{ marginTop: SPACING[2] }}
                />

                <TouchableOpacity
                  onPress={() => switchMode('login')}
                  style={styles.backLink}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={16} color={colors.primary} />
                  <Text style={[styles.linkText, { color: colors.primary, marginLeft: 4 }]}>
                    Quay lại đăng nhập
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, paddingBottom: SPACING[8] },
  hero: { alignItems: 'center', paddingTop: SPACING[6], paddingBottom: SPACING[5] },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: SPACING[3],
  },
  appName: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.3,
  },
  tagline: { fontSize: FONT_SIZES.sm, marginTop: 4 },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING[5],
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
  },
  tabText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },
  form: { padding: SPACING[5], gap: SPACING[3] },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: SPACING[3],
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: SPACING[3] + 28,
  },
  eyeIcon: {
    position: 'absolute',
    right: SPACING[3],
    zIndex: 1,
  },
  input: {
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING[4],
    paddingVertical: 14,
    fontSize: FONT_SIZES.base,
    borderWidth: 1,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
  },
  linkText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  forgotDesc: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: SPACING[2],
    paddingHorizontal: SPACING[2],
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[2],
    marginTop: SPACING[1],
  },
});
