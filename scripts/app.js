
import { MASTERY_STREAK, computeSRInterval, updateLifetimeEntry, buildMaskedHint } from './logic.js';

// Firebase is loaded dynamically so the app still works offline if the CDN is unreachable.
let db = null, _doc = null, _getDoc = null, _setDoc = null;
try {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
  const fs = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
  const { firebaseConfig } = await import('./firebase-config.js');
  db      = fs.getFirestore(initializeApp(firebaseConfig));
  _doc    = fs.doc;
  _getDoc = fs.getDoc;
  _setDoc = fs.setDoc;
} catch (e) {
  console.warn('Firebase SDK unavailable (offline?):', e);
}

let currentChild = '';

function childSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24);
}

// ─── DOM refs ────────────────────────────────────────────────────────────────
const statusEl        = document.getElementById("status");
const audioBtn        = document.getElementById("hear-btn");
const audioExampleBtn = document.getElementById("hear-ex-btn");
const nextWordBtn     = document.getElementById("next-word-btn");
const submitAnsBtn    = document.getElementById("submit-ans-btn");
const grade1Btn       = document.getElementById("grade-1-btn");
const grade5Btn       = document.getElementById("grade-5-btn");
const grade11PlusBtn  = document.getElementById("uk-11-plus-btn");
const childInput      = document.getElementById("child-input");
const output          = document.getElementById("output");
const celebration     = document.getElementById("celebration");
const showSummaryBtn  = document.getElementById("show-summary-btn");
const dailySummaryContent = document.getElementById("daily-summary-content");
const diffDecBtn      = document.getElementById("diff-dec");
const diffIncBtn      = document.getElementById("diff-inc");
const diffDisplay     = document.getElementById("diff-value");
// Tabs & Learn
const tabBtnPractice  = document.getElementById("tab-btn-practice");
const tabBtnLearn     = document.getElementById("tab-btn-learn");
const tabPractice     = document.getElementById("tab-practice");
const tabLearn        = document.getElementById("tab-learn");
const catGrid         = document.getElementById("cat-grid");
const learnPrompt     = document.getElementById("learn-prompt");
const filterBar       = document.getElementById("filter-bar");
const filterLabel     = document.getElementById("filter-label");
const clearFilterBtn  = document.getElementById("clear-filter-btn");
const vocabPanel      = document.getElementById("vocab-panel");
const vocabPanelTitle = document.getElementById("vocab-panel-title");
const vocabPanelContent = document.getElementById("vocab-panel-content");
const vocabCloseBtn   = document.getElementById("vocab-close-btn");
// Child picker
const childOverlay    = document.getElementById("child-picker-overlay");
const childList       = document.getElementById("child-list");
const newChildInput   = document.getElementById("new-child-input");
const newChildBtn     = document.getElementById("new-child-btn");
const childBar        = document.getElementById("child-bar");
const childBarName    = document.getElementById("child-bar-name");
const childSwitchBtn  = document.getElementById("child-switch-btn");

// ─── Category metadata ───────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  "short-a": "Short 'a'", "short-e": "Short 'e'",
  "short-i": "Short 'i'", "short-o": "Short 'o'", "short-u": "Short 'u'",
  "long-a-silent-e":  "Long 'a' — silent e",
  "long-a-ai":        "Long 'a' — ai (snail)",
  "long-a-ay":        "Long 'a' — ay (play)",
  "long-e-ee":        "Long 'e' — ee (tree)",
  "long-e-ea":        "Long 'e' — ea (leaf)",
  "long-i-silent-e":  "Long 'i' — silent e",
  "long-i-ie":        "Long 'i' — ie (pie)",
  "long-i-y":         "Long 'i' — y ending (fly)",
  "long-o-silent-e":  "Long 'o' — silent e",
  "long-o-oa":        "Long 'o' — oa (boat)",
  "oo-sound":         "oo sound",
  "ou-sound":         "ou sound (ouch)",
  "ow-sound":         "ow sound (cow)",
  "th-digraph":       "th words",
  "wh-digraph":       "wh words",
  "consonant-blends": "Blends",
  "r-controlled":     "r-vowels",
  "sight-words":      "Sight words",
  "ie-ei-rule":           "ie vs ei rule",
  "plural-ies-ves":       "Plurals: -ies & -ves",
  "gh-ght-pattern":       "gh / ght patterns",
  "silent-letters":       "Silent letters",
  "doubling-rule":        "Double it: -ing / -ed",
  "no-double-rule":       "Don't double: -ing / -ed",
  "suffix-tion-sion":     "-tion / -sion words",
  "suffix-ous-ious":      "-ous / -ious words",
  "suffix-ness-ment-less": "-ness / -ment / -less",
  "ful-vs-full":           "Suffix -ful means full of",
  "prefix-words":          "Prefixes re-, un-, dis-",
  "soft-c-g":             "Soft c & g sounds",
  "double-consonant":     "Double consonants",
  "vowel-teams":          "Vowel teams",
  "consonant-patterns":   "ch, ph, tch patterns",
  "homophones":           "Easily confused pairs",
  "math-science":         "Math & science terms",
  "general-spelling":     "General spelling",
  "latin-greek-roots":    "Latin & Greek roots",
  "suffix-ance-ence":     "-ance / -ence endings",
  "suffix-able-ible":     "-able / -ible endings",
  "prefix-advanced":      "Advanced prefixes",
  "vocabulary-11plus":    "11+ vocabulary",
  "character-adjectives": "Character & personality",
  "emotions-feelings":    "Emotions & feelings",
  "precise-verbs":        "Precise verbs",
  "setting-atmosphere":   "Setting & atmosphere",
  "abstract-nouns":       "Abstract nouns",
};

