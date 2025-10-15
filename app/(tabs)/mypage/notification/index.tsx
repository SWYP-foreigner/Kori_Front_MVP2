import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DetailHeader from '@/components/common/DetailHeader';

export default function NotificationSettingPage() {
  return (
    <Safe edges={[]}>
      <DetailHeader title="Notification" />
      <Body>
        <ListItem></ListItem>
      </Body>
    </Safe>
  );
}

const Safe = styled(SafeAreaView)`
  flex: 1;
  background-color: #1d1e1f;
`;

const Body = styled.View`
  flex: 1;
  padding: 16px;
`;

const ListItem = styled.View``;

const ListTitle = styled.Text``;
