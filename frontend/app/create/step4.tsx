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

const LOCATIONS = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'India', 'Global'];
const CHANNELS = [
  { id: 'social', label: 'Social Media', icon: '📱', desc: 'Facebook, Instagram, Twitter/X' },
  { id: 'search', label: 'Search Ads', icon: '🔍', desc: 'Google, Bing' },
  { id: 'display', label: 'Display Network', icon: '🖥️', desc: 'Websites & apps' },
  { id: 'youtube', label: 'YouTube', icon: '▶️', desc: 'Video advertising' },
  { id: 'news', label: 'News Sites', icon: '📰', desc: 'Online news publications' },
];
const AUDIENCE_INTERESTS = [
  'Environment & Climate', 'Health & Wellness', 'Education', 'Politics & Policy',
  'Science & Technology', 'Community Issues', 'Economics', 'Arts & Culture',
  'Human Rights', 'Local News',
];

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

export default function Step4Reach() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedLocations, setSelectedLocations] = useState<string[]>(['United States']);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['social', 'search']);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [duration, setDuration] = useState(30);
  const [ageMin, setAgeMin] = useState('18');
  const [ageMax, setAgeMax] = useState('65');

  const toggleLocation = (loc: string) => {
    setSelectedLocations(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const toggleChannel = (id: string) => {
    setSelectedChannels(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const estimatedAudienceSize = selectedLocations.includes('United States')
    ? selectedLocations.length * 12000000
    : selectedLocations.length * 5000000;

  const handleContinue = () => {
    if (selectedLocations.length === 0) {
      return;
    }
    router.push(`/create/step5?${new URLSearchParams({ ...params as any, duration: duration.toString() }).toString()}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator currentStep={4} totalSteps={5} labels={STEP_LABELS} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepNum}>Step 4 of 5</Text>
          <Text style={styles.stepTitle}>Define Your Reach</Text>
          <Text style={styles.stepSubtitle}>
            Tell us who you want to reach and through which channels. Final settings are confirmed during platform review.
          </Text>
        </View>

        {/* Reach Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Reach estimates are illustrative. Actual reach depends on ad inventory, bidding, targeting precision, and ad performance. Platform reviewers may adjust settings to comply with advertising policies.
          </Text>
        </View>

        {/* Geographic Targets */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Target Locations <Text style={styles.required}>*</Text></Text>
          <Text style={styles.hint}>Select one or more countries or regions.</Text>
          <View style={styles.chipGrid}>
            {LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.chip,
                  selectedLocations.includes(loc) && styles.chipActive,
                ]}
                onPress={() => toggleLocation(loc)}
              >
                <Text style={[styles.chipText, selectedLocations.includes(loc) && styles.chipTextActive]}>
                  {loc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Audience Age */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Age Range</Text>
          <View style={styles.ageRow}>
            <View style={styles.ageField}>
              <Text style={styles.ageLabel}>Min Age</Text>
              <TextInput
                style={styles.ageInput}
                value={ageMin}
                onChangeText={setAgeMin}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <Text style={styles.ageSeparator}>—</Text>
            <View style={styles.ageField}>
              <Text style={styles.ageLabel}>Max Age</Text>
              <TextInput
                style={styles.ageInput}
                value={ageMax}
                onChangeText={setAgeMax}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>
        </View>

        {/* Audience Interests */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Audience Interests</Text>
          <Text style={styles.hint}>Help us find people who care about these topics.</Text>
          <View style={styles.chipGrid}>
            {AUDIENCE_INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.chip,
                  selectedInterests.includes(interest) && styles.chipActive,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[styles.chipText, selectedInterests.includes(interest) && styles.chipTextActive]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Channels */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Distribution Channels</Text>
          <Text style={styles.hint}>Where should your ads appear?</Text>
          {CHANNELS.map((channel) => (
            <TouchableOpacity
              key={channel.id}
              style={[
                styles.channelCard,
                selectedChannels.includes(channel.id) && styles.channelCardActive,
              ]}
              onPress={() => toggleChannel(channel.id)}
            >
              <Text style={styles.channelIcon}>{channel.icon}</Text>
              <View style={styles.channelInfo}>
                <Text style={[styles.channelLabel, selectedChannels.includes(channel.id) && styles.channelLabelActive]}>
                  {channel.label}
                </Text>
                <Text style={styles.channelDesc}>{channel.desc}</Text>
              </View>
              <View style={[
                styles.channelCheck,
                selectedChannels.includes(channel.id) && styles.channelCheckActive,
              ]}>
                {selectedChannels.includes(channel.id) && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Duration */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Campaign Duration</Text>
          <Text style={styles.hint}>How long should the campaign run once funding is complete?</Text>
          <View style={styles.durationRow}>
            {[7, 14, 21, 30, 45, 60].map((days) => (
              <TouchableOpacity
                key={days}
                style={[styles.durationChip, duration === days && styles.durationChipActive]}
                onPress={() => setDuration(days)}
              >
                <Text style={[styles.durationText, duration === days && styles.durationTextActive]}>
                  {days}d
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Audience Preview */}
        <View style={styles.audiencePreview}>
          <Text style={styles.audiencePreviewTitle}>📊 Estimated Audience Size</Text>
          <Text style={styles.audienceSize}>{formatNumber(estimatedAudienceSize)}+</Text>
          <Text style={styles.audienceNote}>
            People matching your targeting criteria across selected channels.
            This is an estimate for planning purposes only.
          </Text>
          <View style={styles.audienceBreakdown}>
            {selectedLocations.slice(0, 3).map((loc) => (
              <View key={loc} style={styles.audienceBreakdownItem}>
                <Text style={styles.audienceBreakdownLocation}>{loc}</Text>
                <Text style={styles.audienceBreakdownSize}>
                  {formatNumber(loc === 'United States' ? 12000000 : 5000000)}+ people
                </Text>
              </View>
            ))}
          </View>
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

  disclaimer: {
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
    marginBottom: Spacing.xl,
  },
  disclaimerText: { fontSize: FontSizes.sm, color: Colors.text, lineHeight: 18 },

  fieldGroup: { marginBottom: Spacing.xl },
  label: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: 4 },
  required: { color: Colors.error },
  hint: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.sm, lineHeight: 18 },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textSecondary },
  chipTextActive: { color: Colors.textOnPrimary },

  ageRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  ageField: { flex: 1 },
  ageLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 5, fontWeight: FontWeights.semibold },
  ageInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.xl,
    color: Colors.text,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
  },
  ageSeparator: { fontSize: FontSizes.xl, color: Colors.textTertiary, marginTop: 20 },

  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  channelCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '06' },
  channelIcon: { fontSize: 24, width: 32, textAlign: 'center' },
  channelInfo: { flex: 1 },
  channelLabel: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text },
  channelLabelActive: { color: Colors.primary },
  channelDesc: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  channelCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelCheckActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { fontSize: 12, color: Colors.textOnPrimary, fontWeight: FontWeights.bold },

  durationRow: { flexDirection: 'row', gap: Spacing.sm },
  durationChip: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  durationChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  durationText: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.textSecondary },
  durationTextActive: { color: Colors.textOnPrimary },

  audiencePreview: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    ...Shadows.sm,
  },
  audiencePreviewTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.sm },
  audienceSize: { fontSize: FontSizes.huge, fontWeight: FontWeights.extrabold, color: Colors.primary, marginBottom: Spacing.sm },
  audienceNote: { fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 16, marginBottom: Spacing.md },
  audienceBreakdown: { gap: Spacing.sm },
  audienceBreakdownItem: { flexDirection: 'row', justifyContent: 'space-between' },
  audienceBreakdownLocation: { fontSize: FontSizes.sm, color: Colors.text, fontWeight: FontWeights.medium },
  audienceBreakdownSize: { fontSize: FontSizes.sm, color: Colors.textSecondary },

  actions: { flexDirection: 'row', gap: Spacing.md },
  actionBtn: { flex: 1 },
});