const CATEGORY_HINTS = {
  "short-a": "cat · bat · sad",          "short-e": "bed · hen · pet",
  "short-i": "sit · big · pin",          "short-o": "hop · fog · pop",
  "short-u": "bug · run · cup",
  "long-a-silent-e": "cake · whale · late — silent e at the end makes the vowel say its name",
  "long-a-ai": "rain · snail · wait — when two vowels go walking, the first one does the talking",
  "long-a-ay": "play · say · way — ay usually comes at the end of a word",
  "long-e-ee": "tree · feet · see — when two vowels go walking, the first one does the talking",
  "long-e-ea": "leaf · read · eat — when two vowels go walking, the first one does the talking",
  "long-i-silent-e": "bike · ride · time — silent e at the end makes the vowel say its name",
  "long-i-ie": "pie · tie · lie",        "long-i-y": "fly · cry · sky — y at the end of a word says long i",
  "long-o-silent-e": "bone · nose · rose — silent e at the end makes the vowel say its name",
  "long-o-oa": "boat · goat · road — when two vowels go walking, the first one does the talking",
  "oo-sound": "moon · look · clue — oo has two sounds: long (moon) and short (look)",
  "ou-sound": "out · house · round",     "ow-sound": "cow · down · now",
  "th-digraph": "this · three · with",   "wh-digraph": "when · where · why",
  "consonant-blends": "snap · clam · press",
  "r-controlled": "car · her · bird — r after a vowel changes its sound: ar, er, ir, or, ur",
  "sight-words": "said · was · because",
  "ie-ei-rule": "beLIEve · recEIve — i before e except after c",
  "plural-ies-ves": "city→cities · knife→knives — consonant+y → -ies · -f or -fe → -ves",
  "gh-ght-pattern": "night · thought · caught — gh is silent in -igh, -aught, -ought patterns",
  "silent-letters": "knife · gnome · wreck — kn- (k silent) · gn- (g silent) · wr- (w silent) · -mb (b silent)",
  "doubling-rule": "run→running · stop→stopped · begin→beginning — short stressed vowel + 1 consonant at the end? double it",
  "no-double-rule": "sleep→sleeping · arrest→arrested · happen→happened — two vowels, two consonants, or unstressed ending: don't double",
  "suffix-tion-sion": "nation · tension · question — no reliable rule; memorise each word",
  "suffix-ous-ious": "famous · delicious · various",
  "suffix-ness-ment-less": "kindness · movement · useless",
  "ful-vs-full": "hopeful · careful · helpful — the suffix -ful has ONE l; only the standalone word full has two l's",
  "prefix-words": "re- · un- · dis- · mis- — re=again · un=not · dis=opposite · mis=wrongly",
  "soft-c-g": "centre · gentle · giant — c or g before e, i, or y → soft sound: c→s, g→j",
  "double-consonant": "address · mirror · beginning",
  "vowel-teams": "could · journey · beautiful",
  "consonant-patterns": "phone · watch · cheer — ph makes f sound · tch comes after a short vowel · qui (short i) vs que (short e): quick vs question",
  "homophones": "steal/steel · weather/whether",
  "math-science": "fraction · element · planet",
  "general-spelling": "mixed vocabulary practice",
  "latin-greek-roots": "benevolent · chronological — bene=good · chrono=time · graph=writing",
  "suffix-ance-ence": "resilience · exuberance — no reliable rule; memorise which ending each word takes",
  "suffix-able-ible": "irresistible · formidable — -ible after complete root words · -able otherwise (no rule)",
  "prefix-advanced": "unprecedented · extraordinary — un/in=not · extra=beyond · over/under=degree",
  "vocabulary-11plus": "enigmatic · tenacious · sceptical — advanced 11+ exam vocabulary",
  "character-adjectives": "aloof · haughty · nonchalant — words that describe how a person behaves or what they are like",
  "emotions-feelings": "anguish · trepidation · euphoria — words for emotional states and inner feelings",
  "precise-verbs": "scrutinise · endeavour · vanquish — exact action words that replace vague verbs",
  "setting-atmosphere": "ethereal · forlorn · tempestuous — words that describe a scene, mood, or place",
  "abstract-nouns": "integrity · adversity · sovereignty — complex ideas that cannot be physically touched",
};

