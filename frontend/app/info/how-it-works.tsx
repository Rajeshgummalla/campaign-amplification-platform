import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';

export default function HowItWorksScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>How It Works</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>How the Platform Works</Text>
        <Text style={styles.subtitle}>A transparent, community-funded way to amplify verified messages.</Text>

        {[
          {
            num: '01', icon: '✍️', title: 'Create Your Campaign',
            body: `Start by describing your message — what you want people to know, why it matters, and what evidence supports it.\n\nComplete the five-step creation process:\n1. Basics — title, category, creator info\n2. Story — editorial content with sources\n3. Ad Visuals — images and copy for ads\n4. Reach — targeting and channels\n5. Submit — set your funding goal and submit`,
          },
          {
            num: '02', icon: '🔍', title: 'Platform Review',
            body: `Every campaign is reviewed by our team before going live.\n\nWe check:\n• Content accuracy and source quality\n• Advertising assets and copy\n• Compliance with community guidelines\n• Appropriate targeting settings\n\nReview typically takes 2–3 business days. You'll receive notifications about the status.`,
          },
          {
            num: '03', icon: '💳', title: 'Community Backing',
            body: `Once approved, your campaign goes live for backing.\n\nBackers contribute toward your advertising budget. Contributions are pooled until the funding goal is reached (or the campaign period ends).\n\n⚠️ Backers are funding message distribution — not making donations to you or your cause directly.`,
          },
          {
            num: '04', icon: '🚀', title: 'Distribution & Amplification',
            body: `When your campaign reaches its goal, distribution begins.\n\nYour ads run across the channels and audiences you defined, reaching people who wouldn't otherwise see your message.\n\nReal-time reporting shows impressions, clicks, and estimated reach.`,
          },
          {
            num: '05', icon: '📊', title: 'Reports & Accountability',
            body: `After your campaign completes, you receive a full distribution report.\n\nThis includes verified ad spend, impressions, clicks, and estimated reach by channel and audience.\n\nAll metrics are clearly labelled as estimates or verified delivery — we never mix them.`,
          },
        ].map((step) => (
          <View key={step.num} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconBg}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
              </View>
              <View style={styles.stepHeaderText}>
                <Text style={styles.stepNum}>{step.num}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
            </View>
            <Text style={styles.stepBody}>{step.body}</Text>
          </View>
        ))}

        <View style={styles.feeBox}>
          <Text style={styles.feeTitle}>💰 Fee Structure</Text>
          <Text style={styles.feeText}>
            Platform fee: 8% of contributions{'\n'}
            Payment processing: 3% of contributions{'\n'}
            Ad distribution: 89% of contributions{'\n\n'}
            All fees are disclosed before contribution. Unspent ad budget is returned to backers.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, backgroundColor: Colors.surfaceSecondary, borderRadius: BorderRadius.full },
  backBtnText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text },
  topBarTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text },
  content: { padding: Spacing.lg, paddingBottom: 48 },
  title: { fontSize: FontSizes.xxxl, fontWeight: FontWeights.extrabold, color: Colors.text, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.xl },
  stepCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.sm },
  stepHeader: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' },
  stepIconBg: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary + '14', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  stepIcon: { fontSize: 26 },
  stepHeaderText: {},
  stepNum: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: Colors.primary },
  stepTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text },
  stepBody: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 24 },
  feeBox: { backgroundColor: Colors.infoLight, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderLeftWidth: 3, borderLeftColor: Colors.info },
  feeTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
  feeText: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 26 },
});
