import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import StepIndicator from '../../components/StepIndicator';
import Button from '../../components/Button';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';

const STEP_LABELS = ['Basics', 'Story', 'Visuals', 'Reach', 'Submit'];
const CTA_OPTIONS = ['Learn More', 'Read the Facts', 'Find Resources', 'Take Action', 'Donate Now', 'Sign Up', 'Get Help'];

const AD_PLACEMENTS = [
  { id: 'feed', label: 'Social Feed', icon: '📱' },
  { id: 'stories', label: 'Stories', icon: '⭕' },
  { id: 'search', label: 'Search Results', icon: '🔍' },
  { id: 'display', label: 'Display', icon: '🖥️' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
];

export default function Step3Visuals() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [adHeadline, setAdHeadline] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [selectedCTA, setSelectedCTA] = useState('Learn More');
  const [selectedPlacement, setSelectedPlacement] = useState('feed');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!adHeadline.trim()) errs.adHeadline = 'Ad headline is required';
    else if (adHeadline.length > 90) errs.adHeadline = 'Must be 90 characters or fewer';
    if (!adDescription.trim()) errs.adDescription = 'Ad description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    router.push(`/create/step4?${new URLSearchParams({ ...params as any }).toString()}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator currentStep={3} totalSteps={5} labels={STEP_LABELS} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepNum}>Step 3 of 5</Text>
          <Text style={styles.stepTitle}>Campaign & Ad Visuals</Text>
          <Text style={styles.stepSubtitle}>
            Create the advertising assets that will represent your message to new audiences. Keep these separate from your editorial story.
          </Text>
        </View>

        {/* Campaign Images */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Campaign Cover Image</Text>
          <Text style={styles.hint}>The primary visual for your campaign card and detail page.</Text>
          <TouchableOpacity style={styles.imageUpload}>
            <Text style={styles.imageUploadIcon}>📷</Text>
            <Text style={styles.imageUploadText}>Upload Cover Image</Text>
            <Text style={styles.imageUploadHint}>Recommended: 1200×630px, JPG/PNG</Text>
          </TouchableOpacity>
        </View>

        {/* Ad Images */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Advertising Images</Text>
          <Text style={styles.hint}>Images used in your ads. Multiple sizes may be needed for different placements.</Text>
          <View style={styles.adImageGrid}>
            <TouchableOpacity style={styles.adImageSlot}>
              <Text style={styles.adImageIcon}>➕</Text>
              <Text style={styles.adImageLabel}>Square (1:1)</Text>
              <Text style={styles.adImageSize}>1080×1080</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adImageSlot}>
              <Text style={styles.adImageIcon}>➕</Text>
              <Text style={styles.adImageLabel}>Landscape (1.91:1)</Text>
              <Text style={styles.adImageSize}>1200×628</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adImageSlot}>
              <Text style={styles.adImageIcon}>➕</Text>
              <Text style={styles.adImageLabel}>Story (9:16)</Text>
              <Text style={styles.adImageSize}>1080×1920</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.aiGenerateBtn}>
            <Text style={styles.aiGenerateIcon}>✨</Text>
            <Text style={styles.aiGenerateText}>Generate Ad Images with AI</Text>
          </TouchableOpacity>
        </View>

        {/* Ad Copy */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Ad Headline <Text style={styles.required}>*</Text></Text>
          <Text style={styles.hint}>
            Short, attention-grabbing headline for your ads. Max 90 chars.{'\n'}
            If left blank, the beginning of your campaign title will be used.
          </Text>
          <TextInput
            style={[styles.input, errors.adHeadline && styles.inputError]}
            placeholder="e.g. Cleaner Air Is Possible — Here's How"
            placeholderTextColor={Colors.textTertiary}
            value={adHeadline}
            onChangeText={setAdHeadline}
            maxLength={90}
          />
          <View style={styles.inputFooter}>
            {errors.adHeadline ? (
              <Text style={styles.errorText}>{errors.adHeadline}</Text>
            ) : <View />}
            <Text style={styles.charCount}>{adHeadline.length}/90</Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Ad Description <Text style={styles.required}>*</Text></Text>
          <Text style={styles.hint}>Supporting text for your ad. Concise and relevant.</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.adDescription && styles.inputError]}
            placeholder="Describe the key message in your ad..."
            placeholderTextColor={Colors.textTertiary}
            value={adDescription}
            onChangeText={setAdDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={200}
          />
          <View style={styles.inputFooter}>
            {errors.adDescription ? (
              <Text style={styles.errorText}>{errors.adDescription}</Text>
            ) : <View />}
            <Text style={styles.charCount}>{adDescription.length}/200</Text>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Call-to-Action Button</Text>
          <View style={styles.ctaGrid}>
            {CTA_OPTIONS.map((cta) => (
              <TouchableOpacity
                key={cta}
                style={[styles.ctaChip, selectedCTA === cta && styles.ctaChipActive]}
                onPress={() => setSelectedCTA(cta)}
              >
                <Text style={[styles.ctaChipText, selectedCTA === cta && styles.ctaChipTextActive]}>
                  {cta}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ad Preview */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Ad Placement Preview</Text>
          <View style={styles.placementRow}>
            {AD_PLACEMENTS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.placementChip, selectedPlacement === p.id && styles.placementChipActive]}
                onPress={() => setSelectedPlacement(p.id)}
              >
                <Text style={styles.placementIcon}>{p.icon}</Text>
                <Text style={[styles.placementText, selectedPlacement === p.id && styles.placementTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Mock Ad Preview */}
          <View style={styles.adPreview}>
            <View style={styles.adPreviewHeader}>
              <View style={styles.adPreviewAvatar} />
              <View style={styles.adPreviewMeta}>
                <Text style={styles.adPreviewName}>{params.creator || 'Campaign Creator'}</Text>
                <Text style={styles.adPreviewSponsored}>Sponsored</Text>
              </View>
            </View>
            <View style={styles.adPreviewImage}>
              <Text style={styles.adPreviewImageText}>📷 Ad Image</Text>
            </View>
            <View style={styles.adPreviewContent}>
              <Text style={styles.adPreviewHeadline} numberOfLines={2}>
                {adHeadline || (params.title ? String(params.title).substring(0, 60) : 'Your ad headline will appear here')}
              </Text>
              <Text style={styles.adPreviewDesc} numberOfLines={2}>
                {adDescription || 'Your ad description will appear here'}
              </Text>
              <View style={styles.adPreviewCTA}>
                <Text style={styles.adPreviewCTAText}>{selectedCTA}</Text>
              </View>
            </View>
            <Text style={styles.adPreviewNote}>Live preview. Actual appearance varies by platform.</Text>
          </View>
        </View>

        {/* Validation Note */}
        <View style={styles.validationNote}>
          <Text style={styles.validationTitle}>📋 Asset Review</Text>
          <Text style={styles.validationText}>
            All images and ad copy are reviewed before distribution begins. The platform will notify you if changes are required.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button label="← Back" variant="outline" onPress={() => router.back()} style={styles.actionBtn} />
          <Button label="Continue →" onPress={handleContinue} style={styles.actionBtn} />
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
  textArea: { minHeight: 80, paddingTop: Spacing.md },
  inputFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  charCount: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  errorText: { fontSize: FontSizes.sm, color: Colors.error },

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
  imageUploadHint: { fontSize: FontSizes.xs, color: Colors.textSecondary },

  adImageGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  adImageSlot: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    gap: 4,
  },
  adImageIcon: { fontSize: 24, color: Colors.textTertiary },
  adImageLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, color: Colors.textSecondary, textAlign: 'center' },
  adImageSize: { fontSize: 9, color: Colors.textTertiary },

  aiGenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  aiGenerateIcon: { fontSize: 18 },
  aiGenerateText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.primary },

  ctaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  ctaChip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  ctaChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  ctaChipText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textSecondary },
  ctaChipTextActive: { color: Colors.textOnPrimary },

  placementRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md, flexWrap: 'wrap' },
  placementChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 4,
  },
  placementChipActive: { backgroundColor: Colors.primary + '12', borderColor: Colors.primary },
  placementIcon: { fontSize: 14 },
  placementText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, color: Colors.textSecondary },
  placementTextActive: { color: Colors.primary },

  adPreview: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  adPreviewHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  adPreviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '40' },
  adPreviewMeta: {},
  adPreviewName: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text },
  adPreviewSponsored: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  adPreviewImage: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adPreviewImageText: { fontSize: 24, color: Colors.textTertiary },
  adPreviewContent: { padding: Spacing.md },
  adPreviewHeadline: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.sm },
  adPreviewDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 18, marginBottom: Spacing.md },
  adPreviewCTA: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
  },
  adPreviewCTAText: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.textOnPrimary },
  adPreviewNote: { fontSize: FontSizes.xs, color: Colors.textTertiary, textAlign: 'center', padding: Spacing.sm },

  validationNote: {
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
    marginBottom: Spacing.xl,
  },
  validationTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.sm },
  validationText: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },

  actions: { flexDirection: 'row', gap: Spacing.md },
  actionBtn: { flex: 1 },
});
