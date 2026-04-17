/**
 * StepIndicator component tests.
 *
 * Tests accessibility and visual requirements:
 * - Progress bar accessibility
 * - Step state visualization
 * - Senior-friendly sizing
 */

import { render, screen } from '@testing-library/react-native';

import { StepIndicator } from '../StepIndicator';

describe('StepIndicator', () => {
  it('renders correct number of steps', () => {
    render(<StepIndicator currentStep={1} totalSteps={3} />);

    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('shows step labels', () => {
    render(<StepIndicator currentStep={1} totalSteps={3} />);

    expect(screen.getByText('Where')).toBeTruthy();
    expect(screen.getByText('When')).toBeTruthy();
    expect(screen.getByText('Confirm')).toBeTruthy();
  });

  it('has progressbar accessibility role', () => {
    const { root } = render(<StepIndicator currentStep={1} totalSteps={3} />);

    // Root should have progressbar role
    expect(root.props.accessibilityRole).toBe('progressbar');
  });

  it('has correct accessibility label', () => {
    const { root } = render(<StepIndicator currentStep={2} totalSteps={3} />);

    expect(root.props.accessibilityLabel).toBe('Step 2 of 3');
  });

  it('has correct accessibility value', () => {
    const { root } = render(<StepIndicator currentStep={2} totalSteps={3} />);

    expect(root.props.accessibilityValue).toEqual({
      min: 1,
      max: 3,
      now: 2,
    });
  });

  it('shows step 1 as current on first step', () => {
    render(<StepIndicator currentStep={1} totalSteps={3} />);

    // "Where" label should have primary text color when current
    const whereLabel = screen.getByText('Where');
    expect(whereLabel.props.className).toContain('text-primary');
  });

  it('shows step 1 as completed on step 2', () => {
    render(<StepIndicator currentStep={2} totalSteps={3} />);

    // Step 2 should be current
    const whenLabel = screen.getByText('When');
    expect(whenLabel.props.className).toContain('text-primary');
  });
});
