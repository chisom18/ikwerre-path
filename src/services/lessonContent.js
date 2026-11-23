export function cleanMeaning(value) {
  const text = String(value).trim();
  const prefix = /^(?:this\s+)?means\s+/i.exec(text);
  if (!prefix) return text;
  const meaning = text.slice(prefix[0].length).trim();
  return meaning.charAt(0).toUpperCase() + meaning.slice(1);
}

function optionTokens(text) {
  return (
    String(text)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .match(/[a-z0-9]+/g) || []
  );
}

function optionDistance(a, b, side) {
  const aTokens = optionTokens(a);
  const bTokens = optionTokens(b);
  const overlap = aTokens.filter((token) => bTokens.includes(token)).length;
  let prefixLength = 0;

  while (
    prefixLength < a.length &&
    prefixLength < b.length &&
    a[prefixLength].toLowerCase() === b[prefixLength].toLowerCase()
  ) {
    prefixLength++;
  }

  const tokenPenalty = Math.abs(aTokens.length - bTokens.length) * 32;
  const lengthPenalty = Math.abs(a.length - b.length) * 0.7;
  return tokenPenalty + lengthPenalty - (side === 1 ? overlap * 24 : prefixLength * 1.5);
}

export function createQuizOptions(word, side, allWords, unitWords, relatedGroups, shuffle) {
  const answer = word[side];
  const familyKey = optionTokens(word[1]).join(' ');
  const family = relatedGroups.find((group) => group.includes(familyKey));
  const entries = allWords.filter(
    (candidate) => candidate !== word && candidate[side] !== answer
  );
  const familyWords = family
    ? entries.filter((candidate) => family.includes(optionTokens(candidate[1]).join(' ')))
    : [];
  const lessonWords = unitWords.filter(
    (candidate) => candidate !== word && candidate[side] !== answer
  );
  const unique = [
    ...new Map(
      [...familyWords, ...lessonWords, ...entries].map((candidate) => [
        optionTokens(candidate[side]).join(' '),
        candidate,
      ])
    ).values(),
  ];
  const ranked = unique
    .map((candidate) => ({
      candidate,
      score:
        optionDistance(answer, candidate[side], side) +
        (familyWords.includes(candidate) || lessonWords.includes(candidate) ? 0 : 12) +
        Math.random() * 5,
    }))
    .sort((a, b) => a.score - b.score);

  const preferred = familyWords.length >= 3 ? familyWords : ranked.map(({ candidate }) => candidate);
  const distractors = [];
  for (const candidate of shuffle(preferred)) {
    if (
      distractors.length < 3 &&
      !distractors.some(
        (option) => optionTokens(option).join(' ') === optionTokens(candidate[side]).join(' ')
      )
    ) {
      distractors.push(candidate[side]);
    }
  }

  if (distractors.length < 3) {
    for (const candidate of shuffle(entries)) {
      if (
        distractors.length < 3 &&
        !distractors.some(
          (option) => optionTokens(option).join(' ') === optionTokens(candidate[side]).join(' ')
        )
      ) {
        distractors.push(candidate[side]);
      }
    }
  }

  const result = shuffle([answer, ...distractors]);
  return result;
}

export function uniqueWordsByIkwerre(words, normalize) {
  const unique = new Map();
  for (const word of words) {
    const key = normalize(word[0]);
    if (!unique.has(key)) unique.set(key, word);
  }
  return [...unique.values()];
}

export function selectReviewWords(lessons, lessonIndex, completed, shuffle, limit = 2) {
  const previousWords = lessons
    .slice(0, lessonIndex)
    .filter((lesson) => completed[lesson.id])
    .flatMap((lesson) => lesson.w);
  const unique = new Map(previousWords.map((word) => [word[0], word]));
  return shuffle([...unique.values()]).slice(0, limit);
}
