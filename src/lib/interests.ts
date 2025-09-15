export const norm = (s: string) =>
    String(s ?? '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

export const INTEREST_CATEGORIES = [
    {
        title: 'Entertainment & Hobbies',
        tags: ['Music', 'Movies', 'Reading', 'Anime', 'Gaming'],
        emojis: ['🎵', '🎬', '📚', '🎬', '🎮'],
    },
    {
        title: 'LifeStyle & Social',
        tags: ['Drinking', 'Exploring Cafes', 'Traveling', 'Board Games', 'Shopping', 'Beauty', 'Doing Nothing'],
        emojis: ['🍺', '☕️', '✈️', '🧩', '🛍️', '💄️', '🛏️'],
    },
    {
        title: 'Activities & Wellness',
        tags: ['Yoga', 'Running', 'Fitness', 'Camping', 'Dancing', 'Hiking'],
        emojis: ['🧘', '🏃', '🏋️', '🥾', '💃', '⛰️'],
    },
    {
        title: 'Creativity & Personal Growth',
        tags: ['Exhibition', 'Singing', 'Cooking', 'Pets', 'Career', 'Photography'],
        emojis: ['🎨', '🎤', '🍳', '🐶', '💼', '📸'],
    },
    {
        title: 'Korean Culture',
        tags: ['K-Pop Lover', 'K-Drama Lover', 'K-Food Lover'],
        emojis: ['💖', '💖', '🍚'],
    },
];

const fromCategories: Record<string, string> = {};
for (const { tags, emojis } of INTEREST_CATEGORIES) {
    tags.forEach((t, i) => {
        const key = norm(t);
        if (!fromCategories[key]) fromCategories[key] = emojis[i] ?? '';
    });
}

const overrides: Record<string, string> = {
    'exploring cafes': '☕️',
    'exploring cafés': '☕️',
    'kdrama lover': '💖',
    'kpop lover': '💖',
};
Object.assign(fromCategories, overrides);

export const EMOJI_BY_TRAIT: Record<string, string> = fromCategories;

export const getEmojiFor = (label: string): string => {
    return EMOJI_BY_TRAIT[norm(label)] ?? '';
};

export const getEmojisFor = (labels: string[]): string[] =>
    labels.map((l) => getEmojiFor(l));

export const makeEmojiLabels = (labels: string[]): string[] =>
    labels.map((l) => {
        const e = getEmojiFor(l);
        return e ? `${e} ${l}` : l;
    });
