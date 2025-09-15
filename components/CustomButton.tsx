import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import styled from 'styled-components/native';

type Tone = 'mint' | 'black' | 'danger' | 'muted';

type ButtonProps = {
    label: string;
    tone?: Tone;
    filled?: boolean;
    isLoading?: boolean;
    disabled?: boolean;
    onPress?: () => void;
    leftIcon?: keyof typeof MaterialIcons.glyphMap;
    rightIcon?: keyof typeof MaterialIcons.glyphMap;
    iconSize?: number;
    borderColor?: string;
    labelColor?: string;
    backgroundColor?: string;
};

const PALETTE = {
    mint: '#30F59B',
    black: '#1D1E1F',
    white: '#FFFFFF',
    danger: '#FF4F4F',
    muted: '#848687',
} as const;

export default function CustomButton({
    label,
    tone = 'mint',
    filled = true,
    isLoading = false,
    disabled,
    onPress,
    leftIcon,
    rightIcon,
    iconSize = 18,
    borderColor, labelColor, backgroundColor,
}: ButtonProps) {
    const defaultText = filled ? (tone === 'mint' ? '#000000' : PALETTE.white) : PALETTE[tone];
    const contentColor = labelColor ?? defaultText;


    return (
        <Btn
            tone={tone}
            filled={filled}
            disabled={disabled || isLoading}
            onPress={onPress}
            style={{
                borderColor: borderColor ?? PALETTE[tone],
                backgroundColor: filled ? (backgroundColor ?? PALETTE[tone]) : 'transparent',
            }}
        >
            {isLoading ? (
                <Spinner color={contentColor} />
            ) : (
                <Content>
                    {leftIcon && (
                        <MaterialIcons name={leftIcon} size={iconSize} color={contentColor} />
                    )}
                    <BtnText tone={tone} filled={filled} style={{ color: contentColor }}>{label}</BtnText>
                    {rightIcon && (
                        <MaterialIcons name={rightIcon} size={iconSize} color={contentColor} />
                    )}
                </Content>
            )}
        </Btn>
    );
}

const Btn = styled.Pressable<{ tone: Tone; filled: boolean; disabled?: boolean }>`
  flex: 1;
  height: 50px;
  min-height: 50px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  border-width: 1px;
  background-color: ${({ filled, tone }) => (filled ? PALETTE[tone] : 'transparent')};
  border-color: ${({ tone }) => PALETTE[tone]};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const Content = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const BtnText = styled.Text<{ tone: Tone; filled: boolean }>`
  font-size: 15px;
  font-family: 'PlusJakartaSans_400Regular';
  color: ${({ tone, filled }) =>
        filled ? (tone === 'mint' ? '#000000' : PALETTE.white) : PALETTE[tone]};
`;

const Spinner = styled.ActivityIndicator.attrs<{ color: string }>(props => ({
    size: 'small',
    color: props.color,
}))``;
