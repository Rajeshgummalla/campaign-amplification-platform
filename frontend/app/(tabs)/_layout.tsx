import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, FontSizes, FontWeights, Shadows } from '../../constants/theme';
import { useNotificationStore } from '../../stores';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, { active: string; inactive: string }> = {
    home: { active: '🏠', inactive: '🏠' },
    explore: { active: '🔍', inactive: '🔍' },
    create: { active: '✚', inactive: '✚' },
    activity: { active: '🔔', inactive: '🔔' },
    profile: { active: '👤', inactive: '👤' },
  };
  const icon = icons[name] ?? { active: '●', inactive: '○' };

  if (name === 'create') {
    return (
      <View style={styles.createTab}>
        <Text style={styles.createIcon}>{icon.active}</Text>
      </View>
    );
  }

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>{focused ? icon.active : icon.inactive}</Text>
    </View>
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
  );
}

export default function TabsLayout() {
  const unread = useNotificationStore((s) => s.unreadCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => <TabIcon name="explore" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused }) => <TabIcon name="create" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ focused }) => <TabIcon name="activity" focused={focused} />,
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    ...Shadows.md,
  },
  tabLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
  createTab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    ...Shadows.md,
  },
  createIcon: {
    fontSize: 20,
    color: Colors.textOnPrimary,
    fontWeight: FontWeights.bold,
  },
  label: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
  },
  labelFocused: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  badge: {
    backgroundColor: Colors.error,
    fontSize: 10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
  },
});
