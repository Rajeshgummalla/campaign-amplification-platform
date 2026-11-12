import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNotificationStore } from '../../stores';
import { Notification } from '../../data/types';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';

const NOTIFICATION_ICONS: Record<string, string> = {
  campaign_submitted: '📤',
  campaign_approved: '✅',
  campaign_rejected: '❌',
  campaign_changes_requested: '📝',
  funding_milestone: '🎉',
  deadline_approaching: '⏰',
  contribution_confirmed: '💳',
  contribution_failed: '⚠️',
  campaign_promoting: '🚀',
  campaign_completed: '🏁',
  report_available: '📊',
  security_event: '🔐',
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function NotificationItem({ item, onPress, onRead }: { item: Notification; onPress: () => void; onRead: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.notifCard, !item.read && styles.notifUnread]}
      onPress={() => { onRead(); onPress(); }}
      activeOpacity={0.85}
    >
      <View style={[styles.notifIcon, !item.read && styles.notifIconUnread]}>
        <Text style={styles.notifIconText}>{NOTIFICATION_ICONS[item.type] ?? '🔔'}</Text>
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>{item.title}</Text>
        <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.notifTime}>{timeAgo(item.timestamp)}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function ActivityScreen() {
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore();

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        You'll see campaign updates, funding milestones, and activity here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Activity</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['All', 'Campaigns', 'Contributions', 'Updates'].map((tab, i) => (
          <TouchableOpacity key={tab} style={[styles.tab, i === 0 && styles.tabActive]}>
            <Text style={[styles.tabText, i === 0 && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            onRead={() => markRead(item.id)}
            onPress={() => {
              if (item.campaignId) router.push(`/campaign/${item.campaignId}`);
            }}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: FontWeights.extrabold, color: Colors.text },
  headerSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  markAllRead: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold },

  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: FontWeights.medium },
  tabTextActive: { color: Colors.primary, fontWeight: FontWeights.bold },

  listContent: { padding: Spacing.lg, paddingBottom: 32 },
  separator: { height: Spacing.sm },

  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
    position: 'relative',
  },
  notifUnread: {
    backgroundColor: Colors.primaryLight + '0C',
    borderWidth: 1,
    borderColor: Colors.primaryLight + '40',
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  notifIconUnread: { backgroundColor: Colors.primaryLight + '20' },
  notifIconText: { fontSize: 22 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: 3 },
  notifTitleUnread: { fontWeight: FontWeights.bold, color: Colors.text },
  notifMessage: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 18 },
  notifTime: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginTop: 5 },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },

  emptyState: { alignItems: 'center', paddingVertical: 64 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.lg },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.sm },
  emptySubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.xl },
});
