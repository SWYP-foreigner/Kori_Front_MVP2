import { Category } from '@/components/CategoryChips';

export const CLIENT_TO_SERVER_CAT: Record<Category, '' | 'NEWS' | 'TIP' | 'QNA' | 'EVENT' | 'FREE_TALK' | 'ACTIVITY'> =
  {
    All: '',
    News: 'NEWS',
    Tip: 'TIP',
    'Q&A': 'QNA',
    Event: 'EVENT',
    'Free talk': 'FREE_TALK',
    Activity: 'ACTIVITY',
  };

export const CATEGORY_TO_BOARD_ID: Record<Category, number> = {
  All: 1,
  News: 2,
  Tip: 3,
  'Q&A': 4,
  Event: 5,
  'Free talk': 6,
  Activity: 7,
};