const G1_CAT_ORDER = [
  "short-a","short-e","short-i","short-o","short-u",
  "long-a-silent-e","long-a-ai","long-a-ay",
  "long-e-ee","long-e-ea",
  "long-i-silent-e","long-i-ie","long-i-y",
  "long-o-silent-e","long-o-oa",
  "oo-sound","ou-sound","ow-sound",
  "th-digraph","wh-digraph","consonant-blends","r-controlled","sight-words",
];

const G5_CAT_ORDER = [
  "ie-ei-rule","plural-ies-ves","gh-ght-pattern","silent-letters",
  "doubling-rule","no-double-rule",
  "suffix-tion-sion","suffix-ous-ious","suffix-ness-ment-less","ful-vs-full",
  "prefix-words","soft-c-g","double-consonant","vowel-teams",
  "consonant-patterns","homophones","math-science","general-spelling",
];

const G11_CAT_ORDER = [
  "character-adjectives","emotions-feelings","precise-verbs",
  "setting-atmosphere","abstract-nouns",
  "latin-greek-roots","suffix-ance-ence","suffix-able-ible",
  "suffix-ous-ious","suffix-tion-sion","prefix-advanced",
  "silent-letters","double-consonant","homophones","vocabulary-11plus",
];

// ─── Mastery helpers ─────────────────────────────────────────────────────────

function masteryKey(g)  { return `spellquest_mastered_${childSlug(currentChild)}_g${g}`; }
function lifetimeKey(g) { return `spellquest_lifetime_${childSlug(currentChild)}_g${g}`; }

function loadMasteredSet(g) {
  try {
    const raw = localStorage.getItem(masteryKey(g));
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function saveMasteredSet(g, set) {
  localStorage.setItem(masteryKey(g), JSON.stringify([...set]));
}

function loadLifetime(g) {
  try {
    const raw = localStorage.getItem(lifetimeKey(g));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveLifetime(g, stats) {
  localStorage.setItem(lifetimeKey(g), JSON.stringify(stats));
}

// ─── Firebase / Firestore ─────────────────────────────────────────────────────

function fsGradeKey(g) {
  return `mastered_g${String(g).replace('+', 'plus')}`;
}

async function syncFromFirestore(childName) {
  if (!db) return;
  try {
    const snap = await _getDoc(_doc(db, 'children', childName));
    if (!snap.exists()) return;
    const data = snap.data();
    for (const g of [1, 5, '11+']) {
      const arr = data[fsGradeKey(g)];
      if (Array.isArray(arr) && arr.length) {
        const merged = new Set([...loadMasteredSet(g), ...arr]);
        saveMasteredSet(g, merged);
      }
    }
  } catch (e) {
    console.warn('Firestore sync skipped (offline?):', e);
  }
}

function pushMasteredToFirestore(g) {
  if (!db || !currentChild) return;
  const words = [...loadMasteredSet(g)];
  _setDoc(_doc(db, 'children', currentChild), { [fsGradeKey(g)]: words }, { merge: true })
    .catch(e => console.warn('Firestore write skipped:', e));
}

// ─── State ───────────────────────────────────────────────────────────────────
const SESSION_KEY = (g) =>
  `spellquest_session_${childSlug(currentChild)}_g${g}_${new Date().toISOString().slice(0, 10)}`;
let currentWordObj = null;
let lastWord       = null;
let grade          = 5;
let difficulty     = 2;
let categoryFilter = null;
let session        = loadTodaySession(grade);
let words          = [];
let allWordsCache  = null;
let masteredWords  = loadMasteredSet(grade);
let retryMode      = false;
let srQueue        = []; // [{ wordObj, dueIn }]

// ─── Child picker ─────────────────────────────────────────────────────────────

const CHILDREN_KEY      = 'spellquest_children';
const CURRENT_CHILD_KEY = 'spellquest_current_child';

function getChildrenList() {
  try { return JSON.parse(localStorage.getItem(CHILDREN_KEY) || '[]'); }
  catch { return []; }
}

function addChildToList(name) {
  const list = getChildrenList().filter(n => n !== name);
  list.unshift(name);
  localStorage.setItem(CHILDREN_KEY, JSON.stringify(list.slice(0, 10)));
}

function showChildPicker() {
  const children = getChildrenList();
  childList.innerHTML = children.length
    ? children.map(n => `<button type="button" class="child-name-btn" data-name="${esc(n)}">${esc(n)}</button>`).join('')
    : '';
  childList.style.display = children.length ? 'flex' : 'none';
  newChildInput.value = '';
  childOverlay.style.display = 'flex';
}

async function selectChild(name) {
  name = (name || '').trim();
  if (!name) { newChildInput.focus(); return; }
  currentChild = name;
  localStorage.setItem(CURRENT_CHILD_KEY, currentChild);
  addChildToList(currentChild);
  childBarName.textContent = currentChild;
  childBar.hidden = false;
  childOverlay.style.display = 'none';
  statusEl.innerText = 'Syncing…';
  await syncFromFirestore(currentChild);
  try {
    await startPractice();
  } catch (e) {
    statusEl.innerText = `Error loading words: ${e.message}`;
  }
}

childList.addEventListener('click', (e) => {
  const btn = e.target.closest('.child-name-btn');
  if (btn) selectChild(btn.dataset.name);
});
newChildBtn.onclick = () => selectChild(newChildInput.value);
newChildInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); selectChild(newChildInput.value); }
});
childSwitchBtn.onclick = showChildPicker;

