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
    border-color: #ccc;
    border-radius: 999px;
    padding: 4px 10px;
    margin-right: 6px;
    margin-bottom: 6px;
`;

const TagText = styled.Text`
    font-size: 12px;
`;

