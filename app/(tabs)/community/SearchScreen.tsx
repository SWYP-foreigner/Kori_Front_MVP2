import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React, { forwardRef, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput as RNTextInput, TextInputProps } from 'react-native';
import styled from 'styled-components/native';

const StyledInput = styled(RNTextInput)`
  flex: 1;
  color: #e6e9ec;
  font-size: 16px;
  padding: 0;
`;
const SearchInput = forwardRef<RNTextInput, TextInputProps>((props, ref) => (
    <StyledInput ref={ref} {...props} />
));
SearchInput.displayName = 'SearchInput';

export default function SearchScreen() {
    const [q, setQ] = useState('');
    const inputRef = useRef<RNTextInput>(null);

    const submit = () => {
        const keyword = q.trim();
        if (!keyword) return;
    };

    return (
        <Safe>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
            >
                <Header>
                    <Back onPress={() => router.back()}>
                        <AntDesign name="left" size={20} color="#ffffff" />
                    </Back>

                    <SearchBox onPress={() => inputRef.current?.focus()}>
                        <Icon>
                            <AntDesign name="search1" size={16} color="#9aa0a6" />
                        </Icon>
                        <SearchInput
                            ref={inputRef}
                            value={q}
                            onChangeText={setQ}
                            placeholder="Search Anything"
                            placeholderTextColor="#9aa0a6"
                            returnKeyType="search"
                            onSubmitEditing={submit}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </SearchBox>

                    <RightSlot />
                </Header>

                <Body />
            </KeyboardAvoidingView>
        </Safe>
    );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background: #171818;
`;

const Header = styled.View`
  padding: 12px 16px 10px 16px;
  flex-direction: row;
  align-items: center;
`;

const Back = styled(Pressable)`
  width: 40px;
  align-items: flex-start;
  justify-content: center;
`;

const RightSlot = styled.View`
  width: 8px; /* 균형 맞추기용 작은 더미 */
`;

const SearchBox = styled(Pressable)`
  flex: 1;
  height: 40px;
  background: #2a2b2c;
  border-radius: 10px;
  flex-direction: row;
  align-items: center;
  padding: 0 12px;
  margin: 0 8px;
`;

const Icon = styled.View`
  width: 20px;
  align-items: center;
  margin-right: 8px;
`;

const Body = styled.View`
  flex: 1;
  background: #171818;
`;
