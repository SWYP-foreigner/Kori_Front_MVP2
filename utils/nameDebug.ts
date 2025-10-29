export const DEBUG_NAME = true; // 필요 없으면 false

export type NameProbe = {
  picked: string;
  reason: string;
  isAnonymousFlag: boolean;
  candidates: Record<string, string | undefined>;
};

export function probeDisplayName(row: any): NameProbe {
  const isAnonymousFlag =
    !!(row?.isAnonymous ?? row?.anonymous ?? row?.isAnonymousWriter ?? row?.writerAnonymous) ||
    (typeof row?.anonymousYn === 'string' && row.anonymousYn.toUpperCase() === 'Y');

  const candidates: Record<string, string | undefined> = {
    authorName: clean(row?.authorName),
    nickname: clean(row?.nickname),
    memberName: clean(row?.memberName),
    writerName: clean(row?.writerName),
    userName: clean(row?.userName),
    displayName: clean(row?.displayName),
    name: clean(row?.name),
  };

  const firstKey = Object.keys(candidates).find((k) => candidates[k]);
  const firstVal = firstKey ? candidates[firstKey] : undefined;

  const picked = firstVal ?? (isAnonymousFlag ? '익명' : row?.userName === null ? '탈퇴한 회원' : 'Unknown');

  const reason = firstVal
    ? `first-candidate:${firstKey}`
    : isAnonymousFlag
      ? 'server-flag:isAnonymous'
      : row?.userName === null
        ? 'userName:null(deactivated?)'
        : 'fallback:Unknown';

  return { picked, reason, isAnonymousFlag, candidates };
}

function clean(v: any): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

export function logName(where: string, id: number | string, probe: NameProbe, extra?: any) {
  if (!DEBUG_NAME) return;
  try {
    console.groupCollapsed(`[name:${where}] postId=${id} → "${probe.picked}" (${probe.reason})`);

    console.table(probe.candidates);
    if (extra) console.log('extra', extra);
    console.groupEnd();
  } catch {}
}
