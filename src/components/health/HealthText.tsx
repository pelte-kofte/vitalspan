import React from 'react';
import { Text as NativeText, type TextProps } from 'react-native';

export default function HealthText({ maxFontSizeMultiplier = 1.4, ...props }: TextProps) {
  return <NativeText maxFontSizeMultiplier={maxFontSizeMultiplier} {...props} />;
}