// ─── Tab switching ───────────────────────────────────────────────────────────
function switchTab(name) {
  const isPractice = name === "practice";
  tabBtnPractice.classList.toggle("is-active", isPractice);
  tabBtnLearn.classList.toggle("is-active", !isPractice);
  tabPractice.hidden = !isPractice;
  tabLearn.hidden = isPractice;
}
tabBtnPractice.onclick = () => switchTab("practice");
tabBtnLearn.onclick    = () => switchTab("learn");

// ─── Start practice (loads words for current grade/difficulty/filter) ─────────
async function startPractice() {
  srQueue = [];
  retryMode = false;
  session = loadTodaySession(grade);
  masteredWords = loadMasteredSet(grade);

  let autoAdvancedFrom = null;

  if (categoryFilter) {
    statusEl.innerText = `Loading "${CATEGORY_LABELS[categoryFilter] || categoryFilter}"...`;
    words = await loadWordsForGrade(grade, difficulty, categoryFilter);
  } else {
    statusEl.innerText = `Loading grade ${grade}, level ${difficulty}...`;
    words = await loadWordsForGrade(grade, difficulty, null);

    // If this level is empty (all mastered), advance to the nearest level that has words.
    if (words.length === 0) {
      const others = [1, 2, 3, 4, 5]
        .filter((l) => l !== difficulty)
        .sort((a, b) => Math.abs(a - difficulty) - Math.abs(b - difficulty));
      for (const lvl of others) {
        const candidate = await loadWordsForGrade(grade, lvl, null);
        if (candidate.length > 0) {
          autoAdvancedFrom = difficulty;
          difficulty = lvl;
          diffDisplay.textContent = difficulty;
          words = candidate;
          break;
        }
      }
    }
  }

  const label = categoryFilter
    ? `"${CATEGORY_LABELS[categoryFilter] || categoryFilter}"`
    : `grade ${grade}, level ${difficulty}`;
  statusEl.innerText = autoAdvancedFrom
    ? `Level ${autoAdvancedFrom} complete — moved to level ${difficulty} (${words.length} words).`
    : words.length
      ? `Loaded ${words.length} words (${label}).`
      : `No words found for ${label}.`;

  setGameBtnsDisabled(words.length === 0);
  currentWordObj = null;
  output.innerText = words.length
    ? `Grade ${grade} ready! Click "Next word" to begin.`
    : `No words found. Try a different level or category.`;
  childInput.focus();
  buildLearnTab(grade);
}

// ─── Grade selector ──────────────────────────────────────────────────────────
async function selectGrade(g) {
  grade = g;
  grade1Btn.classList.toggle("is-active", g === 1);
  grade5Btn.classList.toggle("is-active", g === 5);
  grade11PlusBtn.classList.toggle("is-active", g === "11+");
  await startPractice();
}
grade1Btn.onclick     = () => selectGrade(1);
grade5Btn.onclick     = () => selectGrade(5);
grade11PlusBtn.onclick = () => selectGrade("11+");

// ─── Difficulty stepper ──────────────────────────────────────────────────────
diffDecBtn.onclick = () => {
  if (difficulty > 1) { difficulty -= 1; diffDisplay.textContent = difficulty; startPractice(); }
};
diffIncBtn.onclick = () => {
  if (difficulty < 5) { difficulty += 1; diffDisplay.textContent = difficulty; startPractice(); }
};

// ─── Filter bar ──────────────────────────────────────────────────────────────
clearFilterBtn.onclick = async () => {
  categoryFilter = null;
  filterBar.hidden = true;
  await startPractice();
};

// ─── Read-only input until focused (prevents iOS auto-keyboard) ──────────────
childInput.setAttribute("readonly", "true");
childInput.addEventListener("focus", () => childInput.removeAttribute("readonly"));

