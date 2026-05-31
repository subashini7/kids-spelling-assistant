# Kids Spelling Assistant

A Progressive Web App (PWA) for kids' spelling practice with audio, instant feedback, automatic mastery tracking, and a structured word bank across two grade levels.

## Features

### Practice tab

- **Select Grade and Level** — choose Grade 1 or Grade 5; words load automatically when the grade or level changes (no Start button needed)
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

#### Spaced repetition

Words are automatically scheduled for review based on performance:

| Result | Review interval |
|--------|----------------|
| Wrong | After 2 words |
| 1st correct | After 3 words |
| 2nd correct | After 7 words |
| 3rd+ correct | After 15 words |

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

#### Grade 1 categories (23)

Short vowels (a/e/i/o/u) · Long 'a' silent-e / ai / ay · Long 'e' ee / ea · Long 'i' silent-e / ie / y-ending · Long 'o' silent-e / oa · oo sound · ou sound · ow sound · th words · wh words · Blends · r-vowels · Sight words

#### Grade 5 categories (17)

ie vs ei rule · Plurals -ies & -ves · gh/ght patterns · Silent letters · **Double it** (-ing/-ed) · **Don't double** (-ing/-ed) · -tion/-sion · -ous/-ious · -ness/-ment/-less · Prefixes · Soft c & g · Double consonants · Vowel teams · ch/ph/tch · Homophones · Math & science · General spelling

## Word bank

734 words across two grades.

| Grade | Words | Difficulty range |
|-------|-------|-----------------|
| 1 | 214 | 1 – 5 |
| 5 | 520 | 1 – 5 |

Difficulty is scored from phonics pattern weight, word length, and syllable count, then bucketed into grade-specific quintiles. Each word includes: `category`, `phonicPattern`, `commonMistake`, `memoryTip`, `difficulty`, and `sampleUsage`.

## Run locally

Browsers block ES module scripts on `file://`, so use a local server:

```bash
cd SpellCheckTransformer
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## PWA install

The app includes a service worker and web manifest. Open it in Chrome or Safari and use **Add to Home Screen** / **Install app** to install it as a standalone PWA.

The service worker path assumes deployment at `/kids-spelling-assistant/`. Update `manifest.json` and `sw.js` if deploying to a different path.

## File structure

```
SpellCheckTransformer/
├── index.html             # Shell: tab bar, grade selector, Practice pane, Learn pane
├── app.js                 # All app logic (ES module, top-level await)
├── styles.css             # Styles: grade selector, tabs, cards, wordle tiles
├── words.json             # Active word bank (734 words with category + difficulty)
├── words_completed.json   # Words removed from practice (already mastered / too easy)
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker (cache-first)
└── icons/                 # App icons (32 × 32 … 512 × 512)
```
