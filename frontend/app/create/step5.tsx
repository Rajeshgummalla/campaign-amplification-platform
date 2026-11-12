import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCampaignStore, useNotificationStore } from '../../stores';
import StepIndicator from '../../components/StepIndicator';
import Button from '../../components/Button';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';

const STEP_LABELS = ['Basics', 'Story', 'Visuals', 'Reach', 'Submit'];
const PLATFORM_FEE = 8;
const PROCESSING_FEE = 3;
const REACH_PER_DOLLAR = 100;

function formatCurrency(n: number): string {
  return `\$${n.toLocaleString()}`;
}
function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

export default function Step5Submit() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addNotification } = useNotificationStore();
  const { submitCampaign, drafts } = useCampaignStore();

  const [fundingGoal, setFundingGoal] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const goalNum = parseFloat(fundingGoal.replace(/[^0-9.]/g, '')) || 0;
  const advertisingBudget = goalNum * ((100 - PLATFORM_FEE - PROCESSING_FEE) / 100);
  const estimatedReach = advertisingBudget * REACH_PER_DOLLAR;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fundingGoal || goalNum <= 0) errs.fundingGoal = 'Please set a funding goal greater than $0';
    if (goalNum < 500) errs.fundingGoal = 'Minimum funding goal is $500';
    if (!agreed) errs.agreed = 'You must agree to the campaign policies to submit';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));

    addNotification({
      id: `n-${Date.now()}`,
      type: 'campaign_submitted',
      title: 'Campaign submitted for review 📤',
      message: `Your campaign "${params.title || 'New Campaign'}" has been submitted. Our team will review it within 2-3 business days.`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successScreen}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Campaign Submitted!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for submitting your campaign. Our review team will assess it within 2–3 business days.
          </Text>

          {/* Timeline */}
          <View style={styles.timeline}>
            <Text style={styles.timelineTitle}>What happens next</Text>
            {[
              { icon: '✅', step: 'Submission Confirmed', desc: 'Your campaign is queued for review', done: true },
              { icon: '🔍', step: 'Content Review', desc: 'Team reviews story, sources, and ad assets', done: false },
              { icon: '📣', step: 'Goes Live for Backing', desc: 'Community can start contributing', done: false },
              { icon: '🚀', step: 'Campaign Promoted', desc: 'Ad distribution begins once funded', done: false },
            ].map((item, i) => (
              <View key={i} style={styles.timelineItem}>
                <View style={[styles.timelineDot, item.done && styles.timelineDotDone]}>
                  <Text style={styles.timelineDotText}>{item.icon}</Text>
                </View>
                <View style={styles.timelineInfo}>
                  <Text style={[styles.timelineStep, item.done && styles.timelineStepDone]}>{item.step}</Text>
                  <Text style={styles.timelineDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.successActions}>
            <Button
              label="View Activity"
              onPress={() => router.replace('/(tabs)/activity')}
              fullWidth
              style={{ marginBottom: Spacing.sm }}
            />
            <Button
              label="Back to Home"
              variant="outline"
              onPress={() => router.replace('/(tabs)')}
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator currentStep={5} totalSteps={5} labels={STEP_LABELS} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepNum}>Step 5 of 5</Text>
          <Text style={styles.stepTitle}>Review & Submit</Text>
          <Text style={styles.stepSubtitle}>
            Review your complete campaign before submission. Set your funding goal carefully — this cannot be AI-generated and must reflect your actual distribution needs.
          </Text>
        </View>

        {/* Campaign Preview Summary */}
        <View style={styles.previewCard}>
          <Text style={styles.previewCardTitle}>📋 Campaign Preview</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Title</Text>
            <Text style={styles.previewValue} numberOfLines={2}>{params.title || '—'}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Category</Text>
            <Text style={styles.previewValue}>{params.category || '—'}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Creator</Text>
            <Text style={styles.previewValue}>{params.creator || '—'}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Duration</Text>
            <Text style={styles.previewValue}>{params.duration || '30'} days</Text>
          </View>

          <TouchableOpacity style={styles.editPreviewBtn}>
            <Text style={styles.editPreviewText}>👁️ Preview Full Campaign</Text>
          </TouchableOpacity>
        </View>

        {/* Funding Goal */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Funding Goal <Text style={styles.required}>*</Text></Text>
          <View style={styles.goalNote}>
            <Text style={styles.goalNoteText}>
              📝 <Text style={styles.goalNoteBold}>You set the funding goal.</Text> It is not auto-generated. Consider your advertising budget needs, platform fees, and distribution duration.
            </Text>
          </View>
          <View style={styles.goalInputRow}>
            <Text style={styles.dollarSign}>\$</Text>
            <TextInput
              style={[styles.goalInput, errors.fundingGoal && styles.inputError]}
              placeholder="5,000"
              placeholderTextColor={Colors.textTertiary}
              value={fundingGoal}
              onChangeText={setFundingGoal}
              keyboardType="numeric"
            />
          </View>
          {errors.fundingGoal && <Text style={styles.errorText}>{errors.fundingGoal}</Text>}

          {goalNum > 0 && (
            <View style={styles.goalBreakdown}>
              <Text style={styles.goalBreakdownTitle}>How your goal breaks down:</Text>
              <View style={styles.goalRow}>
                <Text style={styles.goalRowLabel}>Advertising Budget ({100 - PLATFORM_FEE - PROCESSING_FEE}%)</Text>
                <Text style={[styles.goalRowValue, { color: Colors.success }]}>{formatCurrency(advertisingBudget)}</Text>
              </View>
              <View style={styles.goalRow}>
                <Text style={styles.goalRowLabel}>Platform Fee ({PLATFORM_FEE}%)</Text>
                <Text style={styles.goalRowValue}>{formatCurrency(goalNum * PLATFORM_FEE / 100)}</Text>
              </View>
              <View style={styles.goalRow}>
                <Text style={styles.goalRowLabel}>Payment Processing ({PROCESSING_FEE}%)</Text>
                <Text style={styles.goalRowValue}>{formatCurrency(goalNum * PROCESSING_FEE / 100)}</Text>
              </View>
              <View style={[styles.goalRow, styles.goalRowTotal]}>
                <Text style={styles.goalRowTotalLabel}>Est. Audience Reach at Goal</Text>
                <Text style={styles.goalRowTotalValue}>~{formatNumber(estimatedReach)}</Text>
              </View>
              <Text style={styles.goalReachNote}>
                Based on ~{REACH_PER_DOLLAR} people per dollar of advertising spend. Actual reach varies. This is an estimate, not a guarantee.
              </Text>
            </View>
          )}
        </View>

        {/* Policies Agreement */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Campaign Policies</Text>
          <View style={styles.policiesBox}>
            {[
              'My campaign content is accurate to the best of my knowledge',
              'All sources I have cited are genuine and accessible',
              'My campaign does not violate community guidelines or applicable laws',
              'I understand that contributions fund advertising distribution, not a direct payment to me',
              'I understand my campaign will be reviewed before going live',
              'Unspent advertising budget will be returned to backers pro-rata if the campaign underdelivers',
            ].map((policy, i) => (
              <View key={i} style={styles.policyItem}>
                <Text style={styles.policyCheck}>✓</Text>
                <Text style={styles.policyText}>{policy}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.agreeRow}
            onPress={() => setAgreed(!agreed)}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={styles.agreeText}>
              I have read and agree to the campaign policies, terms of service, and community guidelines
            </Text>
          </TouchableOpacity>
          {errors.agreed && <Text style={styles.errorText}>{errors.agreed}</Text>}
        </View>

        {/* Submit Actions */}
        <View style={styles.submitActions}>
          <Button
            label="← Back"
            variant="outline"
            onPress={() => router.back()}
            style={styles.actionBtn}
          />
          <Button
            label="Save Draft"
            variant="ghost"
            onPress={() => Alert.alert('Draft Saved', 'Campaign saved as draft.')}
            style={styles.actionBtn}
          />
        </View>

        <Button
          label={submitting ? 'Submitting...' : '📤 Submit for Review'}
          onPress={handleSubmit}
          fullWidth
          size="lg"
          loading={submitting}
          disabled={!agreed}
          style={styles.submitBtn}
        />

        <Text style={styles.submitNote}>
          After submission, our team will review your campaign within 2–3 business days. You'll receive a notification when it's approved or if changes are required.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 32 },

  stepHeader: { marginBottom: Spacing.xl },
  stepNum: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.primary, marginBottom: 4 },
  stepTitle: { fontSize: FontSizes.xxl, fontWeight: FontWeights.extrabold, color: Colors.text, marginBottom: Spacing.sm },
  stepSubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 22 },

  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  previewCardTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.lg },
  previewRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  previewLabel: { width: 90, fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: FontWeights.medium },
  previewValue: { flex: 1, fontSize: FontSizes.sm, color: Colors.text, fontWeight: FontWeights.semibold },
  editPreviewBtn: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  editPreviewText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold },

  fieldGroup: { marginBottom: Spacing.xl },
  label: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: 4 },
  required: { color: Colors.error },

  goalNote: {
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  goalNoteText: { fontSize: FontSizes.sm, color: Colors.text, lineHeight: 18 },
  goalNoteBold: { fontWeight: FontWeights.bold },

  goalInputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dollarSign: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.text },
  goalInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    ...Shadows.sm,
  },
  inputError: { borderColor: Colors.error },
  errorText: { fontSize: FontSizes.sm, color: Colors.error, marginTop: 5 },

  goalBreakdown: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  goalBreakdownTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm - 2 },
  goalRowLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  goalRowValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text },
  goalRowTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
  },
  goalRowTotalLabel: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text },
  goalRowTotalValue: { fontSize: FontSizes.xl, fontWeight: FontWeights.extrabold, color: Colors.primary },
  goalReachNote: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginTop: Spacing.sm, lineHeight: 15 },

  policiesBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  policyItem: { flexDirection: 'row', gap: Spacing.sm },
  policyCheck: { color: Colors.success, fontWeight: FontWeights.bold, fontSize: FontSizes.md, width: 16 },
  policyText: { flex: 1, fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 18 },

  agreeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkboxCheck: { fontSize: 14, color: Colors.textOnPrimary, fontWeight: FontWeights.bold },
  agreeText: { flex: 1, fontSize: FontSizes.sm, color: Colors.text, lineHeight: 20 },

  submitActions: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  actionBtn: { flex: 1 },
  submitBtn: { marginBottom: Spacing.md },
  submitNote: { fontSize: FontSizes.xs, color: Colors.textTertiary, textAlign: 'center', lineHeight: 16 },

  // Success screen
  successScreen: { flex: 1, padding: Spacing.xl, alignItems: 'center', justifyContent: 'center' },
  successIcon: { fontSize: 72, marginBottom: Spacing.lg },
  successTitle: { fontSize: FontSizes.xxxl, fontWeight: FontWeights.extrabold, color: Colors.text, textAlign: 'center', marginBottom: Spacing.md },
  successSubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },

  timeline: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  timelineTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.lg },
  timelineItem: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  timelineDotDone: { backgroundColor: Colors.successLight },
  timelineDotText: { fontSize: 18 },
  timelineInfo: { flex: 1, justifyContent: 'center' },
  timelineStep: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.textSecondary },
  timelineStepDone: { color: Colors.success },
  timelineDesc: { fontSize: FontSizes.sm, color: Colors.textTertiary, marginTop: 2 },

  successActions: { width: '100%' },
});
