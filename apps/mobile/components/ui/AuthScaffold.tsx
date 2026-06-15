import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type AuthScaffoldProps = {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  scrollViewProps?: ScrollViewProps;
};

export function AuthScaffold({ header, children, footer, scrollViewProps }: AuthScaffoldProps) {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        {header}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}>
          <View className="flex-1 justify-center py-8">{children}</View>
        </ScrollView>
        {footer ? <View className="px-6 pb-4">{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
