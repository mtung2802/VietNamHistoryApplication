import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { BadgeDefinition } from '@/models/GamificationModels';

export interface BadgeModalData extends BadgeDefinition {
  isEarned: boolean;
  earnedAt?: Date;
}

interface BadgeModalProps {
  visible: boolean;
  badge: BadgeModalData | null;
  onClose: () => void;
}

export function BadgeModal({ visible, badge, onClose }: BadgeModalProps) {
  const colors = useThemeColors();

  if (!badge) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[styles.modalCard, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Nút đóng */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Icon lớn */}
          <View
            style={[
              styles.iconWrapper,
              { 
                backgroundColor: badge.isEarned ? colors.primaryDim : colors.background,
                borderColor: badge.isEarned ? colors.primary : colors.border,
              }
            ]}
          >
            <Ionicons 
              name={badge.icon as any} 
              size={56} 
              color={badge.isEarned ? colors.primary : colors.textMuted} 
            />
            {!badge.isEarned && (
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={14} color="#FFF" />
              </View>
            )}
          </View>

          {/* Thông tin Huy hiệu */}
          <Text style={[styles.title, { color: colors.text }]}>{badge.name}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {badge.description}
          </Text>

          {/* Trạng thái */}
          <View 
            style={[
              styles.statusContainer, 
              { backgroundColor: badge.isEarned ? `${colors.success}15` : `${colors.textMuted}15` }
            ]}
          >
            <Ionicons 
              name={badge.isEarned ? "checkmark-circle" : "information-circle"} 
              size={20} 
              color={badge.isEarned ? colors.success : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.statusText, 
                { color: badge.isEarned ? colors.success : colors.textSecondary }
              ]}
            >
              {badge.isEarned 
                ? `Đã đạt được vào ${badge.earnedAt?.toLocaleDateString('vi-VN')}`
                : 'Chưa đạt được huy hiệu này'}
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[4],
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING[6],
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING[4],
    right: SPACING[4],
    padding: SPACING[1],
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[5],
    marginTop: SPACING[2],
  },
  lockBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#666',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    marginBottom: SPACING[2],
  },
  description: {
    fontSize: FONT_SIZES.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING[6],
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
