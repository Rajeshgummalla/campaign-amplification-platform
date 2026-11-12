import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';

const FAQS = [
  {
    q: 'What is this platform?',
    a: 'Campaigns is a community-funded advertising platform. People create campaigns around important messages, our team reviews them, and backers contribute toward the cost of distributing those messages to wider audiences through professional ad channels.',
  },
  {
    q: 'Is this a donation platform?',
    a: 'No. When you back a campaign, your contribution pays for advertising distribution — reaching new audiences with the campaign message. Your money does not go directly to the campaign creator or the cause described. Think of it as funding a billboard, not funding a charity.',
  },
  {
    q: 'How are funds used?',
    a: 'Of each contribution:\n• 89% goes to the advertising budget for message distribution\n• 8% is the platform fee for review, hosting, and operations\n• 3% covers payment processing\n\nAll fees are disclosed before you contribute.',
  },
  {
    q: 'Who reviews campaigns?',
    a: 'Our platform team reviews every campaign before it goes live. We check content accuracy, source quality, advertising assets, targeting appropriateness, and compliance with community guidelines. Review typically takes 2–3 business days.',
  },
  {
    q: 'What happens if a campaign doesn\'t reach its goal?',
    a: 'If a campaign doesn\'t reach its funding goal during the campaign period, contributions are refunded to backers minus applicable payment processing fees. The campaign creator can choose to resubmit with adjusted goals.',
  },
  {
    q: 'Can I browse without creating an account?',
    a: 'Yes! You can discover campaigns, read stories, and inspect sources without signing up. You only need an account to create campaigns or back them.',
  },
  {
    q: 'How is reach estimated?',
    a: 'Reach estimates are based on historical advertising data and industry benchmarks (~100 people per dollar of ad spend). Actual reach varies depending on ad platform inventory, targeting precision, creative quality, and market conditions. Estimates are illustrative, not guarantees.',
  },
  {
    q: 'What types of campaigns are allowed?',
    a: 'Campaigns must be factual, well-sourced, and comply with our community guidelines. We support campaigns about environment, health, science, education, public policy, community issues, arts & culture, and more. Campaigns that promote misinformation, hate, violence, or illegal activity are not permitted.',
  },
  {
    q: 'Can I back a campaign anonymously?',
    a: 'Yes. You can choose to back anonymously so your name doesn\'t appear publicly. Your payment records remain accurate for compliance and receipts, but your identity is kept private from other users.',
  },
  {
    q: 'How do I track my campaign\'s performance?',
    a: 'Creators and backers can track campaign progress through their dashboard. During promotion, you\'ll see verified delivery metrics including impressions, clicks, and estimated reach by channel. Final reports are available when the campaign completes.',
  },
  {
    q: 'What\'s the refund policy?',
    a: 'Contributions to campaigns that are cancelled or don\'t reach their goals are refunded minus payment processing fees. Once a campaign enters active distribution, contributions are non-refundable as the advertising spend has been committed. Unspent ad budget at the end of a campaign is returned to backers pro-rata.',
  },
  {
    q: 'How can I contact support?',
    a: 'You can reach our support team at hello@campaigns.example.com. For urgent issues, use the Help section in your profile. We aim to respond within 24 hours.',
  },
];

function FAQItem({ faq }: { faq: typeof FAQS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.faqCard, open && styles.faqCardOpen]}
      onPress={() => setOpen(!open)}
      activeOpacity={0.85}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, open && styles.faqQuestionOpen]}>{faq.q}</Text>
        <Text style={styles.faqToggle}>{open ? '−' : '+'}</Text>
      </View>
      {open && <Text style={styles.faqAnswer}>{faq.a}</Text>}
    </TouchableOpacity>
  );
}

export default function FAQScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>FAQ</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Frequently Asked Questions</Text>
        <Text style={styles.subtitle}>
          Everything you need to know about community-funded campaign amplification.
        </Text>

        {FAQS.map((faq, i) => (
          <FAQItem key={i} faq={faq} />
        ))}

        <View style={styles.contactBox}>
          <Text style={styles.contactIcon}>💬</Text>
          <Text style={styles.contactTitle}>Still have questions?</Text>
          <Text style={styles.contactBody}>
            Reach out to our support team at hello@campaigns.example.com
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

  faqCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  faqCardOpen: { borderColor: Colors.primary + '60', backgroundColor: Colors.primary + '04' },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.md },
  faqQuestion: { flex: 1, fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, lineHeight: 22 },
  faqQuestionOpen: { color: Colors.primary },
  faqToggle: { fontSize: FontSizes.xl, color: Colors.primary, fontWeight: FontWeights.bold, width: 24, textAlign: 'center' },
  faqAnswer: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 24, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },

  contactBox: { backgroundColor: Colors.primary + '0C', borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', marginTop: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '30' },
  contactIcon: { fontSize: 40, marginBottom: Spacing.md },
  contactTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.sm },
  contactBody: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
