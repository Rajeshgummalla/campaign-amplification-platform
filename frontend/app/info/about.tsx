import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';

export default function AboutScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>About</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoArea}>
          <View style={styles.logoMark}><Text style={styles.logoIcon}>📣</Text></View>
          <Text style={styles.logoText}>Campaigns</Text>
          <Text style={styles.tagline}>Community-Funded Message Amplification</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.body}>
            We believe important messages deserve wider audiences. Too often, critical stories about public health, environmental science, education equity, and community needs fail to reach the people who need to hear them most — because the creators lack advertising budgets.
          </Text>
          <Text style={styles.body}>
            Campaigns is a platform where communities pool resources to amplify verified, well-sourced messages through professional advertising channels. Every campaign is reviewed for accuracy, and every contribution is transparently allocated to ad distribution.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Makes Us Different</Text>
          {[
            { icon: '🔍', title: 'Every Campaign Reviewed', desc: 'Our team reviews content, sources, and assets before any campaign goes live.' },
            { icon: '💡', title: 'Contributions Fund Distribution', desc: 'Backers pay for advertising reach — not direct donations to creators or causes.' },
            { icon: '📊', title: 'Transparent Reporting', desc: 'Verified delivery metrics, clear fee breakdowns, and accountable use of funds.' },
            { icon: '🤝', title: 'Community-Powered', desc: 'Anyone can create a campaign. The community decides what messages deserve amplification.' },
          ].map((item) => (
            <View key={item.title} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{item.icon}</Text>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Values</Text>
          {['Transparency', 'Accuracy', 'Accessibility', 'Accountability', 'Community'].map((val) => (
            <View key={val} style={styles.valueRow}>
              <Text style={styles.valueDot}>●</Text>
              <Text style={styles.valueText}>{val}</Text>
            </View>
          ))}
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Get in Touch</Text>
          <Text style={styles.contactBody}>
            Have questions, feedback, or partnership inquiries?{'\n\n'}
            📧 hello@campaigns.example.com{'\n'}
            🌐 campaigns.example.com{'\n'}
            📍 San Francisco, CA
          </Text>
        </View>

        <View style={styles.linksSection}>
          {['Terms of Service', 'Privacy Policy', 'Community Guidelines', 'Partners'].map((link) => (
            <TouchableOpacity key={link} style={styles.linkItem}>
              <Text style={styles.linkText}>{link}</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          ))}
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

  logoArea: { alignItems: 'center', marginBottom: Spacing.xl },
  logoMark: { width: 64, height: 64, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  logoIcon: { fontSize: 32 },
  logoText: { fontSize: FontSizes.xxl, fontWeight: FontWeights.extrabold, color: Colors.primary },
  tagline: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 },

  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
  body: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 24, marginBottom: Spacing.md },

  featureCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md, ...Shadows.sm },
  featureIcon: { fontSize: 28, width: 36 },
  featureInfo: { flex: 1 },
  featureTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: 3 },
  featureDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 18 },

  valueRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  valueDot: { color: Colors.primary, fontSize: 10 },
  valueText: { fontSize: FontSizes.md, color: Colors.text, fontWeight: FontWeights.medium },

  contactCard: { backgroundColor: Colors.primary + '0C', borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '30', marginBottom: Spacing.xl },
  contactTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
  contactBody: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 26 },

  linksSection: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.sm },
  linkItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  linkText: { fontSize: FontSizes.md, color: Colors.text, fontWeight: FontWeights.medium },
  linkArrow: { color: Colors.textTertiary, fontSize: 16 },
});
