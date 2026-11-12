import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, useCampaignStore } from '../../stores';
import Button from '../../components/Button';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';

const STATUS_COLORS: Record<string, string> = {
  draft: Colors.textSecondary,
  submitted: Colors.warning,
  under_review: Colors.warning,
  approved: Colors.success,
  funding: Colors.primary,
  promoting: Colors.secondary,
  completed: Colors.textSecondary,
  rejected: Colors.error,
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  funding: 'Funding',
  promoting: 'Promoting',
  completed: 'Completed',
  rejected: 'Rejected',
};

function formatCurrency(n: number) {
  return `$${n.toLocaleString()}`;
}

interface PendingReviewItem {
  id: string;
  title: string;
  creator: string;
  category: string;
  submittedAt: string;
  targetAmount: number;
  reachEstimate: number;
  sourcesCount: number;
  status: 'under_review' | 'approved' | 'changes_requested';
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoggedIn, loginAsRole, logout, backedCampaigns } = useAuthStore();
  const { drafts, getCampaignById, campaigns } = useCampaignStore();

  const [activeTab, setActiveTab] = useState(0);

  // Dynamic state for Admin review moderation
  const [pendingReviews, setPendingReviews] = useState<PendingReviewItem[]>([
    {
      id: 'pr-1',
      title: 'Clean Water Infrastructure for Rural Communities',
      creator: 'Clean Water Coalition',
      category: 'Community',
      submittedAt: 'Today at 09:15 AM',
      targetAmount: 18000,
      reachEstimate: 1800000,
      sourcesCount: 3,
      status: 'under_review',
    },
    {
      id: 'pr-2',
      title: 'Digital Privacy Curriculum for Public High Schools',
      creator: 'Open Tech Foundation',
      category: 'Education',
      submittedAt: 'Yesterday at 4:30 PM',
      targetAmount: 12000,
      reachEstimate: 1200000,
      sourcesCount: 2,
      status: 'under_review',
    },
  ]);

  const createdCampaigns = useMemo(
    () => campaigns.filter((c) => c.id === 'c5'),
    [campaigns]
  );
  const progress1 =
    (createdCampaigns[0]?.raisedAmount ?? 0) /
    (createdCampaigns[0]?.targetAmount ?? 1);

  const handleApprove = (id: string, title: string) => {
    setPendingReviews((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item))
    );
  };

  const handleRequestChanges = (id: string, title: string) => {
    setPendingReviews((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'changes_requested' } : item
      )
    );
  };

  if (!isLoggedIn || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <Text style={styles.authIcon}>👤</Text>
          <Text style={styles.authTitle}>Sign in to your account</Text>
          <Text style={styles.authSubtitle}>
            Experience real-time role profiles: Administrator, Verified Creator, or Community Backer.
          </Text>
          <Button
            label="Sign In / Choose Persona"
            onPress={() => router.push('/auth/login')}
            fullWidth
            style={styles.authBtn}
          />
          <Button
            label="Create Account"
            variant="outline"
            onPress={() => router.push('/auth/signup')}
            fullWidth
            style={styles.authBtn}
          />

          <View style={styles.quickLoginSection}>
            <Text style={styles.quickLoginTitle}>Quick 1-Tap Login as:</Text>
            <View style={styles.quickPillsRow}>
              <TouchableOpacity
                style={[styles.quickPill, { borderColor: '#8B5CF6' }]}
                onPress={() => loginAsRole('admin')}
              >
                <Text style={styles.quickPillText}>🛡️ Admin (Nani)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickPill, { borderColor: '#10B981' }]}
                onPress={() => loginAsRole('user')}
              >
                <Text style={styles.quickPillText}>👤 User (Alex)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Determine role-specific properties (only User and Admin)
  const role = user.role || 'user';
  const isAdmin = role === 'admin';

  // Role-specific tabs
  const tabs = isAdmin
    ? ['Review Queue', 'All Campaigns', 'Backed Causes']
    : ['Backed Causes', 'Created Campaigns', 'My Impact'];

  const pendingCount = pendingReviews.filter((p) => p.status === 'under_review').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Role Switcher Toolbar */}
        <View style={styles.roleSwitcherBar}>
          <Text style={styles.roleSwitcherTitle}>Switch Active Role:</Text>
          <View style={styles.rolePillsGroup}>
            <TouchableOpacity
              style={[
                styles.rolePillBtn,
                isAdmin && styles.rolePillBtnActiveAdmin,
              ]}
              onPress={() => {
                loginAsRole('admin');
                setActiveTab(0);
              }}
            >
              <Text
                style={[
                  styles.rolePillBtnText,
                  isAdmin && styles.rolePillBtnTextActive,
                ]}
              >
                🛡️ Admin (Nani)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.rolePillBtn,
                !isAdmin && styles.rolePillBtnActiveBacker,
              ]}
              onPress={() => {
                loginAsRole('user');
                setActiveTab(0);
              }}
            >
              <Text
                style={[
                  styles.rolePillBtnText,
                  !isAdmin && styles.rolePillBtnTextActive,
                ]}
              >
                👤 User (Alex)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card Header */}
        <View style={[
          styles.profileHeader,
          isAdmin ? styles.adminHeaderBorder : styles.backerHeaderBorder,
        ]}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={[
              styles.roleBadgeIcon,
              isAdmin ? { backgroundColor: '#8B5CF6' } : { backgroundColor: '#10B981' },
            ]}>
              <Text style={styles.roleBadgeEmoji}>
                {isAdmin ? '🛡️' : '👤'}
              </Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{user.name}</Text>
            </View>

            {/* Role Banner Badge */}
            <View style={[
              styles.rolePillTag,
              isAdmin ? { backgroundColor: '#8B5CF618' } : { backgroundColor: '#10B98118' },
            ]}>
              <Text style={[
                styles.rolePillTagText,
                isAdmin ? { color: '#8B5CF6' } : { color: '#10B981' },
              ]}>
                {isAdmin
                  ? '🛡️ Platform Reviewer & Administrator'
                  : '👤 Verified User & Community Backer'}
              </Text>
            </View>

            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profileBio}>{user.bio}</Text>
          </View>
        </View>

        {/* Role-Specific Stats Row */}
        <View style={styles.statsRow}>
          {isAdmin ? (
            <>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#8B5CF6' }]}>
                  {user.adminStats?.reviewedCount ?? 48}
                </Text>
                <Text style={styles.statLabel}>Reviewed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.warning }]}>
                  {pendingCount}
                </Text>
                <Text style={styles.statLabel}>Pending Queue</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.success }]}>
                  {user.adminStats?.approvedCount ?? 42}
                </Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.backedCount}</Text>
                <Text style={styles.statLabel}>Backed</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#10B981' }]}>
                  {user.backedCount}
                </Text>
                <Text style={styles.statLabel}>Backed Causes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatCurrency(user.totalContributed)}
                </Text>
                <Text style={styles.statLabel}>Contributed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.primary }]}>
                  ~34.2K
                </Text>
                <Text style={styles.statLabel}>People Reached</Text>
              </View>
            </>
          )}
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabs}>
          {tabs.map((tab, i) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === i && (isAdmin ? styles.tabActiveAdmin : styles.tabActiveBacker),
              ]}
              onPress={() => setActiveTab(i)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === i && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── ADMIN VIEW: TAB 0 (Review Queue) ─── */}
        {isAdmin && activeTab === 0 && (
          <View style={styles.tabContent}>
            <View style={styles.adminQueueBanner}>
              <Text style={styles.adminQueueBannerTitle}>
                🛡️ Platform Integrity & Content Verification
              </Text>
              <Text style={styles.adminQueueBannerText}>
                Logged in as Admin ({user.email}). You have full authority to approve, request revisions, or audit public causes before promotion.
              </Text>
            </View>

            {pendingReviews.map((item) => (
              <View key={item.id} style={styles.reviewItemCard}>
                <View style={styles.reviewItemHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewItemTitle}>{item.title}</Text>
                    <Text style={styles.reviewItemMeta}>
                      Submitted by {item.creator} · {item.submittedAt}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor:
                          item.status === 'approved'
                            ? Colors.successLight
                            : item.status === 'changes_requested'
                            ? Colors.errorLight
                            : Colors.warningLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        {
                          color:
                            item.status === 'approved'
                              ? Colors.success
                              : item.status === 'changes_requested'
                              ? Colors.error
                              : Colors.warning,
                        },
                      ]}
                    >
                      {item.status === 'approved'
                        ? 'Approved ✓'
                        : item.status === 'changes_requested'
                        ? 'Changes Requested'
                        : 'Under Review'}
                    </Text>
                  </View>
                </View>

                {/* Details bar */}
                <View style={styles.reviewDetailsRow}>
                  <Text style={styles.reviewDetailPill}>
                    🎯 Target: {formatCurrency(item.targetAmount)}
                  </Text>
                  <Text style={styles.reviewDetailPill}>
                    📣 Est. Reach: {item.reachEstimate.toLocaleString()}
                  </Text>
                  <Text style={styles.reviewDetailPill}>
                    📚 {item.sourcesCount} Verified Sources
                  </Text>
                </View>

                {/* Moderation Controls */}
                {item.status === 'under_review' ? (
                  <View style={styles.reviewActionsRow}>
                    <TouchableOpacity
                      style={[styles.reviewBtn, styles.approveBtn]}
                      onPress={() => handleApprove(item.id, item.title)}
                    >
                      <Text style={styles.approveBtnText}>✓ Approve Campaign</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reviewBtn, styles.rejectBtn]}
                      onPress={() => handleRequestChanges(item.id, item.title)}
                    >
                      <Text style={styles.rejectBtnText}>✎ Request Changes</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.decisionNote}>
                    <Text style={styles.decisionNoteText}>
                      {item.status === 'approved'
                        ? '✅ You verified and approved this campaign for public funding.'
                        : '⚠️ Changes requested. The creator has been notified with feedback.'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ─── USER VIEW: TAB 0 (Backed Causes) or ADMIN VIEW: TAB 2 ─── */}
        {((!isAdmin && activeTab === 0) || (isAdmin && activeTab === 2)) && (
          <View style={styles.tabContent}>
            {backedCampaigns.length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyTabIcon}>💳</Text>
                <Text style={styles.emptyTabText}>No backed campaigns yet</Text>
                <Button label="Explore Campaigns" variant="outline" onPress={() => router.push('/explore')} />
              </View>
            ) : (
              backedCampaigns.map((record) => (
                <TouchableOpacity
                  key={record.id}
                  style={styles.campaignItem}
                  onPress={() => router.push(`/campaign/${record.campaignId}`)}
                >
                  <Image source={{ uri: record.campaignImage }} style={styles.campaignThumbImg} />
                  <View style={styles.campaignItemInfo}>
                    <Text style={styles.campaignItemTitle} numberOfLines={1}>{record.campaignTitle}</Text>
                    <Text style={styles.backingAmount}>
                      {formatCurrency(record.amount)} contributed to ad reach
                    </Text>
                    <Text style={styles.backingReach}>
                      ~{record.estimatedReach.toLocaleString()} people reached
                    </Text>
                  </View>
                  <View style={[styles.statusChip, { backgroundColor: Colors.successLight }]}>
                    <Text style={[styles.statusChipText, { color: Colors.success }]}>
                      {record.status === 'confirmed' ? 'Active Reach' : record.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* ─── USER VIEW: TAB 1 (Created Campaigns & Drafts) ─── */}
        {!isAdmin && activeTab === 1 && (
          <View style={styles.tabContent}>
            {/* Drafts */}
            {drafts.map((draft) => (
              <TouchableOpacity
                key={draft.id}
                style={styles.campaignItem}
                onPress={() => router.push(`/create/step${draft.currentStep}` as any)}
              >
                <View style={styles.campaignThumb}>
                  <Text style={styles.campaignThumbText}>📄</Text>
                </View>
                <View style={styles.campaignItemInfo}>
                  <Text style={styles.campaignItemTitle} numberOfLines={1}>
                    {draft.title || 'Untitled Campaign Draft'}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS['draft'] }]} />
                    <Text style={[styles.statusText, { color: STATUS_COLORS['draft'] }]}>
                      Draft · Step {draft.currentStep}/5
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemArrow}>Resume →</Text>
              </TouchableOpacity>
            ))}

            <Button
              label="+ Start a New Campaign"
              fullWidth
              onPress={() => router.push('/create')}
              style={{ marginTop: Spacing.sm }}
            />
          </View>
        )}

        {/* ─── ADMIN VIEW: TAB 1 (All Platform Campaigns) ─── */}
        {isAdmin && activeTab === 1 && (
          <View style={styles.tabContent}>
            {campaigns.slice(0, 4).map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.campaignItem}
                onPress={() => router.push(`/campaign/${c.id}`)}
              >
                <Image source={{ uri: c.coverImage }} style={styles.campaignThumbImg} />
                <View style={styles.campaignItemInfo}>
                  <Text style={styles.campaignItemTitle} numberOfLines={1}>{c.title}</Text>
                  <Text style={styles.reviewItemMeta}>By {c.creatorName} · {c.category}</Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[c.status] ?? Colors.primary }]} />
                    <Text style={[styles.statusText, { color: STATUS_COLORS[c.status] ?? Colors.primary }]}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemArrow}>Inspect →</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ─── USER VIEW: TAB 2 (My Impact) ─── */}
        {!isAdmin && activeTab === 2 && (
          <View style={styles.tabContent}>
            <View style={styles.impactCard}>
              <Text style={styles.impactTitle}>Your Message Amplification Impact</Text>
              <Text style={styles.impactNumber}>34,200</Text>
              <Text style={styles.impactSubtitle}>
                Estimated people exposed to evidence-based messages from your contributions.
              </Text>
              <View style={styles.impactDistribution}>
                <View style={styles.distRow}>
                  <Text style={styles.distLabel}>Direct Social Media Ads</Text>
                  <Text style={styles.distValue}>65% (22,230)</Text>
                </View>
                <View style={styles.distRow}>
                  <Text style={styles.distLabel}>Search & Intent Ads</Text>
                  <Text style={styles.distValue}>20% (6,840)</Text>
                </View>
                <View style={styles.distRow}>
                  <Text style={styles.distLabel}>Educational Video Distribution</Text>
                  <Text style={styles.distValue}>15% (5,130)</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Account / Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Account & Permissions</Text>
          {[
            { icon: '🛡️', label: `Role: ${isAdmin ? 'Platform Administrator (Admin)' : 'User / Community Backer'}` },
            { icon: '🔔', label: 'Notification Preferences' },
            { icon: '💳', label: 'Payment History & Receipts' },
            { icon: '📜', label: 'Platform Guidelines & Verification Rules' },
            { icon: '❓', label: 'Help & FAQ' },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.settingsItem}>
              <Text style={styles.settingsIcon}>{item.icon}</Text>
              <Text style={styles.settingsLabel}>{item.label}</Text>
              <Text style={styles.settingsArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          label="Sign Out"
          variant="outline"
          onPress={logout}
          fullWidth
          style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 32 },

  authPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  authIcon: { fontSize: 64, marginBottom: Spacing.xl },
  authTitle: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.sm, textAlign: 'center' },
  authSubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22 },
  authBtn: { marginBottom: Spacing.sm },

  quickLoginSection: { marginTop: Spacing.xl, width: '100%', alignItems: 'center' },
  quickLoginTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  quickPillsRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  quickPill: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  quickPillText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: Colors.text },

  // Role Switcher Toolbar
  roleSwitcherBar: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleSwitcherTitle: {
    fontSize: 11,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 4,
  },
  rolePillsGroup: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  rolePillBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rolePillBtnActiveAdmin: {
    backgroundColor: '#8B5CF6',
    borderColor: '#7C3AED',
  },
  rolePillBtnActiveCreator: {
    backgroundColor: '#0284C7',
    borderColor: '#0369A1',
  },
  rolePillBtnActiveBacker: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  rolePillBtnText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  rolePillBtnTextActive: {
    color: '#FFFFFF',
  },

  // Profile Header Card
  profileHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.sm,
  },
  adminHeaderBorder: { borderColor: '#8B5CF640' },
  creatorHeaderBorder: { borderColor: '#0284C740' },
  backerHeaderBorder: { borderColor: '#10B98140' },

  avatarContainer: { position: 'relative' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.surfaceSecondary },
  roleBadgeIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  roleBadgeEmoji: { fontSize: 13 },

  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileName: { fontSize: FontSizes.xl, fontWeight: FontWeights.extrabold, color: Colors.text },

  rolePillTag: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
    marginBottom: 4,
  },
  rolePillTagText: { fontSize: 11, fontWeight: FontWeights.bold },

  profileEmail: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  profileBio: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: Spacing.xs, lineHeight: 16 },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSizes.xl, fontWeight: FontWeights.extrabold, color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 3 },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.md },
  tabActiveAdmin: { backgroundColor: '#8B5CF6' },
  tabActiveCreator: { backgroundColor: '#0284C7' },
  tabActiveBacker: { backgroundColor: '#10B981' },
  tabText: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, color: Colors.textSecondary },
  tabTextActive: { color: '#FFFFFF', fontWeight: FontWeights.bold },

  tabContent: { marginBottom: Spacing.xl },

  // Admin Specific
  adminQueueBanner: {
    backgroundColor: '#8B5CF612',
    borderWidth: 1,
    borderColor: '#8B5CF630',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  adminQueueBannerTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: '#8B5CF6',
    marginBottom: 3,
  },
  adminQueueBannerText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  reviewItemCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  reviewItemTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  reviewItemMeta: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reviewDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  reviewDetailPill: {
    fontSize: 11,
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  reviewActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  reviewBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: Colors.success,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.xs,
  },
  rejectBtn: {
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rejectBtnText: {
    color: Colors.text,
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.xs,
  },
  decisionNote: {
    backgroundColor: Colors.surfaceSecondary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  decisionNoteText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },

  // Impact view
  impactCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  impactTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  impactNumber: {
    fontSize: 36,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
    textAlign: 'center',
    marginVertical: Spacing.sm,
  },
  impactSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  impactDistribution: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
    gap: Spacing.xs,
  },
  distRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  distLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  distValue: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: Colors.text },

  // Campaign items
  campaignItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  campaignThumb: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  campaignThumbText: { fontSize: 24 },
  campaignThumbImg: { width: 56, height: 56, borderRadius: BorderRadius.md, flexShrink: 0 },
  campaignItemInfo: { flex: 1 },
  campaignItemTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  itemArrow: { fontSize: 14, color: Colors.textSecondary, fontWeight: FontWeights.semibold },

  miniProgress: { marginTop: Spacing.sm },
  miniProgressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 3,
  },
  miniProgressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  miniProgressText: { fontSize: FontSizes.xs, color: Colors.textSecondary },

  backingAmount: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.primary, marginTop: 3 },
  backingReach: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  statusChip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    flexShrink: 0,
  },
  statusChipText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },

  emptyTab: { alignItems: 'center', paddingVertical: Spacing.huge, gap: Spacing.md },
  emptyTabIcon: { fontSize: 40 },
  emptyTabText: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.md },

  settingsSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  settingsTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.md,
  },
  settingsIcon: { fontSize: 20, width: 28 },
  settingsLabel: { flex: 1, fontSize: FontSizes.md, color: Colors.text },
  settingsArrow: { fontSize: 20, color: Colors.textTertiary },
});