// ─── Word loading ─────────────────────────────────────────────────────────────
// Cache the Promise so concurrent callers share one fetch instead of racing.
function fetchWords() {
  if (!allWordsCache) {
    allWordsCache = fetch("data/words.json").then((r) => {
      if (!r.ok) throw new Error(`data/words.json ${r.status}`);
      return r.json();
    });
  }
  return allWordsCache;
}

async function loadWordsForGrade(g, diff, cat) {
  const all = await fetchWords();
  return all
    .filter((w) => {
      if (String(w.grade) !== String(g)) return false;
      if (masteredWords.has(w.word.toLowerCase())) return false; // skip mastered
      if (cat) return w.category === cat;
      return Number(w.difficulty) === Number(diff);
    })
    .map((w) => ({
      word: w.word,
      phonicPattern: w.phonicPattern,
      memoryTip: w.memoryTip,
      sampleUsage: w.sampleUsage,
    }));
}

function setGameBtnsDisabled(disabled) {
  audioBtn.disabled = disabled;
  nextWordBtn.disabled = disabled;
  audioExampleBtn.disabled = disabled;
}

// ─── Session ─────────────────────────────────────────────────────────────────
function loadTodaySession(g) {
  try {
    const raw = localStorage.getItem(SESSION_KEY(g));
    return raw
      ? JSON.parse(raw)
      : { date: new Date().toISOString().slice(0, 10), words: {} };
  } catch {
    return { date: new Date().toISOString().slice(0, 10), words: {} };
  }
}

// Records attempt in today's session AND updates lifetime streak.
// Returns true if the word was newly mastered this attempt.
function recordAttempt(nextSession, word, correct, errorType = null) {
  if (!word) return false;
  const wordKey = word.toLowerCase();

  // Today's session
  if (!nextSession.words[word]) {
    nextSession.words[word] = { correct: 0, errors: 0, errorTypes: [] };
  }
  const entry = nextSession.words[word];
  if (correct) {
    entry.correct += 1;
  } else {
    entry.errors += 1;
    if (errorType) entry.errorTypes.push(errorType);
  }
  localStorage.setItem(SESSION_KEY(grade), JSON.stringify(nextSession));

  // Lifetime streak
  const lifetime = loadLifetime(grade);
  lifetime[wordKey] = updateLifetimeEntry(lifetime[wordKey], correct);
  saveLifetime(grade, lifetime);

  // Check mastery threshold
  const newlyMastered =
    !masteredWords.has(wordKey) && lifetime[wordKey].streak >= MASTERY_STREAK;
  if (newlyMastered) {
    masteredWords.add(wordKey);
    saveMasteredSet(grade, masteredWords);
    pushMasteredToFirestore(grade);
    words = words.filter((w) => w.word.toLowerCase() !== wordKey);
    if (words.length === 0) setGameBtnsDisabled(true);
  }

  return newlyMastered;
}

// ─── HTML escape ─────────────────────────────────────────────────────────────
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESC_MAP[c]);

// ─── Syllabify ────────────────────────────────────────────────────────────────
const DIGRAPHS = new Set(['ch','sh','th','wh','ph','ck','ng','gh','wr','kn','gn','mb','tch']);
const BLENDS   = new Set(['bl','br','cl','cr','dr','fl','fr','gl','gr','pl','pr','sc','sk','sl','sm','sn','sp','st','sw','tr','tw','qu','dw']);

function syllabify(word) {
  const w = word.toLowerCase();
  if (w.length <= 3) return word;
  const isVowel = (c) => 'aeiouy'.includes(c);

  const nuclei = [];
  let i = 0;
  while (i < w.length) {
    if (isVowel(w[i])) {
      const start = i;
      while (i < w.length && isVowel(w[i])) i++;
      nuclei.push({ start, end: i - 1 });
    } else { i++; }
  }

  // Drop trailing silent e, but NOT in -Cle endings (trouble, table, simple)
  // where the -le forms its own syllable.
  const isCle = w.endsWith('le') && !isVowel(w[w.length - 3]);
  if (
    !isCle &&
    nuclei.length > 1 && w.endsWith('e') &&
    !isVowel(w[w.length - 2]) &&
    nuclei[nuclei.length - 1].start === w.length - 1
  ) nuclei.pop();

  if (nuclei.length <= 1) return word;

  const breaks = [];
  for (let n = 0; n < nuclei.length - 1; n++) {
    const after  = nuclei[n].end + 1;
    const before = nuclei[n + 1].start;
    const cons   = w.slice(after, before);
    // For -Cle words, the final syllable is always -Cle: split 2 before the vowel.
    if (isCle && n === nuclei.length - 2 && cons.length >= 2) {
      breaks.push(before - 2);
    } else if (cons.length <= 1) {
      breaks.push(after);
    } else if (cons.length === 2) {
      breaks.push((DIGRAPHS.has(cons) || BLENDS.has(cons)) ? after : after + 1);
    } else {
      const last2 = cons.slice(-2);
      breaks.push((DIGRAPHS.has(last2) || BLENDS.has(last2)) ? before - 2 : before - 1);
    }
  }

  let result = '', prev = 0;
  for (const b of breaks) { result += word.slice(prev, b) + '·'; prev = b; }
  return result + word.slice(prev);
}

