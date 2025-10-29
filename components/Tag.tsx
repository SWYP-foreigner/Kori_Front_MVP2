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
  padding: 5px 10px;
  margin: 0px;
`;

const TagText = styled.Text`
  font-size: 13px;
  font-family: 'PlusJakartaSans_600Regular';
`;
