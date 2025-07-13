// game.js

// --- CONFIG ---
const MAX_GUESSES = 15;

// Initialize Fuse.js
const fuse = new Fuse(languageList, {
    threshold: 0.4, // Adjust fuzziness (lower = stricter)
    includeScore: true,
    keys: []
});

const input = document.getElementById('guess-input');
const suggestionsList = document.getElementById('suggestions');

// Update suggestions as the user types
input.addEventListener('input', () => {
    const results = fuse.search(input.value).slice(0, 5);
    suggestionsList.innerHTML = '';
    results.forEach(result => {
        const li = document.createElement('li');
        li.textContent = result.item;
        li.addEventListener('click', () => {
            input.value = result.item;
            suggestionsList.innerHTML = '';
        });
        suggestionsList.appendChild(li);
    });
});

// Hide suggestions on submit
document.getElementById('submit-button').addEventListener('click', () => {
    suggestionsList.innerHTML = '';
});

// pick daily language based on date (simple seed)
function getTargetLang() {
  const langs = Object.keys(LANGUAGE_DATA);
  const epoch = new Date(2025,6,12); // July 12, 2025
  const today = new Date();
  const days = Math.floor((today - epoch) / (1000*60*60*24));
  return langs[days % langs.length];
}

// find lowest common classification
function lowestShared(langA, langB) {
  const a = LANGUAGE_DATA[langA];
  const b = LANGUAGE_DATA[langB];
  if (!a || !b) return null;
  const shared = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) shared.push(a[i]);
    else break;
  }
  return shared.length ? shared[shared.length-1] : "No relation";
}

// --- GAME STATE ---
let guesses = [];
const target = getTargetLang();

// --- UI SETUP ---
const input = document.getElementById("guess-input");
const guessList = document.getElementById("guess-list");
const status = document.getElementById("status");
const guessBtn = document.getElementById("guess-btn");

function renderGuesses() {
  guessList.innerHTML = "";
  guesses.forEach(g => {
    const li = document.createElement("li");
    li.textContent = `${g.guess} → ${g.feedback}`;
    guessList.appendChild(li);
  });
}

function endGame(win) {
  input.disabled = true;
  guessBtn.disabled = true;
  status.textContent = win
    ? `🎉 Correct! It's ${target}.`
    : `😞 Out of guesses! It was ${target}.`;
}

guessBtn.addEventListener("click", () => {
  const g = input.value.trim();
  if (!LANGUAGE_DATA[g]) {
    alert("Unknown language or not in dataset.");
    return;
  }
  if (guesses.some(x => x.guess === g)) {
    alert("You've already guessed that.");
    return;
  }
  const fb = lowestShared(g, target);
  guesses.push({guess: g, feedback: fb});
  renderGuesses();
  input.value = "";
  if (g === target) {
    endGame(true);
  } else if (guesses.length >= MAX_GUESSES) {
    endGame(false);
  }
});

// initialize empty list
renderGuesses();
