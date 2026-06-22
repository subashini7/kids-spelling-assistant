# Kids Spelling Assistant

A Progressive Web App (PWA) for kids' spelling practice with audio, instant feedback, automatic mastery tracking, and a structured word bank across three grade levels.

## Features

### Child profiles

When the app first opens a name picker appears. Select an existing name or type a new one. Each child's progress (mastered words, session history, lifetime streaks) is stored separately under their name. Up to ten profiles are remembered. A **Switch child** button in the top bar lets you change profile at any time.

Mastered words are also synced to Firebase Firestore so progress is preserved across devices for the same child name.

### Practice tab

- **Select Grade and Level** — choose Grade 1, Grade 5, or UK 11+; words load automatically when the grade or level changes (no Start button needed)
- **Difficulty selector** (levels 1–5) to control word complexity
- **Hear a word** — reads the word aloud at a slow pace
- **Hear an example** — reads the sample sentence aloud
- **Next word** — picks the next word (spaced repetition aware; see below)
- Type the spelling and press **Enter** (or click **Check**) for instant feedback

#### Wordle-style letter feedback

After every submission, each typed letter appears as a coloured tile:

| Colour | Meaning |
|--------|---------|
| Green | Correct letter, correct position |
| Yellow | Letter is in the word but wrong position |
| Grey | Letter not in the word |
| Red | Extra letters beyond the word length |

#### Guided retry

On the **first** wrong attempt the input clears and a masked hint appears (first and last letter revealed, e.g. `b _ _ _ _ _ _ _ g  (9 letters)`). The child gets one more try before the answer is revealed. Only the original error is recorded — the child is never penalised twice for the same word.

#### Syllable breakdown

After every correct answer or final reveal, the word is shown split into syllables (e.g. `be·gin·ning`) to reinforce the sound-to-spelling connection.

#### Mastery tracking (automatic)

Every correct or wrong answer updates a per-word lifetime record stored in `localStorage`. A word is **mastered** when it is spelled correctly **3 times in a row**:

- The word is removed from the practice pool immediately — mid-session if needed
- The output shows `"running" mastered — won't appear again!`
- Mastered words stay excluded on every future session
- Mastered words are synced to Firestore so they persist across devices

#### Spaced repetition

Words are automatically scheduled for review based on performance. Two interval tracks are used depending on whether the child needed the guided retry:

| Result | Review interval (unassisted) | Review interval (after retry) |
|--------|------------------------------|-------------------------------|
| Wrong | After 2 words | After 2 words |
| 1st correct | After 10 words | After 3 words |
| 2nd correct | After 25 words | After 7 words |
| 3rd+ correct | After 60 words | After 15 words |

When a review word comes due it takes priority over the normal weighted-random pick.

#### Daily Summary

The **Show Summary** button displays:
- Total mastered words (all time) and a note that they are excluded
- Words answered perfectly today (no errors this session)
- Words still needing practice, with error count and accuracy %
- Most common error types

The summary clears automatically when **Next word** is clicked so previous answers don't distract during practice.

### Learn tab

Browse spelling patterns and rules by grade. The Learn tab is available at any time — switching to it hides the practice controls, and switching back restores them.

Each category card shows:
- The rule name and a short pattern hint (e.g. *silent e at the end makes the vowel say its name*)
- Word count for the category

Click **Practice →** on any card to jump straight to the Practice tab filtered to that category. A blue filter bar shows the active category; click **All words** to return to difficulty-level mode.

For **UK 11+**, each card also has a **Study →** button that opens a vocabulary panel with a full definition, synonyms, antonym, spelling tip, and example sentence for every word in the category.

#### Grade 1 categories (23)

Short vowels (a/e/i/o/u) · Long 'a' silent-e / ai / ay · Long 'e' ee / ea · Long 'i' silent-e / ie / y-ending · Long 'o' silent-e / oa · oo sound · ou sound · ow sound · th words · wh words · Blends · r-vowels · Sight words

#### Grade 5 categories (18)

ie vs ei rule · Plurals -ies & -ves · gh/ght patterns · Silent letters · **Double it** (-ing/-ed) · **Don't double** (-ing/-ed) · -tion/-sion · -ous/-ious · -ness/-ment/-less · **Suffix -ful** · Prefixes · Soft c & g · Double consonants · Vowel teams · ch/ph/tch · Homophones · Math & science · General spelling

#### UK 11+ categories (15)

Character & personality · Emotions & feelings · Precise verbs · Setting & atmosphere · Abstract nouns · Latin & Greek roots · -ance/-ence endings · -able/-ible endings · -ous/-ious · -tion/-sion · Advanced prefixes · Silent letters · Double consonants · Homophones · 11+ vocabulary

## Word bank

1,014 words across three grades.

| Grade | Words | Difficulty range |
|-------|-------|-----------------|
| 1 | 212 | 1 – 5 |
| 5 | 544 | 1 – 5 |
| 11+ | 258 | 1 – 5 |

Difficulty is scored from phonics pattern weight, word length, and syllable count, then bucketed into grade-specific quintiles. Each word includes: `category`, `phonicPattern`, `commonMistake`, `memoryTip`, `difficulty`, and `sampleUsage`. Grade 11+ words additionally include `definition`, `synonyms`, and `antonym` for the vocabulary study panel.

## Run locally

Browsers block ES module scripts on `file://`, so use a local server:

```bash
cd kids-spell-check
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## PWA install

The app includes a service worker and web manifest. Open it in Chrome or Safari and use **Add to Home Screen** / **Install app** to install it as a standalone PWA.

The service worker path assumes deployment at `/kids-spelling-assistant/`. Update `manifest.json` and `sw.js` if deploying to a different path.

The service worker uses a mixed caching strategy: **network-first** for `words.json` and `app.js` (to pick up updates), and **cache-first** for all other assets (fast loads). The app works fully offline after the first visit.

## Firebase setup

Mastered words are synced to Firestore under a `children` collection keyed by child name. The project uses `kids-spelling-assistant` on Firebase. Copy `firebase-config.example.js` to `firebase-config.js` and fill in your project credentials to use your own Firestore instance. If Firebase is unreachable (offline or misconfigured) the app falls back gracefully to `localStorage` only.

## File structure

```
kids-spell-check/
├── index.html             # Shell: tab bar, grade selector, Practice pane, Learn pane
├── app.js                 # All app logic (ES module, top-level await)
├── styles.css             # Styles: grade selector, tabs, cards, wordle tiles
├── words.json             # Active word bank (1,014 words with category + difficulty)
├── words_completed.json   # Words removed from practice (already mastered / too easy)
├── firebase-config.js     # Firebase project credentials (not committed)
├── firebase-config.example.js  # Template for firebase-config.js
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker (network-first for JS/JSON, cache-first otherwise)
└── icons/                 # App icons (72 × 72 … 512 × 512)
```
