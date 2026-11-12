import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  SafeAreaView,
  Dimensions,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCampaignStore } from '../../stores';
import Button from '../../components/Button';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');

function ExpandableSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.expandable}>
      <TouchableOpacity style={styles.expandableHeader} onPress={() => setOpen(!open)}>
        <Text style={styles.expandableTitle}>{title}</Text>
        <Text style={styles.expandableToggle}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && <View style={styles.expandableContent}>{children}</View>}
    </View>
  );
}

function formatCurrency(n: number) {
  if (n >= 1000) return `\$${(n / 1000).toFixed(0)}K`;
  return `\$${n.toLocaleString()}`;
}
function formatNumber(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const campaign = useCampaignStore((s) => s.getCampaignById(id ?? ''));
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!campaign) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundIcon}>🔍</Text>
          <Text style={styles.notFoundText}>Campaign not found</Text>
          <Button label="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const progress = Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100);
  const advertisingBudget = campaign.raisedAmount * (1 - (campaign.platformFeePercent + campaign.processingFeePercent) / 100);

  const handleShare = async () => {
    await Share.share({
      message: `Check out this campaign: "${campaign.title}" — Help amplify this message! `,
      title: campaign.title,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Cover Image */}
        <Image source={{ uri: campaign.coverImage }} style={styles.coverImage} />

        {/* Category & Status */}
        <View style={styles.metaRow}>
          <View style={[styles.categoryBadge, { backgroundColor: campaign.categoryColor + '18', borderColor: campaign.categoryColor + '40' }]}>
            <View style={[styles.categoryDot, { backgroundColor: campaign.categoryColor }]} />
            <Text style={[styles.categoryText, { color: campaign.categoryColor }]}>{campaign.category}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {campaign.status === 'funding' ? '🟢 Funding Now' :
               campaign.status === 'promoting' ? '🚀 Promoting' :
               campaign.status === 'completed' ? '✓ Completed' : campaign.status}
            </Text>
          </View>
        </View>

        {/* Title & Creator */}
        <Text style={styles.title}>{campaign.title}</Text>
        <Text style={styles.creator}>by {campaign.creatorName}</Text>
        <Text style={styles.date}>{new Date(campaign.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>

        {/* Summary */}
        <Text style={styles.summary}>{campaign.summary}</Text>

        {/* Funding Card */}
        <View style={styles.fundingCard}>
          <View style={styles.fundingAmounts}>
            <View>
              <Text style={styles.raisedAmount}>{formatCurrency(campaign.raisedAmount)}</Text>
              <Text style={styles.raisedLabel}>raised of {formatCurrency(campaign.targetAmount)} goal</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.reachAmount}>{formatNumber(campaign.reachEstimate)}</Text>
              <Text style={styles.reachLabel}>est. reach at goal*</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
          </View>
          <View style={styles.fundingMeta}>
            <Text style={styles.fundingMetaText}>{Math.round(progress)}% funded</Text>
            <Text style={styles.fundingMetaText}>{campaign.backerCount.toLocaleString()} backers</Text>
            {campaign.daysLeft > 0 && (
              <Text style={styles.fundingMetaText}>{campaign.daysLeft} days left</Text>
            )}
          </View>
          <Text style={styles.reachNote}>* Estimated reach based on ~{campaign.reachPerDollar} people/dollar. Actual reach varies with ad inventory, targeting, and delivery.</Text>

          <TouchableOpacity
            style={styles.backThisBtn}
            onPress={() => router.push(`/back/${campaign.id}`)}
          >
            <Text style={styles.backThisBtnText}>Back This Campaign</Text>
          </TouchableOpacity>
        </View>

        {/* Story */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The Story</Text>
          <Text style={styles.storyHeadline}>{campaign.adHeadline}</Text>
          {campaign.story.split('\n\n').map((para, i) => (
            <Text key={i} style={styles.storyParagraph}>{para.trim()}</Text>
          ))}
        </View>

        {/* Sources */}
        <ExpandableSection title="📚 Supporting Sources">
          <Text style={styles.sourcesNote}>
            These sources support the claims made in this campaign. The platform has not independently verified their contents.
          </Text>
          {campaign.sources.map((source, i) => (
            <TouchableOpacity
              key={i}
              style={styles.sourceItem}
              onPress={() => Linking.openURL(source.url)}
            >
              <Text style={styles.sourceTitle}>{source.title}</Text>
              <Text style={styles.sourceUrl}>{source.url}</Text>
              <Text style={styles.sourceArrow}>↗</Text>
            </TouchableOpacity>
          ))}
        </ExpandableSection>

        {/* Use of Funds */}
        <ExpandableSection title="💰 How Your Contribution Is Used">
          <View style={styles.fundsNote}>
            <Text style={styles.fundsNoteText}>
              ⚠️ Your contribution pays for <Text style={styles.fundsNoteBold}>advertising distribution</Text> of this campaign message. It does not fund the cause, person, or organization described — it funds reaching a larger audience.
            </Text>
          </View>
          <View style={styles.fundsBreakdown}>
            {[
              { label: 'Ad Distribution Budget', value: `${100 - campaign.platformFeePercent - campaign.processingFeePercent}%`, color: Colors.success },
              { label: 'Platform Fee', value: `${campaign.platformFeePercent}%`, color: Colors.warning },
              { label: 'Payment Processing', value: `${campaign.processingFeePercent}%`, color: Colors.info },
            ].map((item) => (
              <View key={item.label} style={styles.fundsRow}>
                <View style={[styles.fundsDot, { backgroundColor: item.color }]} />
                <Text style={styles.fundsLabel}>{item.label}</Text>
                <Text style={[styles.fundsValue, { color: item.color }]}>{item.value}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.fundsRefund}>
            Refund Policy: If the campaign does not reach its goal and is cancelled, contributions are refunded minus applicable processing fees. Unspent advertising budget is returned to backers on a pro-rata basis.
          </Text>
        </ExpandableSection>

        {/* Audience & Distribution */}
        <ExpandableSection title="🎯 Intended Audience & Distribution">
          <View style={styles.audienceSection}>
            <Text style={styles.audienceLabel}>Target Audience</Text>
            <Text style={styles.audienceValue}>{campaign.targetAudience}</Text>
          </View>
          <View style={styles.audienceSection}>
            <Text style={styles.audienceLabel}>Geographic Focus</Text>
            <Text style={styles.audienceValue}>{campaign.targetLocations.join(', ')}</Text>
          </View>
          <View style={styles.audienceSection}>
            <Text style={styles.audienceLabel}>Distribution Channels</Text>
            <View style={styles.channelChips}>
              {campaign.channels.map((ch) => (
                <View key={ch} style={styles.channelChip}>
                  <Text style={styles.channelChipText}>{ch}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={styles.channelNote}>
            Final channel selection and targeting details are confirmed during the platform review and ad setup process. User-selected preferences are taken into account but may be adjusted.
          </Text>
        </ExpandableSection>

        {/* Review & Trust */}
        <ExpandableSection title="✅ Review & Trust">
          <Text style={styles.reviewText}>
            This campaign was reviewed by the platform team before being approved for distribution. Review includes checking content accuracy, source credibility, advertising assets, and compliance with community guidelines.
          </Text>
          <Text style={styles.reviewText}>
            Review does not constitute endorsement of the campaign's position. The platform facilitates distribution; backers should form their own views based on the campaign story and sources.
          </Text>
          {campaign.approvedAt && (
            <Text style={styles.reviewApproved}>
              ✓ Approved on {new Date(campaign.approvedAt).toLocaleDateString()}
            </Text>
          )}
        </ExpandableSection>

        {/* Analytics (if promoting) */}
        {(campaign.status === 'promoting' || campaign.status === 'completed') && campaign.impressions && (
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>📊 Distribution Progress</Text>
            <Text style={styles.analyticsNote}>Verified delivery metrics — not estimates</Text>
            <View style={styles.analyticsRow}>
              {[
                { label: 'Impressions', value: formatNumber(campaign.impressions) },
                { label: 'Clicks', value: formatNumber(campaign.clicks ?? 0) },
                { label: 'CTR', value: `${((campaign.clicks ?? 0) / campaign.impressions * 100).toFixed(1)}%` },
              ].map((stat) => (
                <View key={stat.label} style={styles.analyticsStat}>
                  <Text style={styles.analyticsValue}>{stat.value}</Text>
                  <Text style={styles.analyticsLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Feedback */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Did this campaign change your perspective?</Text>
          <View style={styles.feedbackRow}>
            {['No', 'Somewhat', 'Yes'].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.feedbackBtn, feedback === opt && styles.feedbackBtnActive]}
                onPress={() => setFeedback(opt)}
              >
                <Text style={[styles.feedbackBtnText, feedback === opt && styles.feedbackBtnTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {feedback && (
            <Text style={styles.feedbackThanks}>Thanks for your feedback! 🙏</Text>
          )}
        </View>

        {/* Back CTA */}
        <View style={styles.bottomCTA}>
          <Button
            label="Back This Campaign"
            fullWidth
            size="lg"
            onPress={() => router.push(`/back/${campaign.id}`)}
          />
          <TouchableOpacity style={styles.shareLink} onPress={handleShare}>
            <Text style={styles.shareLinkText}>📤 Share Campaign</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.lg },
  notFoundIcon: { fontSize: 48 },
  notFoundText: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.full,
  },
  backBtnText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text },
  shareBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary + '18',
    borderRadius: BorderRadius.full,
  },
  shareBtnText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.primary },

  content: { paddingBottom: 32 },

  coverImage: {
    width: '100%',
    height: 220,
    backgroundColor: Colors.surfaceSecondary,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    gap: 5,
  },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  statusBadge: {},
  statusText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text },

  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    lineHeight: 32,
    marginBottom: Spacing.sm,
  },
  creator: { fontSize: FontSizes.md, color: Colors.textSecondary, paddingHorizontal: Spacing.lg },
  date: { fontSize: FontSizes.sm, color: Colors.textTertiary, paddingHorizontal: Spacing.lg, marginTop: 3, marginBottom: Spacing.lg },
  summary: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },

  fundingCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  fundingAmounts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  raisedAmount: { fontSize: FontSizes.xxl, fontWeight: FontWeights.extrabold, color: Colors.text },
  raisedLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  reachAmount: { fontSize: FontSizes.xxl, fontWeight: FontWeights.extrabold, color: Colors.primary, textAlign: 'right' },
  reachLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, textAlign: 'right', marginTop: 2 },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  fundingMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  fundingMetaText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: FontWeights.medium },
  reachNote: { fontSize: FontSizes.xs, color: Colors.textTertiary, lineHeight: 16, marginBottom: Spacing.lg },
  backThisBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  backThisBtnText: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.textOnPrimary },

  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.lg },
  storyHeadline: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text, lineHeight: 28, marginBottom: Spacing.md },
  storyParagraph: { fontSize: FontSizes.md, color: Colors.text, lineHeight: 26, marginBottom: Spacing.md },

  expandable: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  expandableTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, flex: 1 },
  expandableToggle: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  expandableContent: { padding: Spacing.lg, paddingTop: 0, borderTopWidth: 1, borderTopColor: Colors.borderLight },

  sourcesNote: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.md, lineHeight: 18 },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  sourceTitle: { flex: 1, fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text },
  sourceUrl: { flex: 1, fontSize: FontSizes.xs, color: Colors.primary, marginTop: 2 },
  sourceArrow: { fontSize: 16, color: Colors.primary },

  fundsNote: {
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  fundsNoteText: { fontSize: FontSizes.sm, color: Colors.text, lineHeight: 18 },
  fundsNoteBold: { fontWeight: FontWeights.bold },
  fundsBreakdown: { marginBottom: Spacing.md },
  fundsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.sm },
  fundsDot: { width: 10, height: 10, borderRadius: 5 },
  fundsLabel: { flex: 1, fontSize: FontSizes.sm, color: Colors.text },
  fundsValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  fundsRefund: { fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 16 },

  audienceSection: { marginBottom: Spacing.md },
  audienceLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  audienceValue: { fontSize: FontSizes.sm, color: Colors.text, lineHeight: 20 },
  channelChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: 4 },
  channelChip: {
    backgroundColor: Colors.primary + '14',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  channelChipText: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: FontWeights.semibold },
  channelNote: { fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 16, marginTop: Spacing.sm },

  reviewText: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
  reviewApproved: { fontSize: FontSizes.sm, color: Colors.success, fontWeight: FontWeights.semibold },

  analyticsCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  analyticsTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: 3 },
  analyticsNote: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: Spacing.md },
  analyticsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  analyticsStat: { alignItems: 'center' },
  analyticsValue: { fontSize: FontSizes.xl, fontWeight: FontWeights.extrabold, color: Colors.primary },
  analyticsLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 3 },

  feedbackSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  feedbackTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: Spacing.md },
  feedbackRow: { flexDirection: 'row', gap: Spacing.sm },
  feedbackBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  feedbackBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  feedbackBtnText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textSecondary },
  feedbackBtnTextActive: { color: Colors.textOnPrimary },
  feedbackThanks: { fontSize: FontSizes.sm, color: Colors.success, textAlign: 'center', marginTop: Spacing.md, fontWeight: FontWeights.semibold },

  bottomCTA: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  shareLink: { alignItems: 'center', paddingVertical: Spacing.sm },
  shareLinkText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold },
});
