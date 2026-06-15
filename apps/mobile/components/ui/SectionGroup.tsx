/**
 * SectionGroup — Rounded white card that groups related ListRows with
 * automatic 1px dividers between children (except after the last child).
 *
 * Callers own outer margins; the group has no outer spacing of its own.
 *
 * Usage:
 *   <SectionGroup>
 *     <ListRow title="Profile" onPress={...} />
 *     <ListRow title="Notifications" onPress={...} />
 *   </SectionGroup>
 */

import { Children, isValidElement, type ReactNode } from 'react';
import { View } from 'react-native';

export type SectionGroupElevation = 'none' | 'sm';

export type SectionGroupProps = {
  children: ReactNode;
  elevation?: SectionGroupElevation;
  className?: string;
};

export function SectionGroup({ children, elevation = 'sm', className }: SectionGroupProps) {
  // Children.toArray already strips null, undefined, and boolean values and
  // flattens fragments while assigning stable keys.
  const childArray = Children.toArray(children);
  const lastIndex = childArray.length - 1;

  const base = 'bg-white rounded-2xl overflow-hidden';
  const elevationClass = elevation === 'sm' ? 'shadow-sm' : '';
  const classes = [base, elevationClass, className].filter(Boolean).join(' ');

  return (
    <View className={classes}>
      {childArray.map((child, index) => {
        const isLast = index === lastIndex;
        const dividerClass = isLast ? '' : 'border-b border-stone-100';
        // Provide a stable-enough key: prefer the child's own key, otherwise index.
        const key = isValidElement(child) && child.key != null ? child.key : index;
        return (
          <View key={key} className={dividerClass}>
            {child}
          </View>
        );
      })}
    </View>
  );
}