// ─── Wordle ───────────────────────────────────────────────────────────────────
function computeWordleColors(typed, target) {
  const t = target.toLowerCase();
  const u = typed.toLowerCase();
  const colors = Array(u.length).fill('absent');
  const tLeft  = t.split('');

  for (let i = 0; i < u.length && i < t.length; i++) {
    if (u[i] === t[i]) { colors[i] = 'correct'; tLeft[i] = null; }
  }
  for (let i = 0; i < Math.min(u.length, t.length); i++) {
    if (colors[i] === 'correct') continue;
    const idx = tLeft.indexOf(u[i]);
    if (idx !== -1) { colors[i] = 'present'; tLeft[idx] = null; }
  }
  for (let i = t.length; i < u.length; i++) colors[i] = 'extra';
  return colors;
}

function buildWordleHTML(typed, target) {
  if (!typed) return '';
  const colors = computeWordleColors(typed, target);
  const spans  = [...typed].map((ch, i) =>
    `<span class="wl-${colors[i] || 'extra'}">${esc(ch)}</span>`
  );
  for (let i = typed.length; i < target.length; i++) {
    spans.push(`<span class="wl-missing">_</span>`);
  }
  return `<div class="wordle-row">${spans.join('')}</div>`;
}

// ─── Spaced repetition ────────────────────────────────────────────────────────

function tickSR() {
  srQueue.forEach((item) => { item.dueIn -= 1; });
}

function scheduleSR(wordObj, correct, assisted = false) {
  srQueue = srQueue.filter((item) => item.wordObj.word !== wordObj.word);
  srQueue.push({ wordObj, dueIn: computeSRInterval(correct, assisted) });
}

function getDueSRWord(pool, previousWord) {
  const poolSet = new Set(pool.map((w) => w.word));
  const due = srQueue.filter(
    (item) => item.dueIn <= 0 && item.wordObj.word !== previousWord && poolSet.has(item.wordObj.word)
  );
  return due.length ? due[Math.floor(Math.random() * due.length)].wordObj : null;
}

// ─── Speech ──────────────────────────────────────────────────────────────────
function speakWord(word) {
  window.speechSynthesis.cancel();
  // Resume first — required on Android Chrome to prevent silent playback after idle
  window.speechSynthesis.resume();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang   = "en-GB";
  utterance.rate   = 0.7;   // 0.5 can cause near-silence on Android TTS engines
  utterance.pitch  = 1.1;
  utterance.volume = 1;
  utterance.onerror = (e) => console.error("SpeechSynthesisUtterance error", e);
  window.speechSynthesis.speak(utterance);
}

// ─── Word selection (weighted by errors) ─────────────────────────────────────
function selectRandomWord(pool, wordStats, previousWord = null) {
  const candidates = pool.filter((e) => e.word !== previousWord);
  const usable = candidates.length ? candidates : pool;
  const weights = usable.map((e) => {
    const s = wordStats[e.word];
    if (!s) return 3;
    if (s.errors === 0) return 0.5;
    return 1 + s.errors * 2;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < usable.length; i += 1) {
    rand -= weights[i];
    if (rand <= 0) return usable[i];
  }
  return usable[0];
}

// ─── Summary ─────────────────────────────────────────────────────────────────
function buildSummary(sess) {
  const ws = sess.words;
  const mastered = Object.entries(ws)
    .filter(([, s]) => s.errors === 0 && s.correct > 0)
    .map(([w]) => w);
  const struggling = Object.entries(ws)
    .filter(([, s]) => s.errors > 0)
    .sort((a, b) => b[1].errors - a[1].errors)
    .map(([w, s]) => ({
      word: w, errors: s.errors, correct: s.correct,
      accuracy: Math.round((s.correct / (s.correct + s.errors)) * 100),
    }));
  const errorTypeCounts = {};
  Object.values(ws).forEach(({ errorTypes }) => {
    errorTypes.forEach((t) => { errorTypeCounts[t] = (errorTypeCounts[t] || 0) + 1; });
  });
  const topErrorTypes = Object.entries(errorTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));
  return { mastered, struggling, topErrorTypes, date: sess.date };
}

