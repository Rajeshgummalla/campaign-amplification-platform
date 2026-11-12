import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCampaignStore } from '../../stores';
import CampaignCard from '../../components/CampaignCard';
import Button from '../../components/Button';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '✍️',
    title: 'Create',
    description: 'Build your campaign message with story, sources, and advertising creatives.',
    color: Colors.primary,
  },
  {
    step: '02',
    icon: '🔍',
    title: 'Review',
    description: 'Our team reviews your content and sources before approving for distribution.',
    color: Colors.secondary,
  },
  {
    step: '03',
    icon: '📣',
    title: 'Amplify',
    description: 'Backers fund the ad distribution cost. Your message reaches new audiences.',
    color: Colors.success,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const allCampaigns = useCampaignStore((s) => s.campaigns);
  const featured = React.useMemo(() => allCampaigns.filter((c) => c.featured), [allCampaigns]);
  const campaigns = React.useMemo(() => allCampaigns.filter((c) => c.status !== 'draft'), [allCampaigns]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoIcon}>📣</Text>
            </View>
            <Text style={styles.logoText}>Campaigns</Text>
          </View>
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>Community-Funded Reach</Text>
            </View>
            <Text style={styles.heroTitle}>
              Help Important Messages Reach Beyond Your Network
            </Text>
            <Text style={styles.heroSubtitle}>
              Create a campaign, get reviewed, and let backers fund your message's reach to audiences that matter.
            </Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroMetaText}>
                ✨ Est. ~100 people reached per dollar contributed
              </Text>
              <Text style={styles.heroMetaNote}>Illustrative estimate only — not a guarantee</Text>
            </View>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => router.push('/explore')}
              >
                <Text style={styles.heroBtnText}>Explore Campaigns</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.heroBtn, styles.heroBtnSecondary]}
                onPress={() => router.push('/create')}
              >
                <Text style={[styles.heroBtnText, styles.heroBtnSecondaryText]}>
                  Start a Campaign
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* How It Works */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <TouchableOpacity onPress={() => router.push('/info/how-it-works')}>
              <Text style={styles.seeAll}>Learn more →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.howItWorks}>
            {HOW_IT_WORKS.map((step, i) => (
              <View key={step.step} style={styles.howCard}>
                <View style={[styles.howIconBg, { backgroundColor: step.color + '18' }]}>
                  <Text style={styles.howIcon}>{step.icon}</Text>
                </View>
                <Text style={[styles.howStep, { color: step.color }]}>{step.step}</Text>
                <Text style={styles.howTitle}>{step.title}</Text>
                <Text style={styles.howDesc}>{step.description}</Text>
                {i < HOW_IT_WORKS.length - 1 && (
                  <View style={styles.howArrow}>
                    <Text style={styles.howArrowText}>→</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              💡 Your contribution pays for <Text style={styles.noteBold}>advertising distribution</Text>, not a direct donation to the campaign creator.
            </Text>
          </View>
        </View>

        {/* Featured Campaigns */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Campaigns</Text>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {featured.slice(0, 3).map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </View>

        {/* Stats Strip */}
        <LinearGradient
          colors={['#F0F9FF', '#EEF2FF']}
          style={styles.statsStrip}
        >
          <Text style={styles.statsTitle}>Platform Overview</Text>
          <Text style={styles.statsNote}>* Demo data for illustration</Text>
          <View style={styles.statsRow}>
            {[
              { value: '1,247', label: 'Campaigns' },
              { value: '\$2.1M', label: 'Funds Raised' },
              { value: '18,000+', label: 'Backers' },
              { value: '180M+', label: 'Est. Reach' },
            ].map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Browse by Category */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {[
              { label: 'Environment', color: '#10B981', emoji: '🌿' },
              { label: 'Health', color: '#EF4444', emoji: '❤️' },
              { label: 'Science', color: '#3B82F6', emoji: '🔬' },
              { label: 'Education', color: '#F59E0B', emoji: '📚' },
              { label: 'Public Policy', color: '#8B5CF6', emoji: '🏛️' },
              { label: 'Community', color: '#F97316', emoji: '🤝' },
              { label: 'Arts & Culture', color: '#EC4899', emoji: '🎨' },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.label}
                style={[styles.categoryChip, { backgroundColor: cat.color + '18', borderColor: cat.color + '40' }]}
                onPress={() => {
                  router.push('/explore');
                }}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoryChipText, { color: cat.color }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* More Campaigns */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Campaigns</Text>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <Text style={styles.seeAll}>Explore →</Text>
            </TouchableOpacity>
          </View>
          {campaigns.slice(0, 4).map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
          <Button
            label="View All Campaigns"
            variant="outline"
            fullWidth
            onPress={() => router.push('/explore')}
          />
        </View>

        {/* CTA Banner */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.ctaBanner}
        >
          <Text style={styles.ctaTitle}>Have a message to share?</Text>
          <Text style={styles.ctaSubtitle}>
            Start your campaign today. Our team reviews every submission to ensure quality and accuracy.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push('/create')}
          >
            <Text style={styles.ctaBtnText}>Create Your Campaign</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          {[
            ['How It Works', '/info/how-it-works'],
            ['About', '/info/about'],
            ['FAQ', '/info/faq'],
          ].map(([label, path]) => (
            <TouchableOpacity key={label} onPress={() => router.push(path as any)}>
              <Text style={styles.footerLink}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.footerNote}>
          © 2024 Campaigns Platform. Contributions fund message distribution, not direct cause support.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: { fontSize: 18 },
  logoText: { fontSize: FontSizes.xl, fontWeight: FontWeights.extrabold, color: Colors.primary },

  hero: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
  },
  heroContent: { padding: Spacing.xl },
  heroPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    marginBottom: Spacing.md,
  },
  heroPillText: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.9)', fontWeight: FontWeights.semibold },
  heroTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textOnPrimary,
    lineHeight: 32,
    marginBottom: Spacing.md,
  },
  heroSubtitle: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  heroMeta: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  heroMetaText: { fontSize: FontSizes.sm, color: Colors.textOnPrimary, fontWeight: FontWeights.semibold },
  heroMetaNote: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  heroActions: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  heroBtn: {
    backgroundColor: Colors.textOnPrimary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flex: 1,
    alignItems: 'center',
    minWidth: 140,
  },
  heroBtnText: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.primary },
  heroBtnSecondary: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  heroBtnSecondaryText: { color: Colors.textOnPrimary },

  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text },
  seeAll: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold },

  howItWorks: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  howCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    position: 'relative',
    ...Shadows.sm,
  },
  howIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  howIcon: { fontSize: 22 },
  howStep: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, marginBottom: 3 },
  howTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: 4, textAlign: 'center' },
  howDesc: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', lineHeight: 14 },
  howArrow: { position: 'absolute', right: -12, top: '40%', zIndex: 1 },
  howArrowText: { fontSize: 18, color: Colors.border },

  noteBox: {
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  noteText: { fontSize: FontSizes.sm, color: Colors.text, lineHeight: 20 },
  noteBold: { fontWeight: FontWeights.bold, color: Colors.info },

  statsStrip: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  statsTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: 2 },
  statsNote: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FontSizes.lg, fontWeight: FontWeights.extrabold, color: Colors.primary },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },

  categoryScroll: { marginBottom: Spacing.lg },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderWidth: 1,
    gap: 5,
  },
  categoryEmoji: { fontSize: 16 },
  categoryChipText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },

  ctaBanner: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  ctaTitle: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.textOnPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  ctaSubtitle: { fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xl },
  ctaBtn: {
    backgroundColor: Colors.textOnPrimary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
  },
  ctaBtnText: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.primary },

  footerLinks: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.md },
  footerLink: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.medium },
  footerNote: { fontSize: FontSizes.xs, color: Colors.textTertiary, textAlign: 'center', paddingHorizontal: Spacing.lg },
});
