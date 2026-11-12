import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useCampaignStore } from '../../stores';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';

function formatCurrency(n: number) { return `\$${n.toLocaleString()}`; }
function formatNumber(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

export default function CampaignDetailDashboard() {
  const router = useRouter();
  const campaign = useCampaignStore((s) => s.getCampaignById('c1'));

  if (!campaign) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>No campaign selected</Text>
      </SafeAreaView>
    );
  }

  const progress = Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100);
  const adBudget = campaign.raisedAmount * 0.89;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Dashboard</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={{ uri: campaign.coverImage }} style={styles.thumb} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={2}>{campaign.title}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {campaign.status === 'funding' ? '🟢 Funding' : campaign.status === 'promoting' ? '🚀 Promoting' : campaign.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          {[
            { label: 'Raised', value: formatCurrency(campaign.raisedAmount), color: Colors.primary },
            { label: 'Goal', value: formatCurrency(campaign.targetAmount), color: Colors.text },
            { label: 'Backers', value: campaign.backerCount.toString(), color: Colors.success },
            { label: 'Days Left', value: campaign.daysLeft.toString(), color: Colors.warning },
            { label: 'Ad Budget', value: formatCurrency(adBudget), color: Colors.success },
            { label: 'Est. Reach', value: formatNumber(campaign.reachEstimate), color: Colors.primary },
          ].map((m) => (
            <View key={m.label} style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Funding Progress</Text>
          <View style={styles.bigProgressBar}>
            <View style={[styles.bigProgressFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% funded</Text>
        </View>

        {/* Distribution Metrics (if promoting) */}
        {(campaign.status === 'promoting' || campaign.status === 'completed') && campaign.impressions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Distribution Report</Text>
            <Text style={styles.reportNote}>Verified delivery metrics — not estimates</Text>
            <View style={styles.reportGrid}>
              {[
                { label: 'Impressions', value: formatNumber(campaign.impressions), desc: 'Times your ad was shown' },
                { label: 'Clicks', value: formatNumber(campaign.clicks ?? 0), desc: 'People who clicked' },
                { label: 'CTR', value: `${((campaign.clicks ?? 0) / campaign.impressions * 100).toFixed(2)}%`, desc: 'Click-through rate' },
                { label: 'CPC', value: `\$${(adBudget / (campaign.clicks ?? 1)).toFixed(2)}`, desc: 'Cost per click' },
              ].map((m) => (
                <View key={m.label} style={styles.reportCard}>
                  <Text style={styles.reportValue}>{m.value}</Text>
                  <Text style={styles.reportLabel}>{m.label}</Text>
                  <Text style={styles.reportDesc}>{m.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Lifecycle Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campaign Lifecycle</Text>
          {[
            { label: 'Draft Created', done: true, date: campaign.createdAt },
            { label: 'Submitted for Review', done: !!campaign.submittedAt, date: campaign.submittedAt },
            { label: 'Approved', done: !!campaign.approvedAt, date: campaign.approvedAt },
            { label: 'Funding Active', done: campaign.status === 'funding' || campaign.status === 'promoting' || campaign.status === 'completed' },
            { label: 'Goal Reached', done: campaign.raisedAmount >= campaign.targetAmount },
            { label: 'Promoting', done: campaign.status === 'promoting' || campaign.status === 'completed' },
            { label: 'Completed', done: campaign.status === 'completed' },
          ].map((step, i) => (
            <View key={step.label} style={styles.lifecycleItem}>
              <View style={[styles.lifecycleDot, step.done && styles.lifecycleDotDone]}>
                {step.done && <Text style={styles.lifecycleCheck}>✓</Text>}
              </View>
              <View style={styles.lifecycleInfo}>
                <Text style={[styles.lifecycleLabel, step.done && styles.lifecycleLabelDone]}>{step.label}</Text>
                {step.date && <Text style={styles.lifecycleDate}>{new Date(step.date).toLocaleDateString()}</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionLabel}>Share Campaign Link</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>👁️</Text>
            <Text style={styles.actionLabel}>Preview Campaign Page</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionLabel}>Edit Draft</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionLabel}>Download Full Report</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  emptyText: { fontSize: FontSizes.lg, color: Colors.textSecondary, textAlign: 'center', marginTop: 100 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, backgroundColor: Colors.surfaceSecondary, borderRadius: BorderRadius.full },
  backBtnText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text },
  topBarTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text },

  content: { padding: Spacing.lg, paddingBottom: 48 },

  header: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  thumb: { width: 72, height: 72, borderRadius: BorderRadius.lg },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, lineHeight: 22 },
  statusBadge: { marginTop: Spacing.sm },
  statusText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  metricCard: {
    width: '31%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  metricValue: { fontSize: FontSizes.lg, fontWeight: FontWeights.extrabold },
  metricLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 3 },

  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },

  bigProgressBar: { height: 12, backgroundColor: Colors.border, borderRadius: 6, overflow: 'hidden', marginBottom: Spacing.sm },
  bigProgressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 6 },
  progressText: { fontSize: FontSizes.sm, color: Colors.textSecondary },

  reportNote: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: Spacing.md },
  reportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  reportCard: { width: '48%', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, ...Shadows.sm },
  reportValue: { fontSize: FontSizes.xl, fontWeight: FontWeights.extrabold, color: Colors.primary },
  reportLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text, marginTop: 4 },
  reportDesc: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  lifecycleItem: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' },
  lifecycleDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface },
  lifecycleDotDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  lifecycleCheck: { fontSize: 12, color: Colors.textOnPrimary, fontWeight: FontWeights.bold },
  lifecycleInfo: { flex: 1 },
  lifecycleLabel: { fontSize: FontSizes.md, color: Colors.textTertiary, fontWeight: FontWeights.medium },
  lifecycleLabelDone: { color: Colors.text, fontWeight: FontWeights.semibold },
  lifecycleDate: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  actionsSection: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.sm },
  actionItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.md },
  actionIcon: { fontSize: 20, width: 28 },
  actionLabel: { flex: 1, fontSize: FontSizes.md, color: Colors.text, fontWeight: FontWeights.medium },
  actionArrow: { fontSize: 16, color: Colors.textTertiary },
});
