let db;

const DB_NAME = "ai_it_szotar";
const DB_VERSION = 1;
const STORE_NAME = "terms";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "keyword"
        });

        store.createIndex("keyword", "keyword", { unique: true });
        store.createIndex("savedAt", "savedAt", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = () => reject("IndexedDB hiba");
  });
}

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
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_API_KEY_HERE"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Te egy informatikai szótár vagy. 
          Válaszolj JSON formátumban:
          short, long, example.
          Magyarázati szint: ${level}`
        },
        {
          role: "user",
          content: term
        }
      ],
      temperature: 0.3
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
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
document.getElementById("saveBtn").addEventListener("click", async () => {
  if (!termTitle.textContent) return;

  const termData = {
    keyword: termTitle.textContent,
    shortDef: shortDef.textContent,
    longDef: longDef.textContent,
    example: example.textContent,
    savedAt: new Date().toISOString()
  };

  const database = await openDB();
  const tx = database.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  store.put(termData);

  tx.oncomplete = renderSavedFromDB;
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
async function renderSavedFromDB() {
  const database = await openDB();
  const tx = database.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  const request = store.getAll();

  request.onsuccess = () => {
    savedList.innerHTML = "";

    request.result.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.keyword;
      li.onclick = () => loadFromDB(item.keyword);
      savedList.appendChild(li);
    });
  };
}
async function loadFromDB(keyword) {
  const database = await openDB();
  const tx = database.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  const request = store.get(keyword);

  request.onsuccess = () => {
    const data = request.result;
    if (!data) return;

    termTitle.textContent = data.keyword;
    shortDef.textContent = data.shortDef;
    longDef.textContent = data.longDef;
    example.textContent = data.example;

    termView.classList.remove("hidden");
  };
}
document.addEventListener("DOMContentLoaded", () => {
  openDB().then(renderSavedFromDB);
});





