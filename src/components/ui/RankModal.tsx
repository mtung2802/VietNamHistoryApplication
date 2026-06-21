import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { RANK_TIERS } from '@/services/rankService';

interface RankModalProps {
  visible: boolean;
  currentRankName: string | null;
  onClose: () => void;
}

export function RankModal({ visible, currentRankName, onClose }: RankModalProps) {
  const colors = useThemeColors();

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

          <Text style={[styles.title, { color: colors.text }]}>Hệ Thống Xếp Hạng</Text>

          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {RANK_TIERS.map((tier) => {
              const isCurrent = tier.name === currentRankName;
              return (
                <View
                  key={tier.name}
                  style={[
                    styles.rankRow,
                    {
                      backgroundColor: isCurrent ? `${tier.color}15` : colors.background,
                      borderColor: isCurrent ? tier.color : colors.border,
                      borderWidth: isCurrent ? 2 : 1,
                    }
                  ]}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: `${tier.color}22` }]}>
                    <Ionicons name={tier.icon as any} size={24} color={tier.color} />
                  </View>
                  <View style={styles.rankInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.rankName, { color: colors.text }]}>{tier.name}</Text>
                      {isCurrent && (
                        <View style={[styles.currentBadge, { backgroundColor: tier.color }]}>
                          <Text style={styles.currentBadgeText}>You</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.xpText, { color: colors.textSecondary }]}>
                      {tier.maxXP === Infinity ? `${tier.minXP}+ XP` : `${tier.minXP} - ${tier.maxXP} XP`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
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
    maxWidth: 360,
    maxHeight: '80%',
    borderRadius: BORDER_RADIUS['2xl'],
    paddingTop: SPACING[6],
    paddingBottom: SPACING[4],
    paddingHorizontal: SPACING[4],
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING[4],
    right: SPACING[4],
    padding: SPACING[1],
    zIndex: 10,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING[5],
  },
  listContainer: {
    width: '100%',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING[3],
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[3],
  },
  rankInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  rankName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
  currentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFF',
  },
  xpText: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
});
