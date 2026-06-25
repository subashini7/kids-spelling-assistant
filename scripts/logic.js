// Pure, DOM-free helpers — imported by app.js and the test suite.

export const MASTERY_STREAK = 2;

// With MASTERY_STREAK = 2, a word is scheduled for review exactly once before
// being mastered. Only the first-correct interval is reachable; higher-streak
// entries would require MASTERY_STREAK > 2.
export const SR_INTERVAL_UNASSISTED = 10; // correct on first attempt
export const SR_INTERVAL_ASSISTED   = 3;  // correct after guided retry

// Returns the number of words to wait before showing this word again.
export function computeSRInterval(correct, assisted = false) {
  if (!correct) return 2;
  return assisted ? SR_INTERVAL_ASSISTED : SR_INTERVAL_UNASSISTED;
}

// Returns a new lifetime entry after recording one attempt.
export function updateLifetimeEntry(entry = { correct: 0, errors: 0, streak: 0 }, correct) {
  if (correct) {
    return { ...entry, correct: entry.correct + 1, streak: entry.streak + 1 };
  }
  return { ...entry, errors: entry.errors + 1, streak: 0 };
}

// Returns the masked hint string shown after the first wrong attempt.
export function buildMaskedHint(word) {
  if (word.length <= 2) return word;
  return [...word].map((ch, i) => (i === 0 || i === word.length - 1) ? ch : '_').join(' ') +
    `  (${word.length} letters)`;
}
