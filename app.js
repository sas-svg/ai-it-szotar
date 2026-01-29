const searchBtn = document.getElementById("searchBtn");
const input = document.getElementById("searchInput");

const termView = document.getElementById("termView");
const termTitle = document.getElementById("termTitle");
const shortDef = document.getElementById("shortDef");
const longDef = document.getElementById("longDef");
const example = document.getElementById("example");
const savedList = document.getElementById("savedList");
const status = document.getElementById("status");

// ONLINE / OFFLINE FIGYELÉS
function updateStatus() {
  if (navigator.onLine) {
    status.textContent = "● Online";
    status.className = "status online";
  } else {
    status.textContent = "● Offline";
    status.className = "status offline";
  }
}
window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);
updateStatus();

// IDEIGLENES AI HELYŐRZŐ
async function fetchTerm(term, level) {
  return {
    title: term,
    short: "Ez egy ideiglenes AI magyarázat.",
    long: "Itt lesz a részletes AI által generált magyarázat.",
    example: "Példa használatra."
  };
}

// KERESÉS
searchBtn.addEventListener("click", async () => {
  const term = input.value.trim();
  if (!term) return;

  const data = await fetchTerm(term, "beginner");

  termTitle.textContent = data.title;
  shortDef.textContent = data.short;
  longDef.textContent = data.long;
  example.textContent = data.example;

  termView.classList.remove("hidden");
});

// MENTETT FOGALMAK (LOCALSTORAGE – MVP)
document.getElementById("saveBtn").addEventListener("click", () => {
  const term = termTitle.textContent;
  if (!term) return;

  let saved = JSON.parse(localStorage.getItem("savedTerms") || "[]");
  if (!saved.includes(term)) {
    saved.push(term);
    localStorage.setItem("savedTerms", JSON.stringify(saved));
    renderSaved();
  }
});

function renderSaved() {
  savedList.innerHTML = "";
  const saved = JSON.parse(localStorage.getItem("savedTerms") || "[]");
  saved.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    savedList.appendChild(li);
  });
}
renderSaved();
