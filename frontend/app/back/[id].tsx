import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCampaignStore, useAuthStore, useContributionStore, useNotificationStore } from '../../stores';
import { BackingRecord } from '../../data/types';
import Button from '../../components/Button';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';
import { PRESET_AMOUNTS, REACH_PER_DOLLAR, PLATFORM_FEE_PERCENT, PROCESSING_FEE_PERCENT } from '../../data/seed';

type Step = 'choose' | 'review' | 'payment' | 'confirmation';

function formatCurrency(n: number): string {
  return `\$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

export default function BackCampaignScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const campaign = useCampaignStore((s) => s.getCampaignById(id ?? ''));
  const { contributeToCamera } = useCampaignStore();
  const { user, isLoggedIn, addBacking } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const [step, setStep] = useState<Step>('choose');
  const [amount, setAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/27');
  const [cardCVC, setCardCVC] = useState('123');
  const [processing, setProcessing] = useState(false);

  if (!campaign) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Campaign not found</Text>
          <Button label="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : amount;
  const platformFee = Math.round(finalAmount * PLATFORM_FEE_PERCENT / 100 * 100) / 100;
  const processingFee = Math.round(finalAmount * PROCESSING_FEE_PERCENT / 100 * 100) / 100;
  const totalFees = platformFee + processingFee;
  const total = finalAmount + totalFees;
  const estimatedReach = Math.round(finalAmount * (1 - (PLATFORM_FEE_PERCENT + PROCESSING_FEE_PERCENT) / 100) * REACH_PER_DOLLAR);

  const progress = Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100);
  const newProgress = Math.min(((campaign.raisedAmount + finalAmount) / campaign.targetAmount) * 100, 100);

  const handlePayment = async () => {
    if (finalAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please select or enter a contribution amount.');
      return;
    }

    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000)); // Simulate payment

    // Update store
    contributeToCamera(campaign.id, finalAmount);
    const record: BackingRecord = {
      id: `b-${Date.now()}`,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      campaignImage: campaign.coverImage,
      amount: finalAmount,
      date: new Date().toISOString(),
      status: 'confirmed',
      estimatedReach,
    };
    if (isLoggedIn) addBacking(record);

    addNotification({
      id: `n-${Date.now()}`,
      type: 'contribution_confirmed',
      title: 'Contribution confirmed 💳',
      message: `Your \$${finalAmount.toFixed(0)} contribution to "${campaign.title}" was successful!`,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      timestamp: new Date().toISOString(),
      read: false,
    });

    setProcessing(false);
    setStep('confirmation');
  };

  // ── CHOOSE AMOUNT ──────────────────────────────────────────────────────────
  if (step === 'choose') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Back This Campaign</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Campaign Summary */}
          <View style={styles.campaignSummary}>
            <Text style={styles.campaignTitle} numberOfLines={2}>{campaign.title}</Text>
            <Text style={styles.campaignCreator}>by {campaign.creatorName}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
            </View>
            <Text style={styles.progressText}>
              \${campaign.raisedAmount.toLocaleString()} raised of \${campaign.targetAmount.toLocaleString()}
            </Text>
          </View>

          {/* Fund Use Notice */}
          <View style={styles.fundUseNotice}>
            <Text style={styles.fundUseIcon}>💡</Text>
            <Text style={styles.fundUseText}>
              Your contribution funds <Text style={styles.fundUseBold}>advertising distribution</Text> of this message — not a donation to the creator or cause.
            </Text>
          </View>

          {/* Preset Amounts */}
          <Text style={styles.sectionLabel}>Choose an amount</Text>
          <View style={styles.presetGrid}>
            {PRESET_AMOUNTS.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetChip,
                  amount === preset && !customAmount && styles.presetChipActive,
                ]}
                onPress={() => {
                  setAmount(preset);
                  setCustomAmount('');
                }}
              >
                <Text style={[styles.presetAmount, amount === preset && !customAmount && styles.presetAmountActive]}>
                  \${preset}
                </Text>
                {preset >= 25 && (
                  <Text style={[styles.presetReach, amount === preset && !customAmount && styles.presetReachActive]}>
                    ~{formatNumber(preset * REACH_PER_DOLLAR)} reach
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Amount */}
          <View style={styles.customAmountRow}>
            <Text style={styles.dollarSign}>\$</Text>
            <TextInput
              style={styles.customInput}
              placeholder="Custom amount"
              placeholderTextColor={Colors.textTertiary}
              value={customAmount}
              onChangeText={(v) => {
                setCustomAmount(v);
                setAmount(0);
              }}
              keyboardType="numeric"
            />
          </View>

          {/* Dynamic Reach Preview */}
          {finalAmount > 0 && (
            <View style={styles.reachPreview}>
              <Text style={styles.reachPreviewTitle}>Your estimated impact</Text>
              <Text style={styles.reachPreviewAmount}>~{formatNumber(estimatedReach)}</Text>
              <Text style={styles.reachPreviewLabel}>estimated additional people reached</Text>
              <Text style={styles.reachPreviewNote}>
                Based on ~{REACH_PER_DOLLAR} people per dollar of ad spend. Actual reach varies.
              </Text>
            </View>
          )}

          {/* Anonymous Option */}
          <TouchableOpacity style={styles.anonRow} onPress={() => setIsAnonymous(!isAnonymous)}>
            <View style={[styles.checkbox, isAnonymous && styles.checkboxActive]}>
              {isAnonymous && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <View>
              <Text style={styles.anonLabel}>Back anonymously</Text>
              <Text style={styles.anonHint}>Your name won't appear publicly. Payment records remain accurate.</Text>
            </View>
          </TouchableOpacity>

          {/* Guest Email (if not logged in) */}
          {!isLoggedIn && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email for receipt</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={Colors.textTertiary}
                value={guestEmail}
                onChangeText={setGuestEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          <Button
            label={finalAmount > 0 ? `Continue — ${formatCurrency(finalAmount + totalFees)} total` : 'Select an amount'}
            onPress={() => finalAmount > 0 ? setStep('review') : null}
            fullWidth
            size="lg"
            disabled={finalAmount <= 0}
            style={{ marginTop: Spacing.lg }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── REVIEW ─────────────────────────────────────────────────────────────────
  if (step === 'review') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setStep('choose')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Review Contribution</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewCardTitle}>Your Contribution</Text>

            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Contribution amount</Text>
              <Text style={styles.reviewValue}>{formatCurrency(finalAmount)}</Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Platform fee ({PLATFORM_FEE_PERCENT}%)</Text>
              <Text style={styles.reviewValue}>{formatCurrency(platformFee)}</Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Processing fee ({PROCESSING_FEE_PERCENT}%)</Text>
              <Text style={styles.reviewValue}>{formatCurrency(processingFee)}</Text>
            </View>
            <View style={[styles.reviewRow, styles.reviewTotal]}>
              <Text style={styles.reviewTotalLabel}>Total payment</Text>
              <Text style={styles.reviewTotalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>

          {/* Impact */}
          <View style={styles.impactCard}>
            <Text style={styles.impactTitle}>Your estimated impact</Text>
            <Text style={styles.impactReach}>~{formatNumber(estimatedReach)} people</Text>
            <Text style={styles.impactNote}>Estimated additional reach from your contribution's ad budget ({formatCurrency(finalAmount - totalFees * (finalAmount / total))} of your total)</Text>
          </View>

          {/* Progress Preview */}
          <View style={styles.progressCard}>
            <Text style={styles.progressCardTitle}>Updated campaign progress</Text>
            <View style={styles.progressBarLarge}>
              <View style={[styles.progressFillLarge, { width: `${progress}%` as any }]} />
              <View style={[styles.progressFillNew, { width: `${newProgress - progress}%` as any, left: `${progress}%` as any }]} />
            </View>
            <Text style={styles.progressUpdate}>
              \${(campaign.raisedAmount + finalAmount).toLocaleString()} of \${campaign.targetAmount.toLocaleString()} ({Math.round(newProgress)}%)
            </Text>
          </View>

          {/* Terms */}
          <View style={styles.termsBox}>
            <Text style={styles.termsText}>
              By completing this contribution, you agree to our Terms of Service. Contributions fund advertising distribution of the campaign message. Refunds are subject to our refund policy.
            </Text>
          </View>

          <Button
            label="Proceed to Payment →"
            onPress={() => setStep('payment')}
            fullWidth
            size="lg"
          />
          <Button
            label="← Change Amount"
            variant="ghost"
            onPress={() => setStep('choose')}
            fullWidth
            style={{ marginTop: Spacing.sm }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── PAYMENT ─────────────────────────────────────────────────────────────────
  if (step === 'payment') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setStep('review')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Payment</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Simulated Checkout Banner */}
          <View style={styles.simBanner}>
            <Text style={styles.simBannerIcon}>🧪</Text>
            <Text style={styles.simBannerText}>
              DEMO MODE — Simulated checkout. No real payment processed.
            </Text>
          </View>

          {/* Total */}
          <View style={styles.paymentTotal}>
            <Text style={styles.paymentTotalLabel}>Total to pay</Text>
            <Text style={styles.paymentTotalValue}>{formatCurrency(total)}</Text>
          </View>

          {/* Card Details */}
          <View style={styles.cardSection}>
            <Text style={styles.cardSectionTitle}>💳 Card Details</Text>
            <View style={styles.cardIcons}>
              {['VISA', 'MC', 'AMEX'].map(c => (
                <View key={c} style={styles.cardIcon}><Text style={styles.cardIconText}>{c}</Text></View>
              ))}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
            <View style={styles.cardRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Expiry</Text>
                <TextInput
                  style={styles.input}
                  value={cardExpiry}
                  onChangeText={setCardExpiry}
                  maxLength={5}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>CVC</Text>
                <TextInput
                  style={styles.input}
                  value={cardCVC}
                  onChangeText={setCardCVC}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>Encrypted and secure. We never store card details.</Text>
          </View>

          <Button
            label={processing ? 'Processing...' : `Pay ${formatCurrency(total)}`}
            onPress={handlePayment}
            fullWidth
            size="lg"
            loading={processing}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── CONFIRMATION ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, styles.confirmationContent]}>
        <Text style={styles.confirmIcon}>🎉</Text>
        <Text style={styles.confirmTitle}>Contribution Confirmed!</Text>
        <Text style={styles.confirmSubtitle}>
          Thank you for helping amplify this message. Your contribution is making a difference.
        </Text>

        <View style={styles.confirmCard}>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>Amount</Text>
            <Text style={styles.confirmValue}>{formatCurrency(finalAmount)}</Text>
          </View>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>Campaign</Text>
            <Text style={styles.confirmValue} numberOfLines={2}>{campaign.title}</Text>
          </View>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>Est. Reach</Text>
            <Text style={[styles.confirmValue, { color: Colors.primary }]}>
              ~{formatNumber(estimatedReach)} people
            </Text>
          </View>
          <View style={[styles.confirmRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.confirmLabel}>Status</Text>
            <View style={styles.statusChip}>
              <Text style={styles.statusChipText}>✓ Confirmed</Text>
            </View>
          </View>
        </View>

        <View style={styles.confirmActions}>
          <Button
            label="Track Campaign"
            onPress={() => router.replace(`/campaign/${campaign.id}`)}
            fullWidth
            style={{ marginBottom: Spacing.sm }}
          />
          <Button
            label="View Receipt"
            variant="outline"
            onPress={() => Alert.alert('Receipt', `Contribution of ${formatCurrency(finalAmount)} to ${campaign.title}\nRef: TXN-${Date.now()}`)}
            fullWidth
            style={{ marginBottom: Spacing.sm }}
          />
          <Button
            label="Back to Home"
            variant="ghost"
            onPress={() => router.replace('/(tabs)')}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.lg },
  notFoundText: { fontSize: FontSizes.xl, color: Colors.text },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topBarTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { fontSize: 16, color: Colors.text, fontWeight: FontWeights.bold },
  backBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.full,
  },
  backBtnText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text },

  content: { padding: Spacing.lg, paddingBottom: 48 },
  confirmationContent: { alignItems: 'center' },

  campaignSummary: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  campaignTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: 4 },
  campaignCreator: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  progressText: { fontSize: FontSizes.sm, color: Colors.textSecondary },

  fundUseNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  fundUseIcon: { fontSize: 18 },
  fundUseText: { flex: 1, fontSize: FontSizes.sm, color: Colors.text, lineHeight: 18 },
  fundUseBold: { fontWeight: FontWeights.bold },

  sectionLabel: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: Spacing.md },

  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  presetChip: {
    flex: 1,
    minWidth: 80,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  presetChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  presetAmount: { fontSize: FontSizes.lg, fontWeight: FontWeights.extrabold, color: Colors.text },
  presetAmountActive: { color: Colors.textOnPrimary },
  presetReach: { fontSize: 9, color: Colors.textTertiary, marginTop: 2 },
  presetReachActive: { color: 'rgba(255,255,255,0.8)' },

  customAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dollarSign: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.text },
  customInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.xl,
    color: Colors.text,
    ...Shadows.sm,
  },

  reachPreview: {
    backgroundColor: Colors.primary + '0C',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  reachPreviewTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  reachPreviewAmount: { fontSize: FontSizes.display, fontWeight: FontWeights.extrabold, color: Colors.primary },
  reachPreviewLabel: { fontSize: FontSizes.sm, color: Colors.text, marginBottom: 4 },
  reachPreviewNote: { fontSize: FontSizes.xs, color: Colors.textTertiary, textAlign: 'center' },

  anonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkboxCheck: { fontSize: 12, color: Colors.textOnPrimary, fontWeight: FontWeights.bold },
  anonLabel: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text },
  anonHint: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  fieldGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: 6 },
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

  // Review screen
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  reviewCardTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.lg },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  reviewLabel: { fontSize: FontSizes.md, color: Colors.textSecondary },
  reviewValue: { fontSize: FontSizes.md, color: Colors.text, fontWeight: FontWeights.semibold },
  reviewTotal: { borderBottomWidth: 0, marginTop: Spacing.sm, paddingTop: Spacing.md, borderTopWidth: 2, borderTopColor: Colors.border },
  reviewTotalLabel: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text },
  reviewTotalValue: { fontSize: FontSizes.xxl, fontWeight: FontWeights.extrabold, color: Colors.primary },

  impactCard: {
    backgroundColor: Colors.primary + '0C',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    alignItems: 'center',
  },
  impactTitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: 5 },
  impactReach: { fontSize: FontSizes.xxxl, fontWeight: FontWeights.extrabold, color: Colors.primary },
  impactNote: { fontSize: FontSizes.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: 5 },

  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  progressCardTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
  progressBarLarge: { height: 10, backgroundColor: Colors.border, borderRadius: 5, overflow: 'hidden', position: 'relative', marginBottom: Spacing.sm },
  progressFillLarge: { position: 'absolute', left: 0, top: 0, height: '100%', backgroundColor: Colors.primary, borderRadius: 5 },
  progressFillNew: { position: 'absolute', top: 0, height: '100%', backgroundColor: Colors.success, borderRadius: 5 },
  progressUpdate: { fontSize: FontSizes.sm, color: Colors.textSecondary },

  termsBox: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  termsText: { fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 16 },

  // Payment screen
  simBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  simBannerIcon: { fontSize: 18 },
  simBannerText: { flex: 1, fontSize: FontSizes.sm, color: Colors.text, fontWeight: FontWeights.semibold },

  paymentTotal: { alignItems: 'center', marginBottom: Spacing.xl },
  paymentTotalLabel: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: 5 },
  paymentTotalValue: { fontSize: FontSizes.display, fontWeight: FontWeights.extrabold, color: Colors.text },

  cardSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  cardSectionTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
  cardIcons: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  cardIcon: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardIconText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: Colors.textSecondary },
  cardRow: { flexDirection: 'row', gap: Spacing.md },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  securityIcon: { fontSize: 18 },
  securityText: { fontSize: FontSizes.sm, color: Colors.textSecondary },

  // Confirmation screen
  confirmIcon: { fontSize: 80, marginBottom: Spacing.lg },
  confirmTitle: { fontSize: FontSizes.xxxl, fontWeight: FontWeights.extrabold, color: Colors.text, textAlign: 'center', marginBottom: Spacing.md },
  confirmSubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl, paddingHorizontal: Spacing.lg },
  confirmCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  confirmLabel: { fontSize: FontSizes.md, color: Colors.textSecondary },
  confirmValue: { flex: 1, fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text, textAlign: 'right' },
  statusChip: {
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  statusChipText: { fontSize: FontSizes.sm, color: Colors.success, fontWeight: FontWeights.bold },
  confirmActions: { width: '100%' },
});
