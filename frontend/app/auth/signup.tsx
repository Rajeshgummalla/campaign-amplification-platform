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
import { useAuthStore } from '../../stores';
import { DEMO_USER } from '../../data/seed';
import Button from '../../components/Button';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';

export default function SignupScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    login({ ...DEMO_USER, name, email });
    setLoading(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.logoArea}>
          <View style={styles.logoMark}>
            <Text style={styles.logoIcon}>📣</Text>
          </View>
          <Text style={styles.logoText}>Campaigns</Text>
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the platform to create campaigns, back causes, and amplify messages.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full Name <Text style={styles.req}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name or organization"
            placeholderTextColor={Colors.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email <Text style={styles.req}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={Colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password <Text style={styles.req}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 8 characters"
            placeholderTextColor={Colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.termsBox}>
          <Text style={styles.termsText}>
            By creating an account you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>,{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>, and{' '}
            <Text style={styles.termsLink}>Community Guidelines</Text>.
          </Text>
        </View>

        <Button
          label="Create Account"
          onPress={handleSignup}
          fullWidth
          size="lg"
          loading={loading}
          disabled={!name.trim() || !email.trim() || password.length < 8}
          style={styles.submitBtn}
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/auth/login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
  title: { fontSize: FontSizes.xxxl, fontWeight: FontWeights.extrabold, color: Colors.text, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.xl },
  fieldGroup: { marginBottom: Spacing.lg },
  label: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: 6 },
  req: { color: Colors.error },
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
  termsBox: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  termsText: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 18, textAlign: 'center' },
  termsLink: { color: Colors.primary, fontWeight: FontWeights.semibold },
  submitBtn: { marginBottom: Spacing.lg },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: FontSizes.md, color: Colors.textSecondary },
  loginLink: { fontSize: FontSizes.md, color: Colors.primary, fontWeight: FontWeights.bold },
});
