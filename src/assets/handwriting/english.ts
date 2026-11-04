// Original monoline handwriting. Coordinates describe the pen's travel, not glyph outlines.
const letters: Record<string, { width: number; paths: string[] }> = {
  S: { width: 18, paths: ['M18 5 C13 -1 3 3 5 9 C6 13 17 12 15 19 C13 26 2 25 1 20'] },
  t: { width: 10, paths: ['M1 21 Q5 16 7 5 L4 21 Q4 26 10 20', 'M1 12 L10 11'] },
  i: { width: 7, paths: ['M0 21 L4 14 L2 22 Q3 25 7 20', 'M5 8 L5.2 8'] },
  l: { width: 9, paths: ['M0 21 C15 7 11 -4 6 5 C3 12 0 30 9 20'] },
  c: { width: 12, paths: ['M11 15 C5 8 0 21 4 23 Q8 26 12 20'] },
  u: { width: 14, paths: ['M0 21 L4 14 C-2 29 9 26 11 14 L9 22 Q10 25 14 20'] },
  r: { width: 12, paths: ['M0 21 L4 14 L2 23 Q4 12 8 14 Q10 16 12 14'] },
  o: { width: 13, paths: ['M10 15 C3 9 0 23 5 24 C11 26 14 12 9 14 Q9 20 13 18'] },
  s: { width: 11, paths: ['M0 21 Q6 17 7 12 C4 18 14 23 6 25 Q1 25 2 22 Q7 25 11 20'] },
  m: { width: 21, paths: ['M0 21 L4 14 L2 24 C7 10 12 11 9 23 C14 10 20 11 17 21 Q17 26 21 20'] },
  v: { width: 13, paths: ['M0 21 Q7 10 5 17 L5 23 C10 24 14 12 11 13 Q9 15 13 17'] },
  n: { width: 14, paths: ['M0 21 L4 14 L2 24 C8 10 14 11 11 21 Q11 26 14 20'] },
  g: { width: 14, paths: ['M11 15 C3 9 0 23 5 24 Q9 24 12 14 L8 31 C5 41 -2 34 4 29 L14 20'] },
  f: { width: 12, paths: ['M0 21 C15 4 12 -4 7 4 C3 12 1 36 5 34 Q10 31 5 23 L12 20', 'M1 15 L12 14'] },
  w: { width: 20, paths: ['M0 21 L4 14 Q0 30 8 21 L11 15 Q6 29 15 22 Q20 16 17 14 Q15 16 20 18'] },
  a: { width: 14, paths: ['M11 15 C3 9 0 23 5 24 Q10 25 12 14 L10 22 Q11 25 14 20'] },
  d: { width: 15, paths: ['M11 15 C3 9 0 23 5 24 Q10 25 12 14 L15 3 L10 22 Q11 25 15 20'] },
  '.': { width: 6, paths: ['M2 24 L2.2 24'] },
};

export const englishLines = ['Still curious.', 'Still moving forward.'].map(text => {
  let x = 0;
  const strokes: { d: string; x: number }[] = [];
  for (const letter of text) {
    if (letter === ' ') { x += 7; continue; }
    const glyph = letters[letter];
    if (!glyph) throw new Error(`Missing handwritten letter: ${letter}`);
    for (const d of glyph.paths) strokes.push({d, x});
    x += glyph.width;
  }
  return { text, width: x + 3, strokes };
});
