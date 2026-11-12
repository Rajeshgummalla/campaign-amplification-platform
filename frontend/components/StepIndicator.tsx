import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../constants/theme';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  style?: ViewStyle;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  labels,
  style,
}: StepIndicatorProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Progress Line */}
      <View style={styles.lineContainer}>
        <View style={styles.lineBackground} />
        <View
          style={[
            styles.lineFill,
            { width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` },
          ]}
        />
      </View>

      {/* Steps */}
      <View style={styles.stepsRow}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <View key={stepNum} style={styles.step}>
              <View
                style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isCurrent && styles.dotCurrent,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text style={[styles.dotLabel, isCurrent && styles.dotLabelCurrent]}>
                    {stepNum}
                  </Text>
                )}
              </View>
              {labels && (
                <Text
                  style={[
                    styles.stepLabel,
                    isCurrent && styles.stepLabelCurrent,
                    isCompleted && styles.stepLabelCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {labels[i]}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lineContainer: {
    position: 'absolute',
    top: Spacing.md + 18,
    left: Spacing.lg + 16,
    right: Spacing.lg + 16,
    height: 2,
    zIndex: 0,
  },
  lineBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 2,
    backgroundColor: Colors.border,
    borderRadius: 1,
  },
  lineFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  step: {
    alignItems: 'center',
    width: 56,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  dotCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dotCurrent: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary,
    borderWidth: 2.5,
  },
  dotLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textTertiary,
  },
  dotLabelCurrent: {
    color: Colors.primary,
  },
  checkmark: {
    fontSize: FontSizes.sm,
    color: Colors.textOnPrimary,
    fontWeight: FontWeights.bold,
  },
  stepLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 5,
    textAlign: 'center',
    fontWeight: FontWeights.medium,
  },
  stepLabelCurrent: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  stepLabelCompleted: {
    color: Colors.textSecondary,
  },
});
