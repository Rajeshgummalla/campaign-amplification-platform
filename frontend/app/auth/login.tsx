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
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores';
import { DEMO_USER } from '../../data/seed';
import Button from '../../components/Button';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { loginAsRole, login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const selectPersona = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setEmail('nanigummalla418@gmail.com');
      setPassword('Munni1314$');
    } else {
      setEmail('alex@example.com');
      setPassword('backer123');
    }
  };

  const handleQuickLogin = (role: 'admin' | 'user') => {
    loginAsRole(role);
    router.back();
  };

  const handleLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const em = email.trim().toLowerCase();
    if (
      em === 'nanigummalla418@gmail.com' ||
      em.includes('nanigummalla') ||
      em.includes('admin') ||
      password === 'Munni1314$'
    ) {
      loginAsRole('admin');
    } else if (em === 'alex@example.com' || em.includes('backer') || em.includes('alex')) {
      loginAsRole('user');
    } else if (em.length > 0) {
      const displayName = em.split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Active Supporter';
      const customUser = {
        id: `user-${Date.now()}`,
        name: displayName,
        email: email.trim(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
        bio: 'Community member advocating for public welfare and transparent causes.',
        joinedAt: new Date().toISOString().split('T')[0],
        role: 'user' as const,
        backedCount: 0,
        createdCount: 0,
        totalContributed: 0,
      };
      login(customUser, []);
    } else {
      loginAsRole('user');
    }

    setLoading(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoMark}>
            <Text style={styles.logoIcon}>📣</Text>
          </View>
          <Text style={styles.logoText}>Campaigns</Text>
          <Text style={styles.tagline}>Community-Funded Message Amplification</Text>
        </View>

        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Select Admin or User to experience role-specific access, or enter credentials manually.</Text>

        {/* 1-Tap Persona Switcher Cards: Admin & User */}
        <Text style={styles.sectionHeading}>Instant Role Login (1-Tap)</Text>
        <View style={styles.personasGrid}>
          {/* Admin */}
          <TouchableOpacity
            style={[styles.personaCard, styles.adminCard]}
            onPress={() => handleQuickLogin('admin')}
          >
            <View style={styles.personaTop}>
              <Text style={styles.personaRoleBadge}>🛡️ Platform Administrator</Text>
              <Text style={styles.personaAction}>Log In →</Text>
            </View>
            <Text style={styles.personaName}>Nani Gummalla (Admin)</Text>
            <Text style={styles.personaDesc}>Full admin control: campaign moderation, approvals, reviews, and platform metrics.</Text>
            <Text style={styles.personaEmail}>nanigummalla418@gmail.com</Text>
          </TouchableOpacity>

          {/* User */}
          <TouchableOpacity
            style={[styles.personaCard, styles.backerCard]}
            onPress={() => handleQuickLogin('user')}
          >
            <View style={styles.personaTop}>
              <Text style={styles.personaRoleBadge}>👤 Regular User / Backer</Text>
              <Text style={styles.personaAction}>Log In →</Text>
            </View>
            <Text style={styles.personaName}>Alex Rivera (User)</Text>
            <Text style={styles.personaDesc}>Explore campaigns, fund message amplification reach, and track ad distribution.</Text>
            <Text style={styles.personaEmail}>alex@example.com</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or enter credentials manually</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="nanigummalla418@gmail.com or alex@example.com"
            placeholderTextColor={Colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Your password (e.g. Munni1314$)"
              placeholderTextColor={Colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.showPasswordBtn}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.credentialHints}>
            <Text style={styles.hintLabel}>Quick fill: </Text>
            <TouchableOpacity onPress={() => selectPersona('admin')}>
              <Text style={styles.hintTag}>Admin (Nani)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => selectPersona('user')}>
              <Text style={styles.hintTag}>User (Alex)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button
          label="Sign In"
          onPress={handleLogin}
          fullWidth
          size="lg"
          loading={loading}
          style={styles.loginBtn}
        />

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/auth/signup')}>
            <Text style={styles.signupLink}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.guestNote}>
          You can also <Text style={styles.guestLink}>browse campaigns without an account</Text> — no sign-in required.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: Spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeBtnText: { fontSize: 16, color: Colors.text, fontWeight: FontWeights.bold },

  content: { padding: Spacing.xl, paddingBottom: 48 },

  logoArea: { alignItems: 'center', marginBottom: Spacing.xl, marginTop: Spacing.lg },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  logoIcon: { fontSize: 32 },
  logoText: { fontSize: FontSizes.xxl, fontWeight: FontWeights.extrabold, color: Colors.primary },
  tagline: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },

  title: { fontSize: FontSizes.xxxl, fontWeight: FontWeights.extrabold, color: Colors.text, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.xl },

  sectionHeading: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  personasGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  personaCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  adminCard: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF608',
  },
  creatorCard: {
    borderColor: '#0284C7',
    backgroundColor: '#0284C708',
  },
  backerCard: {
    borderColor: '#10B981',
    backgroundColor: '#10B98108',
  },
  personaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  personaRoleBadge: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  personaAction: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  personaName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.text,
    marginBottom: 2,
  },
  personaDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  personaEmail: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.textTertiary,
  },

  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSizes.sm, color: Colors.textSecondary },

  credentialHints: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  hintLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  hintTag: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  fieldGroup: { marginBottom: Spacing.lg },
  label: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: 6 },
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
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 60 },
  showPasswordBtn: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  showPasswordText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold },
  forgotPassword: { fontSize: FontSizes.sm, color: Colors.primary, marginTop: 8, textAlign: 'right' },

  loginBtn: { marginBottom: Spacing.lg },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.xl },
  signupText: { fontSize: FontSizes.md, color: Colors.textSecondary },
  signupLink: { fontSize: FontSizes.md, color: Colors.primary, fontWeight: FontWeights.bold },
  guestNote: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  guestLink: { color: Colors.primary, fontWeight: FontWeights.semibold },
});
