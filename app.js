
// ─── DOM refs ────────────────────────────────────────────────────────────────
const statusEl        = document.getElementById("status");
const audioBtn        = document.getElementById("hear-btn");
const audioExampleBtn = document.getElementById("hear-ex-btn");
const nextWordBtn     = document.getElementById("next-word-btn");
const submitAnsBtn    = document.getElementById("submit-ans-btn");
const grade1Btn       = document.getElementById("grade-1-btn");
const grade5Btn       = document.getElementById("grade-5-btn");
const childInput      = document.getElementById("child-input");
const output          = document.getElementById("output");
const celebration     = document.getElementById("celebration");
const showSummaryBtn  = document.getElementById("show-summary-btn");
const dailySummaryContent = document.getElementById("daily-summary-content");
const exportMasteredBtn   = document.getElementById("export-mastered-btn");
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
  "suffix-ness-ful-less": "-ness / -ment / -less",
  "prefix-words":         "Prefixes re-, un-, dis-",
  "soft-c-g":             "Soft c & g sounds",
  "double-consonant":     "Double consonants",
  "vowel-teams":          "Vowel teams",
  "consonant-patterns":   "ch, ph, tch patterns",
  "homophones":           "Easily confused pairs",
  "math-science":         "Math & science terms",
  "general-spelling":     "General spelling",
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
  "suffix-ness-ful-less": "kindness · movement · useless",
  "prefix-words": "re- · un- · dis- · mis- — re=again · un=not · dis=opposite · mis=wrongly",
  "soft-c-g": "centre · gentle · giant — c or g before e, i, or y → soft sound: c→s, g→j",
  "double-consonant": "address · mirror · beginning",
  "vowel-teams": "could · journey · beautiful",
  "consonant-patterns": "phone · watch · cheer — ph makes f sound · tch comes after a short vowel",
  "homophones": "steal/steel · weather/whether",
  "math-science": "fraction · element · planet",
  "general-spelling": "mixed vocabulary practice",
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
  "suffix-tion-sion","suffix-ous-ious","suffix-ness-ful-less",
  "prefix-words","soft-c-g","double-consonant","vowel-teams",
  "consonant-patterns","homophones","math-science","general-spelling",
];

// ─── Mastery helpers ─────────────────────────────────────────────────────────
// A word is mastered when correctly spelled 3 times in a row (streak >= 3).
// Mastered words are excluded from practice and can be exported.

const MASTERY_STREAK = 3;

function masteryKey(g)  { return `spellquest_mastered_g${g}`; }
function lifetimeKey(g) { return `spellquest_lifetime_g${g}`; }

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

// ─── State ───────────────────────────────────────────────────────────────────
const SESSION_KEY = (g) =>
  `spellquest_session_g${g}_${new Date().toISOString().slice(0, 10)}`;
let currentWordObj = null;
let lastWord       = null;
let grade          = 5;
let difficulty     = 2;
let categoryFilter = null;
let session        = loadTodaySession(grade);
let words          = [];
let allWordsCache  = null;
let masteredWords  = loadMasteredSet(grade);

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
  session = loadTodaySession(grade);
  masteredWords = loadMasteredSet(grade);

  if (categoryFilter) {
    statusEl.innerText = `Loading "${CATEGORY_LABELS[categoryFilter] || categoryFilter}"...`;
    words = await loadWordsForGrade(grade, difficulty, categoryFilter);
  } else {
    statusEl.innerText = `Loading grade ${grade}, level ${difficulty}...`;
    words = await loadWordsForGrade(grade, difficulty, null);
  }

  const label = categoryFilter
    ? `"${CATEGORY_LABELS[categoryFilter] || categoryFilter}"`
    : `grade ${grade}, level ${difficulty}`;
  statusEl.innerText = words.length
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
  await startPractice();
}
grade1Btn.onclick = () => selectGrade(1);
grade5Btn.onclick = () => selectGrade(5);

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
  words = await loadWordsForGrade(grade, difficulty, null);
  statusEl.innerText = words.length
    ? `Loaded ${words.length} words for grade ${grade}, level ${difficulty}.`
    : `No words found for grade ${grade}, level ${difficulty}.`;
  setGameBtnsDisabled(words.length === 0);
  currentWordObj = null;
};

// ─── Read-only input until focused (prevents iOS auto-keyboard) ──────────────
childInput.setAttribute("readonly", "true");
childInput.addEventListener("focus", () => childInput.removeAttribute("readonly"));

// ─── Word loading ─────────────────────────────────────────────────────────────
async function fetchWords() {
  if (!allWordsCache) {
    allWordsCache = await fetch("words.json").then((r) => r.json());
  }
  return allWordsCache;
}

