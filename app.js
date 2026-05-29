import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1/dist/transformers.min.js";

const status = document.getElementById("status");
const audioBtn = document.getElementById("hear-btn");
const audioExampleBtn = document.getElementById('hear-ex-btn');
const nextWordBtn = document.getElementById("next-word-btn");
const submitAnsBtn = document.getElementById("submit-ans-btn");
const submitNameBtn = document.getElementById("submit-name-btn");
const childNameInput = document.getElementById("child-name");
const childInput = document.getElementById("child-input");
const output = document.getElementById("output");
const celebration = document.getElementById("celebration");
const showSummaryBtn = document.getElementById("show-summary-btn");
const dailySummaryContent = document.getElementById("daily-summary-content");

const SESSION_KEY = (g) =>
  `spellquest_session_g${g}_${new Date().toISOString().slice(0, 10)}`;
let currentWordObj = null;
let lastWord = null;
let grade = 5;
let session = loadTodaySession(grade);
let words = [];

childInput.setAttribute("readonly", "true");
childInput.addEventListener("focus", () => {
  childInput.removeAttribute("readonly");
});

async function loadWordsForGrade(grade) {
  const all = await fetch("words.json").then((r) => r.json());
  return all
    .filter((w) => Number(w.grade) === Number(grade))
    .map((w) => ({
      word: w.word,
      phonicPattern: w.phonicPattern,
      memoryTip: w.memoryTip,
      sampleUsage: w.sampleUsage,
    }));
}

function loadTodaySession(currentGrade) {
  try {
    const raw = localStorage.getItem(SESSION_KEY(currentGrade));
    return raw
      ? JSON.parse(raw)
      : { date: new Date().toISOString().slice(0, 10), words: {} };
  } catch {
    return { date: new Date().toISOString().slice(0, 10), words: {} };
  }
}

function recordAttempt(nextSession, word, correct, errorType = null) {
  if (!word) return nextSession;

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
  return nextSession;
}

function speakWord(word) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.5;
  utterance.pitch = 1.1;
  utterance.onerror = (event) => console.error("SpeechSynthesisUtterance error", event);
  window.speechSynthesis.speak(utterance);
}

function selectRandomWord(pool, wordStats, previousWord = null) {
  const candidates = pool.filter((entry) => entry.word !== previousWord);
  const usable = candidates.length ? candidates : pool;

  const weights = usable.map((entry) => {
    const stats = wordStats[entry.word];
    if (!stats) return 3;
    if (stats.errors === 0) return 0.5;
    return 1 + stats.errors * 2;
  });

  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < usable.length; i += 1) {
    rand -= weights[i];
    if (rand <= 0) return usable[i];
  }
  return usable[0];
}

function buildSummary(session) {
  const words = session.words;

  // Words with zero errors across ALL attempts
  const mastered = Object.entries(words)
    .filter(([, s]) => s.errors === 0 && s.correct > 0)
    .map(([word]) => word);

  // Words that had at least one error
  const struggling = Object.entries(words)
    .filter(([, s]) => s.errors > 0)
    .sort((a, b) => b[1].errors - a[1].errors) // worst first
    .map(([word, s]) => ({
      word,
      errors: s.errors,
      correct: s.correct,
      accuracy: Math.round((s.correct / (s.correct + s.errors)) * 100),
    }));

  // Tally error types across the whole session
  const errorTypeCounts = {};
  Object.values(words).forEach(({ errorTypes }) => {
    errorTypes.forEach((type) => {
      errorTypeCounts[type] = (errorTypeCounts[type] || 0) + 1;
    });
  });

  const topErrorTypes = Object.entries(errorTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));

  return { mastered, struggling, topErrorTypes, date: session.date };
}

