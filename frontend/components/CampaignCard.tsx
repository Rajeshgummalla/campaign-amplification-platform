import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import { Campaign } from '../data/types';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../constants/theme';
import { useRouter } from 'expo-router';

interface CampaignCardProps {
  campaign: Campaign;
  style?: ViewStyle;
  compact?: boolean;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

function formatCurrency(n: number): string {
  if (n >= 1000) return `\$${(n / 1000).toFixed(0)}K`;
  return `\$${n.toLocaleString()}`;
}

export default function CampaignCard({ campaign, style, compact = false }: CampaignCardProps) {
  const router = useRouter();
  const progress = Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100);

  const statusLabel: Record<string, { label: string; color: string }> = {
    funding: { label: 'Funding Now', color: Colors.success },
    promoting: { label: 'Being Promoted', color: Colors.primary },
    completed: { label: 'Completed', color: Colors.textSecondary },
    submitted: { label: 'Under Review', color: Colors.warning },
    approved: { label: 'Approved', color: Colors.success },
  };
  const st = statusLabel[campaign.status] ?? { label: campaign.status, color: Colors.textSecondary };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => router.push(`/campaign/${campaign.id}`)}
      activeOpacity={0.92}
    >
      {/* Cover Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: campaign.coverImage }} style={styles.image} />
        <View style={styles.categoryBadge}>
          <View style={[styles.categoryDot, { backgroundColor: campaign.categoryColor }]} />
          <Text style={styles.categoryText}>{campaign.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: st.color + '22' }]}>
          <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{campaign.title}</Text>
        <Text style={styles.creator}>by {campaign.creatorName}</Text>

        {!compact && (
          <Text style={styles.summary} numberOfLines={2}>{campaign.summary}</Text>
        )}

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
          </View>
          <View style={styles.progressMeta}>
            <View>
              <Text style={styles.raised}>{formatCurrency(campaign.raisedAmount)}</Text>
              <Text style={styles.goal}>of {formatCurrency(campaign.targetAmount)} goal</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.reach}>~{formatNumber(campaign.reachEstimate)}</Text>
              <Text style={styles.reachLabel}>est. reach</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.backerInfo}>
            <Text style={styles.backerCount}>{campaign.backerCount.toLocaleString()} backers</Text>
            {campaign.daysLeft > 0 && (
              <Text style={styles.daysLeft}> · {campaign.daysLeft}d left</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push(`/back/${campaign.id}`)}
          >
            <Text style={styles.backButtonText}>Back This</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceSecondary,
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    gap: 5,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 4,
  },
  creator: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  summary: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  progressSection: {
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  raised: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  goal: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  reach: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    textAlign: 'right',
  },
  reachLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  backerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backerCount: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  daysLeft: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  backButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textOnPrimary,
  },
});
