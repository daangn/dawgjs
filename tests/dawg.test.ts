import { createDawg } from '../src/dawg';

test('getPrefixes()', () => {
  const wg = createDawg([
    '스타벅스사사삭',
    '스타벅스',
    '스타벅',
    '스타',
    '스',
    '스타트',
    '파스타벅스',
  ]);
  expect(wg.getPrefixes('스타벅스강남역점')).toEqual(['스', '스타', '스타벅', '스타벅스']);
  expect(wg.getPrefixes('스타트')).toEqual(['스', '스타', '스타트']);
});

test('getLongestPrefix()', () => {
  const wg = createDawg([
    '스타벅스사사삭',
    '스타벅스',
    '스타벅',
    '스타',
    '스',
    '스타트',
    '파스타벅스',
  ]);
  expect(wg.getLongestPrefix('스타벅스강남역점')).toEqual('스타벅스');
})

test('getSubstrings()', () => {
  const tests = [
    {
      words: ['병원', '의원', '최고의', '최상의'],
      input: '최고의한의원',
      expected: ['최고의', '의원'],
    },
    {
      words: ['떡볶이', '순대', '제일'],
      input: '나는떡볶이가제일좋아',
      expected: ['떡볶이', '제일'],
    },
    {
      words: [''],
      input: '',
      expected: [],
    },
  ];
  for (const test of tests) {
    const wg = createDawg(test.words);
    expect(wg.getSubstrings(test.input)).toEqual(test.expected);
  }
});

test('wordsCount', () => {
  const dataset = [
    {
      words: ['스타벅스', '스타벅스멜론', '스타', '스타멜론'],
      expectedCount: 4,
    },
    {
      words: [],
      expectedCount: 0,
    },
    {
      words: [''],
      expectedCount: 0,
    },
    {
      words: ['스타벅스', '스타벅스'],
      expectedCount: 1,
    },
  ];

  for (const { words, expectedCount } of dataset) {
    const wg = createDawg(words);
    expect(wg.wordsCount).toBe(expectedCount)
  }
});

test('nodesCount', () => {
  const tests = [
    { words: ['스타벅스', '스타벅스멜론', '스타', '스타멜론'], expectedCount: 6 },
    { words: [], expectedCount: 0 },
  ];
  for (const test of tests) {
    const wg = createDawg(test.words);
    expect(wg.nodesCount).toBe(test.expectedCount);
  }
});
