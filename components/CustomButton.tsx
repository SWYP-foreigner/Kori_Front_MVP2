import styled from 'styled-components/native';

type Tone = 'mint' | 'black';

type ButtonProps = {
    label: string;
    tone?: Tone;
    filled?: boolean;
    isLoading?: boolean;
    disabled?: boolean;
    onPress?: () => void;
};

const PALETTE = {
    mint: '#30F59B',
    black: '#1D1E1F',
    white: '#FFFFFF',
} as const;

export default function CustomButton({
    label,
    tone = 'mint',
    filled = true,
    isLoading = false,
    disabled,
    onPress,
}: ButtonProps) {
    return (
        <Btn
            tone={tone}
            filled={filled}
            disabled={disabled || isLoading}
            onPress={onPress}
        >
            {isLoading ? (
                <Spinner />
            ) : (
                <BtnText tone={tone} filled={filled}>
                    {label}
                </BtnText>
            )}
        </Btn>
    );
}

const Btn = styled.Pressable<{ tone: Tone; filled: boolean; disabled?: boolean }>`
  flex: 1;
  height: 50px
  ;min-height: 50px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  border-width: 1.5px;
  background-color: ${({ filled, tone }) =>
        filled ? PALETTE[tone] : 'transparent'};
  border-color: ${({ tone }) => PALETTE[tone]};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const BtnText = styled.Text<{ tone: Tone; filled: boolean }>`
  font-weight: 700;
  font-size: 15px;
  font-family: 'PlusJakartaSans_600Bold';
  color: ${({ tone, filled }) =>
        filled
            ? tone === 'mint'
                ? '#000000'
                : PALETTE.white
            : PALETTE[tone]};
`;

const Spinner = styled.ActivityIndicator.attrs({
    size: 'small',
})``;
