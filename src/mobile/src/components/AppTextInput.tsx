import React from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { colors } from '../theme';

export const AppTextInput = (props: TextInputProps) => (
  <TextInput
    {...props}
    placeholderTextColor={props.placeholderTextColor ?? colors.muted}
    style={[{ color: colors.foreground, backgroundColor: colors.card }, props.style]}
  />
);
