import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';

type ButtonProps = PressableProps & {
    label: string;
    variant?: 'filled' | 'outline';
};

export default function CustomButton({ label, variant = 'filled', style, ...props }: ButtonProps) {
    return (
        <Pressable
            style={[
                styles.base,
                variant === 'filled' ? styles.filled : styles.outline,
            ]}
            {...props}
        >
            <Text style={[styles.text, variant === 'outline' && styles.textOutline]}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
    },
    filled: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    outline: {
        backgroundColor: '#fff',
        borderColor: '#000',
    },
    text: {
        fontWeight: '600',
        color: '#fff',
    },
    textOutline: {
        color: '#000',
    },
});
