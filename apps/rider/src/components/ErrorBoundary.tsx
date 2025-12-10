/**
 * Error Boundary component for catching React render errors.
 *
 * Provides a fallback UI when child components throw during rendering.
 * Logs errors for debugging and offers retry functionality.
 */

import { Ionicons } from '@expo/vector-icons';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, Pressable, SafeAreaView } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service in production
    // For now, just console.error (no PII in error messages)
    console.error('ErrorBoundary caught error:', error.message);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-1 items-center justify-center px-6">
            <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-red-100">
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            </View>
            <Text className="mb-2 text-center text-xl font-semibold text-gray-800">
              Something went wrong
            </Text>
            <Text className="mb-8 text-center text-base text-gray-600">
              We encountered an unexpected error. Please try again.
            </Text>
            <Pressable
              onPress={this.handleRetry}
              className="h-[56px] w-full items-center justify-center rounded-xl bg-primary"
              accessibilityLabel="Try again"
              accessibilityRole="button"
              accessibilityHint="Attempts to reload the screen">
              <Text className="text-lg font-semibold text-white">Try Again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
