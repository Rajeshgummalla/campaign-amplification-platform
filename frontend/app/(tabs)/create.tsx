import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCampaignStore, useAuthStore } from '../../stores';
import Button from '../../components/Button';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';

const CREATION_METHODS = [
  {
    id: 'manual',
    icon: '✍️',
    title: 'Create Manually',
    subtitle: 'Step-by-step guided form',
    description: 'Build your campaign with a structured, easy-to-follow form covering all five steps.',
    color: Colors.primary,
    route: '/create/step1',
  },
  {
    id: 'voice',
    icon: '🎙️',
    title: 'Create with Voice',
    subtitle: 'Speak your idea',
    description: 'Describe your campaign idea aloud. AI helps draft and structure your campaign, which you can then edit.',
    color: Colors.secondary,
    route: '/create/step1',
  },
];

export default function CreateScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const { drafts } = useCampaignStore();

  const userDrafts = drafts.filter((d) => d.status === 'draft');

  const handleStart = (route: string) => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create a Campaign</Text>
          <Text style={styles.headerSubtitle}>
            Share your message with audiences beyond your existing network.
          </Text>
        </View>

        {/* 5 Step Overview */}
        <View style={styles.stepsOverview}>
          <Text style={styles.overviewTitle}>Campaign Creation — 5 Steps</Text>
          {[
            { num: 1, label: 'Basics', desc: 'Title, category, creator info, summary' },
            { num: 2, label: 'Story', desc: 'Headline, narrative, sources, evidence' },
            { num: 3, label: 'Ad Visuals', desc: 'Images, ad copy, call-to-action' },
            { num: 4, label: 'Reach', desc: 'Targeting, channels, duration, budget' },
            { num: 5, label: 'Submit', desc: 'Review everything and submit for approval' },
          ].map((step, i) => (
            <View key={step.num} style={styles.stepRow}>
              <View style={styles.stepNumContainer}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{step.num}</Text>
                </View>
                {i < 4 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepLabel}>{step.label}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Creation Methods */}
        <Text style={styles.methodTitle}>How do you want to start?</Text>
        {CREATION_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={styles.methodCard}
            onPress={() => handleStart(method.route)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[method.color + '12', method.color + '06']}
              style={styles.methodGradient}
            >
              <View style={styles.methodHeader}>
                <View style={[styles.methodIconBg, { backgroundColor: method.color + '20' }]}>
                  <Text style={styles.methodIcon}>{method.icon}</Text>
                </View>
                <View style={styles.methodHeaderText}>
                  <Text style={styles.methodCardTitle}>{method.title}</Text>
                  <Text style={[styles.methodSubtitle, { color: method.color }]}>{method.subtitle}</Text>
                </View>
                <Text style={styles.methodArrow}>→</Text>
              </View>
              <Text style={styles.methodDesc}>{method.description}</Text>
              {method.id === 'voice' && (
                <View style={styles.demoBadge}>
                  <Text style={styles.demoBadgeText}>Demo Mode Available</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Drafts */}
        {userDrafts.length > 0 && (
          <View style={styles.draftsSection}>
            <Text style={styles.draftsTitle}>Resume Draft</Text>
            {userDrafts.map((draft) => (
              <TouchableOpacity
                key={draft.id}
                style={styles.draftCard}
                onPress={() => router.push(`/create/step${draft.currentStep}` as any)}
              >
                <View style={styles.draftIcon}>
                  <Text style={styles.draftIconText}>📄</Text>
                </View>
                <View style={styles.draftInfo}>
                  <Text style={styles.draftTitle} numberOfLines={1}>
                    {draft.title || 'Untitled Campaign'}
                  </Text>
                  <Text style={styles.draftMeta}>
                    Step {draft.currentStep} of 5 · Saved {new Date(draft.savedAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.draftArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Important Note */}
        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>📋 Review Process</Text>
          <Text style={styles.noteText}>
            All campaigns are reviewed by our team before going live. We verify content accuracy, source quality, and compliance with community guidelines. Review typically takes 2-3 business days.
          </Text>
        </View>

        {/* Guidelines Link */}
        <TouchableOpacity style={styles.guideLink}>
          <Text style={styles.guideLinkText}>📖 Read Campaign Guidelines before starting →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 32 },

  header: { marginBottom: Spacing.xl },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: FontWeights.extrabold, color: Colors.text },
  headerSubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.sm, lineHeight: 22 },

  stepsOverview: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  overviewTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.lg },
  stepRow: { flexDirection: 'row', marginBottom: 2 },
  stepNumContainer: { alignItems: 'center', width: 28, marginRight: Spacing.md },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: Colors.textOnPrimary },
  stepLine: { width: 2, flex: 1, backgroundColor: Colors.border, marginTop: 2, marginBottom: 2, minHeight: 16 },
  stepInfo: { flex: 1, paddingBottom: Spacing.md },
  stepLabel: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text },
  stepDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },

  methodTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
  methodCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  methodGradient: { padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.xl },
  methodHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.md },
  methodIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodIcon: { fontSize: 24 },
  methodHeaderText: { flex: 1 },
  methodCardTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text },
  methodSubtitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, marginTop: 2 },
  methodArrow: { fontSize: 20, color: Colors.textSecondary },
  methodDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  demoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginTop: Spacing.sm,
  },
  demoBadgeText: { fontSize: FontSizes.xs, color: Colors.secondary, fontWeight: FontWeights.semibold },

  draftsSection: { marginBottom: Spacing.xl },
  draftsTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
  draftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  draftIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftIconText: { fontSize: 20 },
  draftInfo: { flex: 1 },
  draftTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text },
  draftMeta: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  draftArrow: { fontSize: 18, color: Colors.textSecondary },

  noteBox: {
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
    marginBottom: Spacing.md,
  },
  noteTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.sm },
  noteText: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },

  guideLink: { alignItems: 'center', paddingVertical: Spacing.md },
  guideLinkText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold },
});
