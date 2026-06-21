import { useEffect, useRef } from 'react';
import { Text, TextInput, View } from 'react-native';

export type OTPFieldProps = {
  length?: number;
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
};

export function OTPField({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error,
  autoFocus = true,
}: OTPFieldProps) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const cells = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputs.current[0]?.focus();
    }
  }, [autoFocus, disabled]);

  const commit = (nextValue: string) => {
    const clean = nextValue.replace(/\D/g, '').slice(0, length);
    onChange(clean);

    // Focus the next empty cell (or the last cell if full).
    const focusIndex = clean.length >= length ? length - 1 : clean.length;
    inputs.current[focusIndex]?.focus();

    if (clean.length === length) {
      onComplete?.(clean);
    }
  };

  const handleChangeText = (index: number, text: string) => {
    const digits = text.replace(/\D/g, '');

    // Empty = user cleared the cell via backspace.
    if (digits.length === 0) {
      const next = cells.slice();
      next[index] = '';
      commit(next.join(''));
      return;
    }

    // Multi-digit input (iOS SMS autofill, clipboard paste, rapid typing):
    // replace the entire value with the digits, starting from this cell.
    if (digits.length > 1) {
      const before = cells.slice(0, index).join('');
      commit(before + digits);
      return;
    }

    // Single digit: set this cell, advance focus, trigger completion if full.
    const next = cells.slice();
    next[index] = digits;
    commit(next.join(''));
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !cells[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View>
      <View className="flex-row justify-between">
        {cells.map((digit, index) => {
          const focusedCandidate = index === Math.min(value.length, length - 1);
          const borderClass = error
            ? 'border-error'
            : focusedCandidate
              ? 'border-primary'
              : 'border-stone-300';
          return (
            <View
              key={index}
              className={`h-16 w-12 items-center justify-center rounded-xl border-[1.5px] bg-white ${borderClass}`}>
              <TextInput
                ref={(r) => {
                  inputs.current[index] = r;
                }}
                className="h-full w-full text-center text-2xl font-bold text-foreground"
                keyboardType="number-pad"
                value={digit}
                editable={!disabled}
                onChangeText={(t) => handleChangeText(index, t)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                autoComplete="sms-otp"
                textContentType="oneTimeCode"
                accessibilityLabel={`Digit ${index + 1} of ${length}`}
                testID={index === 0 ? 'otp-input' : undefined}
              />
            </View>
          );
        })}
      </View>
      {error ? <Text className="mt-3 text-center text-sm text-error">{error}</Text> : null}
    </View>
  );
}
