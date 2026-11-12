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
import StepIndicator from '../../components/StepIndicator';
import Button from '../../components/Button';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';

const STEP_LABELS = ['Basics', 'Story', 'Visuals', 'Reach', 'Submit'];

interface StorySection {
  id: string;
  type: 'paragraph' | 'statistic' | 'quote';
  content: string;
}

interface Source {
  id: string;
  title: string;
  url: string;
}

export default function Step2Story() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const title = params.title as string ?? '';

  const [headline, setHeadline] = useState(`Why ${title} Matters`);
  const [intro, setIntro] = useState('');
  const [sections, setSections] = useState<StorySection[]>([
    { id: 's1', type: 'paragraph', content: '' },
  ]);
  const [sources, setSources] = useState<Source[]>([
    { id: 'src1', title: '', url: '' },
  ]);
  const [audienceAction, setAudienceAction] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!headline.trim()) errs.headline = 'Story headline is required';
    if (!intro.trim()) errs.intro = 'Introductory text is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addSection = (type: StorySection['type']) => {
    setSections([...sections, { id: `s${Date.now()}`, type, content: '' }]);
  };

  const updateSection = (id: string, content: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, content } : s));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const addSource = () => {
    setSources([...sources, { id: `src${Date.now()}`, title: '', url: '' }]);
  };

  const updateSource = (id: string, field: 'title' | 'url', value: string) => {
    setSources(sources.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };

  const handleContinue = () => {
    if (!validate()) return;
    router.push(`/create/step3?${new URLSearchParams({ ...params as any }).toString()}&headline=${encodeURIComponent(headline)}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator currentStep={2} totalSteps={5} labels={STEP_LABELS} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Step Header */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepNum}>Step 2 of 5</Text>
          <Text style={styles.stepTitle}>Tell Your Story</Text>
          <Text style={styles.stepSubtitle}>
            Write a clear, well-sourced article explaining your message. Sources remain visible to audiences.
          </Text>
        </View>

        {/* Headline */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Story Headline <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.headline && styles.inputError]}
            placeholder="A compelling headline for your story"
            placeholderTextColor={Colors.textTertiary}
            value={headline}
            onChangeText={setHeadline}
          />
          {errors.headline && <Text style={styles.errorText}>{errors.headline}</Text>}
        </View>

        {/* Intro */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Introduction <Text style={styles.required}>*</Text></Text>
          <Text style={styles.hint}>Set the context. Who is affected and why does this matter?</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.intro && styles.inputError]}
            placeholder="Start with why this message is important and who it affects..."
            placeholderTextColor={Colors.textTertiary}
            value={intro}
            onChangeText={setIntro}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          {errors.intro && <Text style={styles.errorText}>{errors.intro}</Text>}
        </View>

        {/* Story Sections */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Story Sections</Text>
          <Text style={styles.hint}>Add paragraphs, statistics, or quotes to build your story.</Text>

          {sections.map((section, i) => (
            <View key={section.id} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTypeBadge}>
                  <Text style={styles.sectionTypeText}>
                    {section.type === 'paragraph' ? '¶ Paragraph' :
                     section.type === 'statistic' ? '# Statistic' : '" Quote'}
                  </Text>
                </View>
                {sections.length > 1 && (
                  <TouchableOpacity onPress={() => removeSection(section.id)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={
                  section.type === 'paragraph' ? 'Write your paragraph...' :
                  section.type === 'statistic' ? 'e.g. "40% reduction in particulate matter..."' :
                  '"Quote the source or expert..."'
                }
                placeholderTextColor={Colors.textTertiary}
                value={section.content}
                onChangeText={(v) => updateSection(section.id, v)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          ))}

          {/* Add Section */}
          <View style={styles.addSectionRow}>
            {(['paragraph', 'statistic', 'quote'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.addSectionBtn}
                onPress={() => addSection(type)}
              >
                <Text style={styles.addSectionIcon}>+</Text>
                <Text style={styles.addSectionText}>
                  {type === 'paragraph' ? 'Paragraph' :
                   type === 'statistic' ? 'Statistic' : 'Quote'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Image upload */}
          <TouchableOpacity style={styles.imageUpload}>
            <Text style={styles.imageUploadIcon}>🖼️</Text>
            <Text style={styles.imageUploadText}>Add Image to Story</Text>
          </TouchableOpacity>
        </View>

        {/* Supporting Sources */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Supporting Sources</Text>
          <View style={styles.sourcesNote}>
            <Text style={styles.sourcesNoteText}>
              🔍 Sources are <Text style={styles.noteBold}>visible to the public</Text> on your campaign page. Include credible, primary sources.
            </Text>
          </View>

          {sources.map((source, i) => (
            <View key={source.id} style={styles.sourceCard}>
              <View style={styles.sourceCardHeader}>
                <Text style={styles.sourceNum}>Source {i + 1}</Text>
                {sources.length > 1 && (
                  <TouchableOpacity onPress={() => removeSource(source.id)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={[styles.input, styles.sourceInput]}
                placeholder="Source title (e.g. WHO Air Quality Guidelines)"
                placeholderTextColor={Colors.textTertiary}
                value={source.title}
                onChangeText={(v) => updateSource(source.id, 'title', v)}
              />
              <TextInput
                style={[styles.input, styles.sourceInput]}
                placeholder="URL (https://...)"
                placeholderTextColor={Colors.textTertiary}
                value={source.url}
                onChangeText={(v) => updateSource(source.id, 'url', v)}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          ))}

          <TouchableOpacity style={styles.addSourceBtn} onPress={addSource}>
            <Text style={styles.addSourceText}>+ Add Another Source</Text>
          </TouchableOpacity>
        </View>

        {/* Audience Action */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Suggested Audience Action</Text>
          <Text style={styles.hint}>What do you want people to do after seeing this campaign?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Contact your local council member, Share this research..."
            placeholderTextColor={Colors.textTertiary}
            value={audienceAction}
            onChangeText={setAudienceAction}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label="← Back"
            variant="outline"
            onPress={() => router.back()}
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
  errorText: { fontSize: FontSizes.sm, color: Colors.error, marginTop: 5 },

  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTypeBadge: {
    backgroundColor: Colors.primary + '18',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  sectionTypeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, color: Colors.primary },
  removeText: { fontSize: FontSizes.sm, color: Colors.error },

  addSectionRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  addSectionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: 4,
  },
  addSectionIcon: { fontSize: 16, color: Colors.primary, fontWeight: FontWeights.bold },
  addSectionText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold },

  imageUpload: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  imageUploadIcon: { fontSize: 24 },
  imageUploadText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.textSecondary },

  sourcesNote: {
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  sourcesNoteText: { fontSize: FontSizes.sm, color: Colors.text, lineHeight: 18 },
  noteBold: { fontWeight: FontWeights.bold },

  sourceCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  sourceCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sourceNum: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.textSecondary },
  sourceInput: { marginBottom: 0 },

  addSourceBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary + '60',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  addSourceText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold },

  actions: { flexDirection: 'row', gap: Spacing.md },
  actionBtn: { flex: 1 },
});
