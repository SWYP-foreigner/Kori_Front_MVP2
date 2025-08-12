import { PressableProps } from 'react-native';
import styled from 'styled-components/native';

type Variant = 'filled' | 'outline';
type VariantProps = { variant: Variant };

type ButtonProps = PressableProps & {
    label: string;
    variant?: 'filled' | 'outline';
};

export default function CustomButton({ label, variant = 'filled', ...props }: ButtonProps) {
    return (
        <StyledPressable variant={variant} {...props}>
            <StyledText variant={variant}>{label}</StyledText>
        </StyledPressable>
    );
}

const StyledPressable = styled.Pressable <VariantProps>`
  flex: 1;
  padding-vertical: 10px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  border-width: 1px;
  background-color: ${({ variant }: VariantProps) => variant === 'filled' ? '#000' : '#fff'};
  border-color: #000;
`;

const StyledText = styled.Text<VariantProps>`
  font-weight: 600;
  color: ${({ variant }: VariantProps) => variant === 'filled' ? '#fff' : '#000'};
  `;