# Kids Spelling Assistant

A Progressive Web App (PWA) for kids' spelling practice with audio, instant feedback, automatic mastery tracking, and a structured word bank across two grade levels.

## Features

### Practice tab

- **Grade selector** — choose Grade 1 or Grade 5 directly (no name entry needed)
- **Difficulty selector** (levels 1–5) to control word complexity
- Click **Start** to load words for the selected grade and level
- **Hear a word** — reads the word aloud at a slow pace
- **Hear an example** — reads the sample sentence aloud
- **Next word** — picks a new word, weighted toward words you've made errors on
- Type the spelling and press **Enter** (or click **Check**) for instant feedback
- Shows a memory tip when the answer is wrong

#### Mastery tracking (automatic)

Every correct or wrong answer updates a per-word lifetime record stored in `localStorage`. A word is **mastered** when it is spelled correctly **3 times in a row**:

- The word is removed from the practice pool immediately — mid-session if needed
- The output shows `"running" mastered — it won't appear again`
- Mastered words stay excluded on every future Start

The **Daily Summary** shows:
- Total mastered words (all time) and a note that they are excluded
- Words answered perfectly today (no errors this session)
- Words still needing practice, with error count and accuracy %
- Most common error types

Once any word is mastered, an **Export Mastered Words** button appears in the summary. It downloads `mastered_grade1.json` or `mastered_grade5.json` — full word objects in the same schema as `words_completed.json` — so you can merge them into that file to keep the word bank tidy.

### Learn tab

Organise practice by spelling pattern or rule. Select a grade and click Start first; the Learn tab then shows one card per category for that grade. Each card shows:

- The rule name and a short pattern hint
- Two of the easiest example words
- Total word count for the category

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

### Doubling rule (grade 5)

**Do double** — verb ends in 1 vowel + 1 consonant:
`run → running` · `stop → stopped` · `begin → beginning` · `commit → committed`

**Don't double:**
- Ends in a vowel team: `sleep → sleeping` · `peal → pealed` · `wait → waited`
- Ends in 2 consonants: `arrest → arrested` · `rest → rested`
- Stress on first syllable: `hap·pen → happened` · `o·pen → opened`

## Merging exported mastered words

After exporting from the app, run this one-liner to append the new entries to `words_completed.json`:

```bash
python3 - << 'EOF'
import json

with open('words_completed.json') as f:
    completed = json.load(f)

with open('mastered_grade5.json') as f:   # or mastered_grade1.json
    new_words = json.load(f)

existing = {w['word'].lower() for w in completed}
added = [w for w in new_words if w['word'].lower() not in existing]
completed.extend(added)

with open('words_completed.json', 'w') as f:
    json.dump(completed, f, indent=2)

print(f"Added {len(added)} words to words_completed.json")
EOF
```

To also remove them from `words.json` (so they never load again):

```bash
python3 - << 'EOF'
import json

with open('words_completed.json') as f:
    completed = {w['word'].lower() for w in json.load(f)}

with open('words.json') as f:
    words = json.load(f)

before = len(words)
words = [w for w in words if w['word'].lower() not in completed]

with open('words.json', 'w') as f:
    json.dump(words, f, indent=2)

print(f"Removed {before - len(words)} words from words.json")
EOF
```

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
├── index.html             # Shell: tab bar, Practice pane, Learn pane
├── app.js                 # All app logic (ES module, top-level await)
├── styles.css             # Styles: grade selector, tabs, cards, difficulty stepper
├── words.json             # Active word bank (734 words with category + difficulty)
├── words_completed.json   # Words removed from practice (already mastered / too easy)
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker (cache-first)
└── icons/                 # App icons (32 × 32 … 512 × 512)
```