function formatSummaryText(summary) {
  const lines = [];
  lines.push(`Date: ${summary.date}`);

  // Lifetime mastery (all time, across sessions)
  if (masteredWords.size > 0) {
    lines.push("");
    lines.push(`Mastered words (${masteredWords.size} total — won't appear in practice):`);
    lines.push([...masteredWords].sort().join(", "));
  }

  lines.push("");

  if (summary.mastered.length) {
    lines.push(`Perfect today — no errors (${summary.mastered.length}):`);
    lines.push(summary.mastered.join(", "));
    lines.push("");
  }
  if (summary.struggling.length) {
    lines.push("Words to keep practicing:");
    summary.struggling.forEach((s) => {
      lines.push(`- ${s.word}: ${s.errors} error(s), ${s.correct} correct (${s.accuracy}%)`);
    });
    lines.push("");
  }
  if (summary.topErrorTypes.length) {
    lines.push("Most common error types:");
    summary.topErrorTypes.forEach((e) => { lines.push(`- ${e.type}: ${e.count}`); });
  }
  if (lines.filter((l) => l.trim()).length <= 1) return "No attempts recorded yet today.";
  return lines.join("\n");
}

// ─── Celebration ─────────────────────────────────────────────────────────────
function playCelebration() {
  if (!celebration) return;
  celebration.innerHTML = "";
  const colors = ["#f59e0b", "#22c55e", "#3b82f6", "#ec4899", "#a855f7"];
  for (let i = 0; i < 22; i += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.background = colors[i % colors.length];
    sparkle.style.animationDelay = `${Math.random() * 160}ms`;
    celebration.appendChild(sparkle);
  }
  setTimeout(() => { celebration.innerHTML = ""; }, 1200);
}

// ─── Learn tab builder ───────────────────────────────────────────────────────
async function buildLearnTab(g) {
  const all = await fetchWords();
  const gradeWords = all.filter((w) => String(w.grade) === String(g));
  const byCategory = {};
  for (const w of gradeWords) {
    const cat = w.category || "general-spelling";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(w);
  }
  const order = g === 1 ? G1_CAT_ORDER : g === "11+" ? G11_CAT_ORDER : G5_CAT_ORDER;
  const sorted = Object.keys(byCategory).sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1; if (ib === -1) return -1;
    return ia - ib;
  });
  catGrid.innerHTML = "";
  vocabPanel.hidden = true;
  learnPrompt.hidden = true;
  for (const cat of sorted) {
    const catWords = byCategory[cat];
    const label = CATEGORY_LABELS[cat] || cat;
    const hint  = CATEGORY_HINTS[cat] || "";
    const card = document.createElement("div");
    card.className = "cat-card";
    card.innerHTML = `
      <div class="cat-title">${label}</div>
      <div class="cat-hint">${hint}</div>
      <div class="cat-count">${catWords.length} word${catWords.length !== 1 ? "s" : ""}</div>
      <div class="cat-card-actions">
        <button class="cat-btn" data-category="${cat}" type="button">Practice →</button>
        <button class="cat-btn-study" data-category="${cat}" type="button">Study →</button>
      </div>
    `;
    catGrid.appendChild(card);
  }
}

// Study card for Grade 1 and 5 — uses phonicPattern, commonMistake, memoryTip, sampleUsage.
function buildStudyCard(w) {
  const e = (v) => v ? esc(v) : "";
  const pattern  = w.phonicPattern
    ? `<div class="vocab-card-def">Phonic pattern: ${e(w.phonicPattern)}</div>` : "";
  const mistake  = w.commonMistake
    ? `<div class="vocab-meta-block"><span class="vocab-meta-label">Watch out for:</span> ${e(w.commonMistake)}</div>` : "";
  return `
    <div class="vocab-card">
      <div class="vocab-card-word">${e(w.word)}</div>
      ${pattern}
      <div class="vocab-card-meta">${mistake}</div>
      <details class="vocab-card-extra">
        <summary>Memory tip &amp; example</summary>
        <div class="vocab-card-tip">${e(w.memoryTip)}</div>
        <div class="vocab-card-usage">"${e(w.sampleUsage)}"</div>
      </details>
    </div>`;
}

// Study card for UK 11+ — uses definition, synonyms, antonym, memoryTip, sampleUsage.
function buildVocabCard(w) {
  const e = (v) => v ? esc(v) : "";
  const syns = Array.isArray(w.synonyms) && w.synonyms.length
    ? w.synonyms.map(s => `<span class="vocab-chip">${e(s)}</span>`).join("")
    : "";
  const ant = w.antonym
    ? `<div class="vocab-meta-block"><span class="vocab-meta-label">Opposite:</span><div class="vocab-chips"><span class="vocab-chip antonym">${e(w.antonym)}</span></div></div>`
    : "";
  const synRow = syns
    ? `<div class="vocab-meta-block"><span class="vocab-meta-label">Similar:</span><div class="vocab-chips">${syns}</div></div>`
    : "";
  return `
    <div class="vocab-card">
      <div class="vocab-card-word">${e(w.word)}</div>
      <div class="vocab-card-def">${e(w.definition)}</div>
      <div class="vocab-card-meta">${synRow}${ant}</div>
      <details class="vocab-card-extra">
        <summary>Spelling tip &amp; example</summary>
        <div class="vocab-card-tip">${e(w.memoryTip)}</div>
        <div class="vocab-card-usage">"${e(w.sampleUsage)}"</div>
      </details>
    </div>`;
}

