/**
 * UTC 시간을 HH:MM 형식으로 변환
 */
export const formatTime = (sentAt: string | number): string => {
  const ts = typeof sentAt === 'string' ? Date.parse(sentAt) : sentAt * 1000;
  const date = new Date(ts);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * UTC 초를 YYYY.MM.DD (Weekday) 형식으로 변환
 */
export const formatDate = (utcSeconds: number): string => {
  const date = new Date(utcSeconds * 1000);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const weekday = weekdays[date.getUTCDay()];

  return `${year}.${month}.${day} (${weekday})`;
};