function formatSummaryText(summary) {
  const lines = [];
  lines.push(`Date: ${summary.date}`);
  lines.push("");

  if (summary.mastered.length) {
    lines.push(`Mastered words (${summary.mastered.length}):`);
    lines.push(summary.mastered.join(", "));
    lines.push("");
  }

  if (summary.struggling.length) {
    lines.push("Words to keep practicing:");
    summary.struggling.forEach((s) => {
      lines.push(
        `- ${s.word}: ${s.errors} error(s), ${s.correct} correct (${s.accuracy}% accuracy)`
      );
    });
    lines.push("");
  }

  if (summary.topErrorTypes.length) {
    lines.push("Most common error types:");
    summary.topErrorTypes.forEach((e) => {
      lines.push(`- ${e.type}: ${e.count}`);
    });
  }

  if (lines.length === 2) {
    return "No attempts recorded yet today.";
  }

  return lines.join("\n");
}

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

  setTimeout(() => {
    celebration.innerHTML = "";
  }, 1200);
}

submitNameBtn.onclick = async () => {
  const name = childNameInput.value.trim();
  if (!name) {
    output.innerText = "Please enter your name first.";
    childNameInput.focus();
    return;
  }
  output.innerText = `Hi ${name}! Click "Hear a word" to begin.`;
  if (name.toLowerCase().startsWith("m")) {
    grade = 1;
  } else {
    grade = 5;
  }
  // Load or start a fresh session for this grade
  session = loadTodaySession(grade);
  status.innerText = `Loading words for grade ${grade}...`;
  words = await loadWordsForGrade(grade);
  status.innerText = words.length
    ? `Loaded ${words.length} words for grade ${grade}.`
    : `No words found for grade ${grade}.`;
  audioBtn.disabled = words.length === 0;
  nextWordBtn.disabled = words.length === 0;
  audioExampleBtn.disabled = words.length === 0;
  currentWordObj = null;
  childInput.focus();
};

audioBtn.onclick = () => {
  if (!currentWordObj) {
    output.innerText = "Click \"Next word\" first.";
    childInput.focus();
    return;
  }
  output.innerText = "Listening again...";
  speakWord(currentWordObj.word);
  childInput.focus();
};

audioExampleBtn.onclick = () => {
  speakWord(currentWordObj.sampleUsage);
}

nextWordBtn.onclick = () => {
  if (!words.length) {
    output.innerText = "Words are still loading. Please wait a moment.";
    childInput.focus();
    return;
  }
  currentWordObj = selectRandomWord(words, session.words, lastWord);
  lastWord = currentWordObj.word;
  childInput.value = "";
  output.innerText = "Listening...";
  speakWord(currentWordObj.word);
  childInput.focus();
};

submitAnsBtn.onclick = async () => {
  const userInput = childInput.value.trim().toLowerCase();
  if (!currentWordObj) {
    output.innerText = "Click \"Hear a word\" first.";
    return;
  }

  let isCorrect = false;
  let errorType = null;
  if (userInput === currentWordObj.word.toLowerCase()) {
    output.innerText = "Correct!";
    isCorrect = true;
    playCelebration();
  } else {
    // Use the word entry's phonics info directly (no model needed)
    const phonicPattern = currentWordObj.phonicPattern || "phonics pattern";
    const memoryTip = currentWordObj.memoryTip || "try sounding it out slowly";
    errorType = phonicPattern;
    output.innerText = `Not quite.\n\nWord: ${currentWordObj.word}\nMemory tip: ${memoryTip}`;
  }

  recordAttempt(session, currentWordObj.word, isCorrect, errorType);
};

showSummaryBtn.onclick = () => {
  const summary = buildSummary(session);
  dailySummaryContent.innerText = formatSummaryText(summary);
};

childNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitNameBtn.click();
  }
});

childInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitAnsBtn.click();
  }
});

try {
  words = await loadWordsForGrade(grade);
  if (!words.length) {
    status.innerText = `No words found for grade ${grade}.`;
  } else {
    status.innerText = `Loaded ${words.length} words. Ready!`;
  }
  audioBtn.disabled = words.length === 0;
  nextWordBtn.disabled = words.length === 0;
} catch (e) {
  status.innerText = `Error loading words: ${e.message}`;
}

/* try {
  let generator = null;
  generator = await pipeline("text-generation", "Xenova/TinyLlama-1.1B-Chat-v1.0");
  status.innerText = "Model loaded. Ready!";
  audioBtn.disabled = false;
} catch (e) {
  status.innerText = `Model failed to load: ${e.message}`;
  audioBtn.disabled = words.length === 0;
} */
