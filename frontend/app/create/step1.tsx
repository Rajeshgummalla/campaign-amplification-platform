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
import { useRouter } from 'expo-router';
import { useCampaignStore, useAuthStore } from '../../stores';
import { CampaignDraft } from '../../data/types';
import StepIndicator from '../../components/StepIndicator';
import Button from '../../components/Button';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';
import { CATEGORIES } from '../../data/seed';

const STEP_LABELS = ['Basics', 'Story', 'Visuals', 'Reach', 'Submit'];

export default function Step1Basics() {
  const router = useRouter();
  const { saveDraft } = useCampaignStore();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [creatorName, setCreatorName] = useState(user?.name ?? '');
  const [summary, setSummary] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Campaign title is required';
    else if (title.length > 60) errs.title = 'Title must be 60 characters or fewer';
    if (!category) errs.category = 'Please select a category';
    if (!creatorName.trim()) errs.creatorName = 'Creator name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getDraftId = () => `draft-${Date.now()}`;

  const buildDraft = (status: 'draft'): CampaignDraft => ({
    id: getDraftId(),
    title,
    category,
    creatorName,
    summary,
    storyHeadline: '',
    storyBody: '',
    sources: [],
    adHeadline: '',
    adDescription: '',
    callToAction: 'Learn More',
    adImages: [],
    targetLocations: [],
    targetAudience: '',
    channels: [],
    duration: 30,
    budgetAllocation: { socialMedia: 40, searchAds: 30, displayNetwork: 20, video: 10 },
    targetAmount: 0,
    currentStep: 1,
    savedAt: new Date().toISOString(),
    status,
  });

  const handleSaveDraft = async () => {
    setSaving(true);
    saveDraft(buildDraft('draft'));
    setSaving(false);
    Alert.alert('Draft Saved', 'Your campaign has been saved as a draft.');
  };

  const handleContinue = () => {
    if (!validate()) return;
    const draft = buildDraft('draft');
    saveDraft(draft);
    router.push(`/create/step2?draftId=${draft.id}&title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}&creator=${encodeURIComponent(creatorName)}&summary=${encodeURIComponent(summary)}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator currentStep={1} totalSteps={5} labels={STEP_LABELS} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Step Header */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepNum}>Step 1 of 5</Text>
          <Text style={styles.stepTitle}>Campaign Basics</Text>
          <Text style={styles.stepSubtitle}>
            Start with the essentials. Describe what your campaign is about and who's behind it.
          </Text>
        </View>

        {/* AI Suggestion Banner */}
        <TouchableOpacity style={styles.aiBanner}>
          <Text style={styles.aiIcon}>✨</Text>
          <View style={styles.aiBannerText}>
            <Text style={styles.aiBannerTitle}>Get AI Assistance</Text>
            <Text style={styles.aiBannerSub}>Let AI suggest a title, summary, and category based on your idea</Text>
          </View>
          <Text style={styles.aiBannerArrow}>→</Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Campaign Title <Text style={styles.required}>*</Text></Text>
          <Text style={styles.hint}>
            Keep it clear and compelling. The first part may be used as an ad headline.
          </Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="e.g. Clean Air Initiative: Reduce Urban Pollution Now"
            placeholderTextColor={Colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={60}
            multiline={false}
          />
          <View style={styles.inputFooter}>
            {errors.title ? (
              <Text style={styles.errorText}>{errors.title}</Text>
            ) : (
              <Text style={styles.inputHint}>First part may be used as your ad headline</Text>
            )}
            <Text style={[styles.charCount, title.length > 55 && styles.charCountWarn]}>
              {title.length}/60
            </Text>
          </View>
        </View>

        {/* Category */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  category === cat.label && { backgroundColor: cat.color, borderColor: cat.color },
                ]}
                onPress={() => {
                  setCategory(cat.label);
                  if (errors.category) setErrors({ ...errors, category: '' });
                }}
              >
                <Text style={[styles.categoryChipText, category === cat.label && { color: Colors.textOnPrimary }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>

        {/* Creator Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Creator / Organization Name <Text style={styles.required}>*</Text></Text>
          <Text style={styles.hint}>Your name, pseudonym, or organization name as it will appear publicly.</Text>
          <TextInput
            style={[styles.input, errors.creatorName && styles.inputError]}
            placeholder="e.g. Clean Cities Coalition"
            placeholderTextColor={Colors.textTertiary}
            value={creatorName}
            onChangeText={setCreatorName}
          />
          {errors.creatorName && <Text style={styles.errorText}>{errors.creatorName}</Text>}
        </View>

        {/* Summary */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Short Summary</Text>
          <Text style={styles.hint}>
            A brief, compelling description of your campaign. Shown in search results and cards.
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Summarize what this campaign is about and why it matters..."
            placeholderTextColor={Colors.textTertiary}
            value={summary}
            onChangeText={setSummary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{summary.length}/280</Text>
        </View>

        {/* Cover Image */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Cover Image (Optional)</Text>
          <Text style={styles.hint}>A compelling image for your campaign card and detail page.</Text>
          <TouchableOpacity style={styles.imageUpload}>
            <Text style={styles.imageUploadIcon}>📷</Text>
            <Text style={styles.imageUploadText}>Tap to upload an image</Text>
            <Text style={styles.imageUploadHint}>JPG or PNG, at least 1200×630px recommended</Text>
          </TouchableOpacity>
        </View>

        {/* What Happens Next */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <Text style={styles.infoText}>
            After completing all 5 steps, you'll submit your campaign for review. Our team checks your content and sources before it goes live for community backing.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label="Save Draft"
            variant="outline"
            onPress={handleSaveDraft}
            loading={saving}
            style={styles.actionBtn}
          />
          <Button
            label="Continue →"
            onPress={handleContinue}
            style={styles.actionBtn}
          />
        </View>
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

  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '0F',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    gap: Spacing.md,
  },
  aiIcon: { fontSize: 22 },
  aiBannerText: { flex: 1 },
  aiBannerTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.primary },
  aiBannerSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  aiBannerArrow: { fontSize: 18, color: Colors.primary },

  fieldGroup: { marginBottom: Spacing.xl },
  label: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: 4 },
  required: { color: Colors.error },
  hint: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.sm, lineHeight: 18 },

  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    ...Shadows.sm,
  },
  inputError: { borderColor: Colors.error },
  textArea: { minHeight: 100, paddingTop: Spacing.md },
  inputFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  inputHint: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  charCount: { fontSize: FontSizes.xs, color: Colors.textTertiary, textAlign: 'right' },
  charCountWarn: { color: Colors.warning },
  errorText: { fontSize: FontSizes.sm, color: Colors.error, marginTop: 5 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  categoryChip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryChipText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text },

  imageUpload: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    gap: Spacing.sm,
  },
  imageUploadIcon: { fontSize: 32 },
  imageUploadText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text },
  imageUploadHint: { fontSize: FontSizes.xs, color: Colors.textSecondary, textAlign: 'center' },

  infoBox: {
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
    marginBottom: Spacing.xl,
  },
  infoTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.sm },
  infoText: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },

  actions: { flexDirection: 'row', gap: Spacing.md },
  actionBtn: { flex: 1 },
});
