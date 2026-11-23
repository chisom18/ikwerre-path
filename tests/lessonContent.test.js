import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  cleanMeaning,
  createQuizOptions,
  selectReviewWords,
  uniqueWordsByIkwerre,
} from '../src/services/lessonContent.js';

const noShuffle = (items) => [...items];
const relatedGroups = [
  ['water', 'milk', 'rain', 'salt'],
  ['home', 'school', 'kitchen', 'church'],
];

test('removes a redundant "means" prefix from imported glosses', () => {
  assert.equal(cleanMeaning('Means water'), 'Water');
  assert.equal(cleanMeaning('This means family'), 'Family');
  assert.equal(cleanMeaning('Water'), 'Water');
});

test('uses meaning-family answers as plausible quiz distractors', () => {
  const words = [
    ['Mini', 'Water'],
    ['Mini-rama', 'Milk'],
    ['Mini-ọlụ', 'Rain'],
    ['Ara', 'Salt'],
  ];
  const options = createQuizOptions(
    words[0],
    1,
    words,
    words,
    relatedGroups,
    noShuffle
  );

  assert.deepEqual(options, ['Water', 'Milk', 'Rain', 'Salt']);
});

test('uses earlier completed lessons for spaced review', () => {
  const lessons = [
    { id: 'one', w: [['Mini', 'Water']] },
    { id: 'two', w: [['Bia', 'Come']] },
    { id: 'three', w: [['Ahia', 'Market']] },
  ];
  const review = selectReviewWords(
    lessons,
    2,
    { one: 1, two: 0 },
    noShuffle,
    2
  );

  assert.deepEqual(review, [['Mini', 'Water']]);
});

test('keeps the first canonical entry when Ikwerre spellings repeat', () => {
  const words = [
    ['Mini', 'Water'],
    ['MINI', 'Means water'],
    ['Ara', 'Salt'],
  ];

  assert.deepEqual(uniqueWordsByIkwerre(words, (word) => word.toLowerCase()), [
    words[0],
    words[2],
  ]);
});
