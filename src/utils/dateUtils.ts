/**
 * 숫자나 문자열을 MM/DD 형식으로 포맷
 */
export function formatShortDate(rawIn: any): string {
  const raw = String(rawIn ?? '').trim();
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}(?!T)/.test(raw)) return raw.slice(5, 10).replace('-', '/');
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.slice(5, 10).replace('-', '/');
  const n = Number(raw);
  if (Number.isFinite(n)) {
    const d = new Date(n > 1e12 ? n : n * 1000);
    if (!isNaN(d.getTime())) {
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${mm}/${dd}`;
    }
  }
  return raw;
}

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

/**
 * 자유게시판 상세조회
 */

export function parseDateFlexible(v?: string | number | Date | null): Date | null {
  if (v == null) return null;

  let s = String(v).trim();

  if (/^\d+(\.\d+)?$/.test(s)) {
    return new Date(parseFloat(s) * 1000);
  }

  if (!s.includes('T') && s.includes(' ')) {
    s = s.replace(' ', 'T');
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * 한 자리 숫자를 2자리 문자열로 포맷 s
 */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/**
 * 날짜를 YYYY/MM/DD 형식으로 포맷
 */
export function formatCreatedYMD(v?: string | number | Date | null): string {
  const d = parseDateFlexible(v);
  if (!d) return '';

  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .format(d)
      .replace(/-/g, '/');
  } catch {
    return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
  }
}