async function openVocabPanel(cat) {
  const all = await fetchWords();
  const catWords = all.filter(w => String(w.grade) === String(grade) && w.category === cat);
  vocabPanelTitle.textContent = CATEGORY_LABELS[cat] || cat;
  const is11Plus = String(grade) === "11+";
  vocabPanelContent.innerHTML = catWords.map(is11Plus ? buildVocabCard : buildStudyCard).join("");
  vocabPanel.hidden = false;
  vocabPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

vocabCloseBtn.onclick = () => { vocabPanel.hidden = true; };

catGrid.addEventListener("click", async (e) => {
  if (e.target.closest(".cat-btn-study")) {
    const cat = e.target.closest(".cat-btn-study").dataset.category;
    openVocabPanel(cat);
    return;
  }
  const btn = e.target.closest(".cat-btn");
  if (!btn) return;
  const cat = btn.dataset.category;
  categoryFilter = cat;
  filterLabel.textContent = CATEGORY_LABELS[cat] || cat;
  filterBar.hidden = false;
  switchTab("practice");
  await startPractice();
});

// ─── Event handlers ───────────────────────────────────────────────────────────
audioBtn.onclick = () => {
  if (!currentWordObj) { nextWordBtn.click(); return; }
  speakWord(currentWordObj.word);
  childInput.focus();
};

audioExampleBtn.onclick = () => {
  if (currentWordObj) speakWord(currentWordObj.sampleUsage);
};

nextWordBtn.onclick = () => {
  if (!words.length) { output.innerText = "🎉 All words at this level are mastered! Switch level or category to continue."; setGameBtnsDisabled(true); childInput.focus(); return; }
  tickSR();
  retryMode = false;
  dailySummaryContent.innerText = '';
  currentWordObj = getDueSRWord(words, lastWord) || selectRandomWord(words, session.words, lastWord);
  lastWord = currentWordObj.word;
  childInput.value = "";
  output.innerText = "Listening...";
  speakWord(currentWordObj.word);
  childInput.focus();
};

submitAnsBtn.onclick = () => {
  const userInput = childInput.value.trim();
  if (!currentWordObj) { output.innerText = 'Click "Hear a word" first.'; return; }
  if (!userInput) { childInput.focus(); return; }

  const target    = currentWordObj.word;
  const isCorrect = userInput.toLowerCase() === target.toLowerCase();

  if (isCorrect) {
    const wasAssisted = retryMode;
    retryMode = false;
    const newlyMastered = recordAttempt(session, target, true, null);
    scheduleSR(currentWordObj, true, wasAssisted);
    const syl = syllabify(target);
    output.innerHTML =
      buildWordleHTML(userInput, target) +
      `<div class="result-text">${newlyMastered
        ? `"${esc(target)}" mastered — won't appear again!`
        : 'Correct!'}</div>` +
      (syl !== target ? `<div class="syllable-line">Syllables: <strong>${esc(syl)}</strong></div>` : '');
    playCelebration();

  } else if (!retryMode) {
    retryMode = true;
    const phonicPattern = currentWordObj.phonicPattern || 'phonics pattern';
    recordAttempt(session, target, false, phonicPattern);
    scheduleSR(currentWordObj, false);
    output.innerHTML =
      buildWordleHTML(userInput, target) +
      `<div class="result-text retry-prompt">Not quite — try again!<br>` +
      `<span class="masked-word">${esc(buildMaskedHint(target))}</span></div>`;
    childInput.value = '';
    childInput.focus();

  } else {
    retryMode = false;
    const memoryTip = currentWordObj.memoryTip || 'try sounding it out slowly';
    const syl = syllabify(target);
    output.innerHTML =
      buildWordleHTML(userInput, target) +
      `<div class="result-text">The word is: <strong>${esc(target)}</strong><br>` +
      `Tip: ${esc(memoryTip)}` +
      (syl !== target ? `<br>Syllables: <strong>${esc(syl)}</strong>` : '') +
      `</div>`;
  }
};

showSummaryBtn.onclick = () => {
  const summary = buildSummary(session);
  dailySummaryContent.innerText = formatSummaryText(summary);
};

childInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); submitAnsBtn.click(); }
});

// ─── Initial load ─────────────────────────────────────────────────────────────
const _savedChild = localStorage.getItem(CURRENT_CHILD_KEY);
if (_savedChild) {
  await selectChild(_savedChild);
} else {
  showChildPicker();
}
