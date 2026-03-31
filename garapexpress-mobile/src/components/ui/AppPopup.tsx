import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../constants/theme';

type PopupVariant = 'success' | 'error' | 'info';

interface AppPopupProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: PopupVariant;
  buttonLabel?: string;
  secondaryButtonLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onClose: () => void;
}

const popupConfig: Record<PopupVariant, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  success: { icon: 'checkmark-circle', color: '#127b05' },
  error: { icon: 'alert-circle', color: '#127b05' },
  info: { icon: 'information-circle', color: colors.primary },
};

export default function AppPopup({
  visible,
  title,
  message,
  variant = 'info',
  buttonLabel = 'OK',
  secondaryButtonLabel,
  onPrimaryAction,
  onSecondaryAction,
  onClose,
}: AppPopupProps) {
  const config = popupConfig[variant];
  const handlePrimaryAction = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
      return;
    }
    onClose();
  };

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
      return;
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: config.color + '18' }]}>
            <Ionicons name={config.icon} size={34} color={config.color} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            {secondaryButtonLabel ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleSecondaryAction}>
                <Text style={styles.secondaryButtonText}>{secondaryButtonLabel}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={[styles.button, { backgroundColor: config.color }]} onPress={handlePrimaryAction}>
              <Text style={styles.buttonText}>{buttonLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    marginTop: spacing.lg,
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    minWidth: 140,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
