/**
 * StepIndicator component for the 3-tap booking wizard.
 *
 * Shows progress through the booking flow:
 * - Step 1: Where (Destination)
 * - Step 2: When (Time)
 * - Step 3: Confirm (Review)
 *
 * Design requirements:
 * - Senior-friendly sizing (large circles, not tiny dots)
 * - Clear visual distinction between completed, current, and pending steps
 * - Accessible with screen readers
 */

import { View, Text } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ['Where', 'When', 'Confirm'];

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <View
      className="flex-row items-center justify-center"
      accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 1,
        max: totalSteps,
        now: currentStep,
      }}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <View key={stepNumber} className="flex-row items-center">
            {/* Step Circle */}
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${
                isCompleted ? 'bg-secondary' : isCurrent ? 'bg-primary' : 'bg-gray-200'
              }`}
              accessibilityLabel={`Step ${stepNumber}: ${STEP_LABELS[index]}, ${
                isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'
              }`}>
              <Text
                className={`text-base font-bold ${
                  isCompleted || isCurrent ? 'text-white' : 'text-gray-500'
                }`}>
                {stepNumber}
              </Text>
            </View>

            {/* Step Label */}
            <Text
              className={`ml-2 text-base font-medium ${
                isCurrent ? 'text-primary' : 'text-gray-500'
              }`}>
              {STEP_LABELS[index]}
            </Text>

            {/* Connector Line */}
            {stepNumber < totalSteps && (
              <View
                className={`mx-3 h-1 w-8 rounded ${isCompleted ? 'bg-secondary' : 'bg-gray-200'}`}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
