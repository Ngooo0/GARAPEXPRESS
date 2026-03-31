import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../src/constants/theme';
import { useAppStore } from '../src/store/appStore';
import { formatTime } from '../src/utils/formatters';

const typeIcons: Record<string, string> = {
  order: 'receipt',
  promo: 'pricetag',
  alert: 'warning',
  system: 'settings',
};

const typeColors: Record<string, string> = {
  order: colors.primary,
  promo: '#8B5CF6',
  alert: colors.warning,
  system: colors.textSecondary,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, loadingStates, errors, fetchNotifications } = useAppStore();
  const isLoading = loadingStates.notification;
  
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  if (isLoading && notifications.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (errors.notification) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text, marginLeft: spacing.sm }}>Notifications</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.warning} />
          <Text style={{ color: colors.text, marginTop: spacing.md }}>{errors.notification}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text, marginLeft: spacing.sm }}>Notifications</Text>
        </View>
        <TouchableOpacity>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Tout marquer lu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.lg }} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.xl }}>
            <Ionicons name="notifications-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textSecondary, marginTop: spacing.md }}>Aucune notification</Text>
          </View>
        ) : (
          <View style={{ gap: spacing.sm, paddingBottom: spacing.xl }}>
            {notifications.map((notification) => (
              <View 
                key={notification.id}
                style={{ 
                  backgroundColor: notification.lu ? colors.background : colors.card, 
                  borderRadius: borderRadius.xl, 
                  padding: spacing.md, 
                  borderWidth: 1, 
                  borderColor: notification.lu ? 'transparent' : colors.border 
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: typeColors[notification.type] + '20', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name={typeIcons[notification.type] as any} size={20} color={typeColors[notification.type]} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.text }}>Notification</Text>
                      {!notification.lu && (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
                      )}
                    </View>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 }}>{notification.message}</Text>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.sm }}>
                      {formatTime(notification.dateEnvoi)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
