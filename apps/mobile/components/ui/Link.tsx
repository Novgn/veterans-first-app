import { Pressable, Text, type PressableProps } from 'react-native';

export type LinkProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  tone?: 'primary' | 'accent';
  size?: 'sm' | 'md';
};

const toneClass = (tone: NonNullable<LinkProps['tone']>) =>
  tone === 'accent' ? 'text-accent' : 'text-primary';

const sizeClass = (size: NonNullable<LinkProps['size']>) =>
  size === 'sm' ? 'text-sm' : 'text-base';

export function Link({ label, tone = 'primary', size = 'md', onPress, ...rest }: LinkProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={8}
      {...rest}>
      <Text className={`font-semibold underline ${toneClass(tone)} ${sizeClass(size)}`}>
        {label}
      </Text>
    </Pressable>
  );
}
