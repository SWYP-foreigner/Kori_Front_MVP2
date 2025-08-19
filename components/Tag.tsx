import React from 'react';
import styled from 'styled-components/native';

type TagProps = {
    label: string;
};

export default function Tag({ label }: TagProps) {
    return (
        <TagContainer>
            <TagText>{label}</TagText>
        </TagContainer>
    );
}

const TagContainer = styled.View`
    border-width: 1px;
    border-color: #d9d9d9;
    border-radius: 999px;
    padding: 6px 12px;
    margin-right: 6px;
    margin-bottom: 6px;
`;

const TagText = styled.Text`
    font-size: 12px;
    font-family: 'PlusJakartaSans_600Regular';

`;