async function loadWordsForGrade(g, diff, cat) {
  const all = await fetchWords();
  return all
    .filter((w) => {
      if (Number(w.grade) !== Number(g)) return false;
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
  if (!lifetime[wordKey]) lifetime[wordKey] = { correct: 0, errors: 0, streak: 0 };
  if (correct) {
    lifetime[wordKey].correct += 1;
    lifetime[wordKey].streak += 1;
  } else {
    lifetime[wordKey].errors += 1;
    lifetime[wordKey].streak = 0;
  }
  saveLifetime(grade, lifetime);

  // Check mastery threshold
  const newlyMastered =
    !masteredWords.has(wordKey) && lifetime[wordKey].streak >= MASTERY_STREAK;
  if (newlyMastered) {
    masteredWords.add(wordKey);
    saveMasteredSet(grade, masteredWords);
    // Remove from the current session pool immediately
    words = words.filter((w) => w.word.toLowerCase() !== wordKey);
  }

  return newlyMastered;
}

// ─── Speech ──────────────────────────────────────────────────────────────────
function speakWord(word) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.5;
  utterance.pitch = 1.1;
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
    lines.push(`Total mastered words (all time): ${masteredWords.size}`);
    lines.push(`These words won't appear in practice. Export below to update your word files.`);
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
  const gradeWords = all.filter((w) => Number(w.grade) === Number(g));
  const byCategory = {};
  for (const w of gradeWords) {
    const cat = w.category || "general-spelling";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(w);
  }
  const order = g === 1 ? G1_CAT_ORDER : G5_CAT_ORDER;
  const sorted = Object.keys(byCategory).sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1; if (ib === -1) return -1;
    return ia - ib;
  });
  catGrid.innerHTML = "";
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
      <button class="cat-btn" data-category="${cat}" type="button">Practice →</button>
    `;
    catGrid.appendChild(card);
  }
}

catGrid.addEventListener("click", async (e) => {
  const btn = e.target.closest(".cat-btn");
  if (!btn) return;
  const cat = btn.dataset.category;
  categoryFilter = cat;
  filterLabel.textContent = CATEGORY_LABELS[cat] || cat;
  filterBar.hidden = false;
  switchTab("practice");
  words = await loadWordsForGrade(grade, difficulty, cat);
  statusEl.innerText = words.length
    ? `Loaded ${words.length} words for "${CATEGORY_LABELS[cat] || cat}".`
    : `No words found for "${CATEGORY_LABELS[cat] || cat}".`;
  setGameBtnsDisabled(words.length === 0);
  currentWordObj = null;
  output.innerText = words.length ? `Ready! Click "Next word" to start.` : `No words in this category yet.`;
});

// ─── Export mastered words ───────────────────────────────────────────────────
exportMasteredBtn.onclick = async () => {
  if (masteredWords.size === 0) return;
  const all = await fetchWords();
  const masteredObjs = all.filter(
    (w) => Number(w.grade) === Number(grade) && masteredWords.has(w.word.toLowerCase())
  );
  const json = JSON.stringify(masteredObjs, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mastered_grade${grade}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Event handlers ───────────────────────────────────────────────────────────
audioBtn.onclick = () => {
  if (!currentWordObj) { output.innerText = 'Click "Next word" first.'; childInput.focus(); return; }
  output.innerText = "Listening again...";
  speakWord(currentWordObj.word);
  childInput.focus();
};

audioExampleBtn.onclick = () => {
  if (currentWordObj) speakWord(currentWordObj.sampleUsage);
};

nextWordBtn.onclick = () => {
  if (!words.length) { output.innerText = "Words are still loading. Please wait."; childInput.focus(); return; }
  currentWordObj = selectRandomWord(words, session.words, lastWord);
  lastWord = currentWordObj.word;
  childInput.value = "";
  output.innerText = "Listening...";
  speakWord(currentWordObj.word);
  childInput.focus();
};

submitAnsBtn.onclick = () => {
  const userInput = childInput.value.trim().toLowerCase();
  if (!currentWordObj) { output.innerText = 'Click "Hear a word" first.'; return; }

  let errorType = null;

  if (userInput === currentWordObj.word.toLowerCase()) {
    const newlyMastered = recordAttempt(session, currentWordObj.word, true, null);
    if (newlyMastered) {
      output.innerText = `Correct! "${currentWordObj.word}" mastered — it won't appear again.`;
      playCelebration();
    } else {
      output.innerText = "Correct!";
      playCelebration();
    }
  } else {
    const phonicPattern = currentWordObj.phonicPattern || "phonics pattern";
    const memoryTip = currentWordObj.memoryTip || "try sounding it out slowly";
    errorType = phonicPattern;
    recordAttempt(session, currentWordObj.word, false, errorType);
    output.innerText = `Not quite.\n\nWord: ${currentWordObj.word}\nMemory tip: ${memoryTip}`;
  }
};

showSummaryBtn.onclick = () => {
  const summary = buildSummary(session);
  dailySummaryContent.innerText = formatSummaryText(summary);
  exportMasteredBtn.hidden = masteredWords.size === 0;
};

childInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); submitAnsBtn.click(); }
});

// ─── Initial load ─────────────────────────────────────────────────────────────
try {
  await startPractice();
} catch (e) {
  statusEl.innerText = `Error loading words: ${e.message}`;
}
